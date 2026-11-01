const prisma = require('../config/prisma');

// Mark attendance (creates session + records)
const markAttendance = async (req, res) => {
  try {
    const { subjectId, semester, section, date, timeSlot, topic, records } = req.body;
    let facultyId = req.user.role === 'FACULTY' ? req.user.facultyId : req.body.facultyId;

    if (!subjectId || !semester || !section || !date || !records || !Array.isArray(records)) {
      return res.status(400).json({
        success: false,
        message: 'subjectId, semester, section, date, and student records are required.',
      });
    }

    const subject = await prisma.subject.findUnique({
      where: { id: parseInt(subjectId) },
    });

    if (!subject) {
      return res.status(404).json({ success: false, message: 'Subject not found.' });
    }

    if (!facultyId) {
      // If admin marking, find assigned faculty or default to any
      const assignment = await prisma.subjectAssignment.findFirst({
        where: { subjectId: parseInt(subjectId), section: section.toUpperCase().trim() },
      });
      facultyId = assignment ? assignment.facultyId : 1;
    }

    const result = await prisma.$transaction(async (tx) => {
      // Check if session on this date, subject, timeSlot already exists to update
      let session = await tx.attendanceSession.findFirst({
        where: {
          subjectId: parseInt(subjectId),
          section: section.toUpperCase().trim(),
          date: date.trim(),
          timeSlot: timeSlot ? timeSlot.trim() : null,
        },
      });

      if (!session) {
        session = await tx.attendanceSession.create({
          data: {
            subjectId: parseInt(subjectId),
            facultyId: parseInt(facultyId),
            departmentId: subject.departmentId,
            semester: parseInt(semester),
            section: section.toUpperCase().trim(),
            date: date.trim(),
            timeSlot: timeSlot ? timeSlot.trim() : null,
            topic: topic ? topic.trim() : null,
          },
        });
      } else {
        // Update session topic/faculty if re-submitted
        session = await tx.attendanceSession.update({
          where: { id: session.id },
          data: {
            topic: topic ? topic.trim() : session.topic,
            facultyId: parseInt(facultyId),
          },
        });
        // Delete previous records to re-write
        await tx.attendanceRecord.deleteMany({
          where: { sessionId: session.id },
        });
      }

      // Bulk create records
      const recordData = records.map((r) => ({
        sessionId: session.id,
        studentId: parseInt(r.studentId),
        status: (r.status || 'PRESENT').toUpperCase(),
        remarks: r.remarks || null,
      }));

      await tx.attendanceRecord.createMany({
        data: recordData,
      });

      return session;
    });

    res.status(201).json({
      success: true,
      message: `Attendance marked successfully for ${records.length} students.`,
      sessionId: result.id,
    });
  } catch (error) {
    console.error('Error marking attendance:', error);
    res.status(500).json({ success: false, message: 'Failed to record attendance.' });
  }
};

// Get attendance sessions history (with filters)
const getSessions = async (req, res) => {
  try {
    const { subjectId, departmentId, semester, section, date, facultyId } = req.query;
    const where = {};

    if (subjectId) where.subjectId = parseInt(subjectId);
    if (departmentId) where.departmentId = parseInt(departmentId);
    if (semester) where.semester = parseInt(semester);
    if (section) where.section = section.toUpperCase().trim();
    if (date) where.date = date.trim();

    if (req.user.role === 'FACULTY') {
      where.facultyId = req.user.facultyId;
    } else if (facultyId) {
      where.facultyId = parseInt(facultyId);
    }

    const sessions = await prisma.attendanceSession.findMany({
      where,
      include: {
        subject: true,
        department: true,
        faculty: { include: { user: { select: { name: true } } } },
        _count: { select: { records: true } },
      },
      orderBy: [{ date: 'desc' }, { createdAt: 'desc' }],
    });

    res.json({ success: true, data: sessions });
  } catch (error) {
    console.error('Error fetching sessions:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch attendance sessions.' });
  }
};

