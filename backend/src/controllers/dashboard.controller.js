const prisma = require('../config/prisma');

// Admin Dashboard stats
const getAdminDashboard = async (req, res) => {
  try {
    const [
      totalStudents,
      totalFaculty,
      totalDepartments,
      totalSubjects,
      totalSessions,
      departments,
      recentSessions,
      recentNotices,
      recentStudents,
    ] = await Promise.all([
      prisma.studentProfile.count(),
      prisma.facultyProfile.count(),
      prisma.department.count(),
      prisma.subject.count(),
      prisma.attendanceSession.count(),
      prisma.department.findMany({
        include: {
          _count: {
            select: { students: true, faculty: true, subjects: true },
          },
        },
      }),
      prisma.attendanceSession.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: {
          subject: true,
          faculty: { include: { user: { select: { name: true } } } },
          _count: { select: { records: true } },
        },
      }),
      prisma.notice.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.studentProfile.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: {
          user: { select: { name: true, email: true } },
          department: true,
        },
      }),
    ]);

    // Calculate college-wide attendance rate
    const [presentCount, lateCount, totalRecords] = await Promise.all([
      prisma.attendanceRecord.count({ where: { status: 'PRESENT' } }),
      prisma.attendanceRecord.count({ where: { status: 'LATE' } }),
      prisma.attendanceRecord.count(),
    ]);

    const overallAttendance =
      totalRecords > 0 ? Math.round(((presentCount + lateCount) / totalRecords) * 100) : 100;

    res.json({
      success: true,
      stats: {
        totalStudents,
        totalFaculty,
        totalDepartments,
        totalSubjects,
        totalSessions,
        overallAttendance,
      },
      departments,
      recentSessions,
      recentNotices,
      recentStudents,
    });
  } catch (error) {
    console.error('Error fetching admin dashboard:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch admin stats.' });
  }
};

// Faculty Dashboard stats
const getFacultyDashboard = async (req, res) => {
  try {
    const facultyId = req.user.facultyId;
    if (!facultyId) {
      return res.status(400).json({ success: false, message: 'Faculty profile not found.' });
    }

    const [assignments, sessions, recentMarks] = await Promise.all([
      prisma.subjectAssignment.findMany({
        where: { facultyId },
        include: {
          subject: {
            include: {
              department: true,
            },
          },
        },
      }),
      prisma.attendanceSession.findMany({
        where: { facultyId },
        take: 6,
        orderBy: [{ date: 'desc' }, { createdAt: 'desc' }],
        include: {
          subject: true,
          _count: { select: { records: true } },
        },
      }),
      prisma.mark.findMany({
        where: { facultyId },
        take: 5,
        orderBy: { updatedAt: 'desc' },
        include: {
          subject: true,
          student: { include: { user: { select: { name: true } } } },
        },
      }),
    ]);

    // Calculate total unique students taught
    let totalStudentsTaught = 0;
    for (const a of assignments) {
      const count = await prisma.studentProfile.count({
        where: {
          departmentId: a.subject.departmentId,
          semester: a.subject.semester,
          section: a.section,
        },
      });
      totalStudentsTaught += count;
    }

    res.json({
      success: true,
      stats: {
        totalClassesAssigned: assignments.length,
        totalStudentsTaught,
        totalSessionsConducted: sessions.length,
      },
      assignedClasses: assignments,
      recentSessions: sessions,
      recentMarks,
    });
  } catch (error) {
    console.error('Error fetching faculty dashboard:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch faculty stats.' });
  }
};

// Student Dashboard stats
const getStudentDashboard = async (req, res) => {
  try {
    const studentId = req.user.studentId;
    if (!studentId) {
      return res.status(400).json({ success: false, message: 'Student profile not found.' });
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

    // Get subjects for student's department and semester
    const subjects = await prisma.subject.findMany({
      where: {
        departmentId: student.departmentId,
        semester: student.semester,
      },
    });

    // Attendance stats
    const records = await prisma.attendanceRecord.findMany({
      where: { studentId },
      include: { session: { include: { subject: true } } },
    });

    const totalClasses = records.length;
    const attended = records.filter((r) => r.status === 'PRESENT' || r.status === 'LATE').length;
    const attendancePercentage = totalClasses > 0 ? Math.round((attended / totalClasses) * 100) : 100;

    // Marks stats
    const marks = await prisma.mark.findMany({
      where: { studentId },
      include: { subject: true },
    });

    let totalObtained = 0;
    let totalMax = 0;
    marks.forEach((m) => {
      totalObtained += m.marksObtained;
      totalMax += m.maxMarks;
    });
    const marksPercentage = totalMax > 0 ? Math.round((totalObtained / totalMax) * 100) : 0;

    // Recent notices
    const notices = await prisma.notice.findMany({
      where: { targetRole: { in: ['ALL', 'STUDENT'] } },
      take: 4,
      orderBy: { createdAt: 'desc' },
    });

    res.json({
      success: true,
      student,
      stats: {
        enrolledSubjectsCount: subjects.length,
        attendancePercentage,
        isAttendanceShortage: attendancePercentage < 75,
        totalClassesAttended: attended,
        totalClassesConducted: totalClasses,
        evaluatedExamsCount: marks.length,
        marksPercentage,
      },
      enrolledSubjects: subjects,
      recentAttendance: records.slice(0, 5),
      recentMarks: marks.slice(0, 5),
      notices,
    });
  } catch (error) {
    console.error('Error fetching student dashboard:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch student stats.' });
  }
};

module.exports = {
  getAdminDashboard,
  getFacultyDashboard,
  getStudentDashboard,
};