// Get single session detail with student list and status
const getSessionDetail = async (req, res) => {
  try {
    const { id } = req.params;
    const session = await prisma.attendanceSession.findUnique({
      where: { id: parseInt(id) },
      include: {
        subject: true,
        faculty: { include: { user: { select: { name: true } } } },
        department: true,
        records: {
          include: {
            student: {
              include: { user: { select: { name: true, email: true } } },
            },
          },
          orderBy: { student: { rollNo: 'asc' } },
        },
      },
    });

    if (!session) {
      return res.status(404).json({ success: false, message: 'Session not found.' });
    }

    res.json({ success: true, data: session });
  } catch (error) {
    console.error('Error fetching session details:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch session detail.' });
  }
};

// Get comprehensive attendance summary for a student
const getStudentAttendance = async (req, res) => {
  try {
    let studentId;
    if (req.user.role === 'STUDENT') {
      studentId = req.user.studentId;
    } else {
      studentId = parseInt(req.params.id);
    }

    if (!studentId) {
      return res.status(400).json({ success: false, message: 'Student ID required.' });
    }

    const student = await prisma.studentProfile.findUnique({
      where: { id: studentId },
      include: {
        department: true,
        user: { select: { name: true, email: true } },
      },
    });

    if (!student) {
      return res.status(404).json({ success: false, message: 'Student not found.' });
    }

    // Fetch all attendance records for this student
    const records = await prisma.attendanceRecord.findMany({
      where: { studentId },
      include: {
        session: {
          include: {
            subject: true,
            faculty: { include: { user: { select: { name: true } } } },
          },
        },
      },
      orderBy: { session: { date: 'desc' } },
    });

    // Fetch subjects for this student's semester to ensure even 0-attendance subjects appear
    const enrolledSubjects = await prisma.subject.findMany({
      where: {
        departmentId: student.departmentId,
        semester: student.semester,
      },
    });

    // Calculate subject-wise stats
    const subjectMap = {};
    enrolledSubjects.forEach((sub) => {
      subjectMap[sub.id] = {
        subjectId: sub.id,
        name: sub.name,
        code: sub.code,
        credits: sub.credits,
        totalClasses: 0,
        present: 0,
        absent: 0,
        late: 0,
        percentage: 0,
        shortageWarning: false,
      };
    });

    let overallTotal = 0;
    let overallPresent = 0;
    let overallLate = 0;
    let overallAbsent = 0;

    records.forEach((rec) => {
      const subId = rec.session.subjectId;
      if (!subjectMap[subId]) {
        subjectMap[subId] = {
          subjectId: subId,
          name: rec.session.subject.name,
          code: rec.session.subject.code,
          credits: rec.session.subject.credits,
          totalClasses: 0,
          present: 0,
          absent: 0,
          late: 0,
          percentage: 0,
          shortageWarning: false,
        };
      }

      subjectMap[subId].totalClasses += 1;
      overallTotal += 1;

      if (rec.status === 'PRESENT') {
        subjectMap[subId].present += 1;
        overallPresent += 1;
      } else if (rec.status === 'LATE') {
        subjectMap[subId].late += 1;
        overallLate += 1;
      } else {
        subjectMap[subId].absent += 1;
        overallAbsent += 1;
      }
    });

    // Calculate percentages (Late counts as 0.75 or 1 present, let's treat Present + Late as attended)
    Object.values(subjectMap).forEach((stat) => {
      if (stat.totalClasses > 0) {
        stat.percentage = Math.round(((stat.present + stat.late) / stat.totalClasses) * 100);
        stat.shortageWarning = stat.percentage < 75;
      } else {
        stat.percentage = 100;
        stat.shortageWarning = false;
      }
    });

    const overallAttended = overallPresent + overallLate;
    const overallPercentage = overallTotal > 0 ? Math.round((overallAttended / overallTotal) * 100) : 100;

    res.json({
      success: true,
      student: {
        id: student.id,
        name: student.user.name,
        rollNo: student.rollNo,
        enrollmentNo: student.enrollmentNo,
        department: student.department.name,
        semester: student.semester,
        section: student.section,
      },
      summary: {
        totalClasses: overallTotal,
        attended: overallAttended,
        present: overallPresent,
        late: overallLate,
        absent: overallAbsent,
        percentage: overallPercentage,
        shortageWarning: overallPercentage < 75,
      },
      bySubject: Object.values(subjectMap),
      recentLogs: records.slice(0, 50).map((r) => ({
        id: r.id,
        date: r.session.date,
        timeSlot: r.session.timeSlot,
        subjectName: r.session.subject.name,
        subjectCode: r.session.subject.code,
        facultyName: r.session.faculty.user.name,
        status: r.status,
        remarks: r.remarks,
        topic: r.session.topic,
      })),
    });
  } catch (error) {
    console.error('Error fetching student attendance summary:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch student attendance.' });
  }
};

// Get subject attendance statistics across all students (for Faculty / Admin)
const getSubjectAttendanceStats = async (req, res) => {
  try {
    const { subjectId, section } = req.query;
    if (!subjectId) {
      return res.status(400).json({ success: false, message: 'subjectId is required.' });
    }

    const subject = await prisma.subject.findUnique({
      where: { id: parseInt(subjectId) },
      include: { department: true },
    });

    if (!subject) {
      return res.status(404).json({ success: false, message: 'Subject not found.' });
    }

    // Total sessions conducted for this subject & section
    const sessionWhere = { subjectId: parseInt(subjectId) };
    if (section) sessionWhere.section = section.toUpperCase().trim();

    const sessions = await prisma.attendanceSession.findMany({
      where: sessionWhere,
      select: { id: true, date: true },
    });

    const totalSessions = sessions.length;
    const sessionIds = sessions.map((s) => s.id);

    // Get all students of this department, semester, and section
    const studentWhere = {
      departmentId: subject.departmentId,
      semester: subject.semester,
    };
    if (section) studentWhere.section = section.toUpperCase().trim();

    const students = await prisma.studentProfile.findMany({
      where: studentWhere,
      include: {
        user: { select: { name: true, email: true } },
      },
      orderBy: { rollNo: 'asc' },
    });

    // Attendance records for these sessions
    const records = await prisma.attendanceRecord.findMany({
      where: { sessionId: { in: sessionIds } },
    });

    const studentStats = students.map((stu) => {
      const studentRecords = records.filter((r) => r.studentId === stu.id);
      const present = studentRecords.filter((r) => r.status === 'PRESENT').length;
      const late = studentRecords.filter((r) => r.status === 'LATE').length;
      const absent = studentRecords.filter((r) => r.status === 'ABSENT').length;
      const attended = present + late;
      const percentage = totalSessions > 0 ? Math.round((attended / totalSessions) * 100) : 0;

      return {
        studentId: stu.id,
        rollNo: stu.rollNo,
        name: stu.user.name,
        section: stu.section,
        totalSessions,
        attended,
        present,
        late,
        absent,
        percentage,
        isShortage: percentage < 75,
      };
    });

    const shortageStudentsCount = studentStats.filter((s) => s.isShortage).length;
    const avgAttendance =
      studentStats.length > 0
        ? Math.round(studentStats.reduce((acc, s) => acc + s.percentage, 0) / studentStats.length)
        : 0;

    res.json({
      success: true,
      subject: {
        id: subject.id,
        name: subject.name,
        code: subject.code,
        department: subject.department.name,
        semester: subject.semester,
        section: section || 'All',
      },
      totalSessions,
      totalStudents: students.length,
      avgAttendance,
      shortageStudentsCount,
      studentStats,
    });
  } catch (error) {
    console.error('Error fetching subject attendance stats:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch subject stats.' });
  }
};

module.exports = {
  markAttendance,
  getSessions,
  getSessionDetail,
  getStudentAttendance,
  getSubjectAttendanceStats,
};
