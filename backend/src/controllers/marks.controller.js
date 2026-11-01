const prisma = require('../config/prisma');

// Helper to calculate grade from percentage
const calculateGrade = (obtained, max) => {
  if (!max || max <= 0) return { grade: 'N/A', point: 0, status: 'N/A' };
  const percentage = (obtained / max) * 100;
  if (percentage >= 90) return { grade: 'A+', point: 10, status: 'PASS' };
  if (percentage >= 80) return { grade: 'A', point: 9, status: 'PASS' };
  if (percentage >= 70) return { grade: 'B', point: 8, status: 'PASS' };
  if (percentage >= 60) return { grade: 'C', point: 7, status: 'PASS' };
  if (percentage >= 50) return { grade: 'D', point: 6, status: 'PASS' };
  if (percentage >= 40) return { grade: 'E', point: 5, status: 'PASS' };
  return { grade: 'F', point: 0, status: 'FAIL' };
};

// Save or update marks in batch for a subject and exam type
const saveMarks = async (req, res) => {
  try {
    const { subjectId, examType, maxMarks, marksList } = req.body;
    let facultyId = req.user.role === 'FACULTY' ? req.user.facultyId : req.body.facultyId;

    if (!subjectId || !examType || !maxMarks || !marksList || !Array.isArray(marksList)) {
      return res.status(400).json({
        success: false,
        message: 'subjectId, examType, maxMarks, and marksList array are required.',
      });
    }

    const subject = await prisma.subject.findUnique({
      where: { id: parseInt(subjectId) },
    });

    if (!subject) {
      return res.status(404).json({ success: false, message: 'Subject not found.' });
    }

    if (!facultyId) {
      const assignment = await prisma.subjectAssignment.findFirst({
        where: { subjectId: parseInt(subjectId) },
      });
      facultyId = assignment ? assignment.facultyId : 1;
    }

    const numericMax = parseFloat(maxMarks);

    // Upsert each mark
    const operations = marksList.map((item) => {
      const obtained = parseFloat(item.marksObtained);
      const { grade } = calculateGrade(obtained, numericMax);

      return prisma.mark.upsert({
        where: {
          studentId_subjectId_examType: {
            studentId: parseInt(item.studentId),
            subjectId: parseInt(subjectId),
            examType: examType.toUpperCase().trim(),
          },
        },
        update: {
          marksObtained: obtained,
          maxMarks: numericMax,
          grade,
          remarks: item.remarks || null,
          facultyId: parseInt(facultyId),
        },
        create: {
          studentId: parseInt(item.studentId),
          subjectId: parseInt(subjectId),
          facultyId: parseInt(facultyId),
          examType: examType.toUpperCase().trim(),
          marksObtained: obtained,
          maxMarks: numericMax,
          grade,
          remarks: item.remarks || null,
        },
      });
    });

    await prisma.$transaction(operations);

    res.status(200).json({
      success: true,
      message: `Marks recorded successfully for ${marksList.length} students.`,
    });
  } catch (error) {
    console.error('Error saving marks:', error);
    res.status(500).json({ success: false, message: 'Failed to record marks.' });
  }
};

// Get marks for a subject and optionally examType
const getSubjectMarks = async (req, res) => {
  try {
    const { subjectId } = req.params;
    const { examType, section } = req.query;

    const subject = await prisma.subject.findUnique({
      where: { id: parseInt(subjectId) },
      include: { department: true },
    });

    if (!subject) {
      return res.status(404).json({ success: false, message: 'Subject not found.' });
    }

    // Get students in this department and semester
    const studentWhere = {
      departmentId: subject.departmentId,
      semester: subject.semester,
    };
    if (section) studentWhere.section = section.toUpperCase().trim();

    const students = await prisma.studentProfile.findMany({
      where: studentWhere,
      include: { user: { select: { name: true, email: true } } },
      orderBy: { rollNo: 'asc' },
    });

    const markWhere = { subjectId: parseInt(subjectId) };
    if (examType) markWhere.examType = examType.toUpperCase().trim();

    const marks = await prisma.mark.findMany({
      where: markWhere,
      include: {
        faculty: { include: { user: { select: { name: true } } } },
      },
    });

    // Map students with their marks
    const studentMarks = students.map((stu) => {
      const stuMarks = marks.filter((m) => m.studentId === stu.id);
      return {
        studentId: stu.id,
        rollNo: stu.rollNo,
        name: stu.user.name,
        section: stu.section,
        marks: stuMarks,
      };
    });

    // Calculate analytics
    const allObtained = marks.map((m) => m.marksObtained);
    const avg = allObtained.length > 0 ? (allObtained.reduce((a, b) => a + b, 0) / allObtained.length).toFixed(1) : 0;
    const highest = allObtained.length > 0 ? Math.max(...allObtained) : 0;
    const lowest = allObtained.length > 0 ? Math.min(...allObtained) : 0;
    const passingCount = marks.filter((m) => m.grade !== 'F').length;
    const passPercentage = marks.length > 0 ? Math.round((passingCount / marks.length) * 100) : 0;

    res.json({
      success: true,
      subject,
      analytics: {
        totalEvaluated: marks.length,
        average: parseFloat(avg),
        highest,
        lowest,
        passPercentage,
      },
      data: studentMarks,
    });
  } catch (error) {
    console.error('Error fetching subject marks:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch subject marks.' });
  }
};

// Get complete report card / marksheet for a student
const getStudentMarks = async (req, res) => {
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
        user: { select: { name: true, email: true } },
        department: true,
      },
    });

    if (!student) {
      return res.status(404).json({ success: false, message: 'Student not found.' });
    }

    // Get all subjects of student's department and semester
    const subjects = await prisma.subject.findMany({
      where: {
        departmentId: student.departmentId,
        semester: student.semester,
      },
    });

    // Get all marks for this student
    const marks = await prisma.mark.findMany({
      where: { studentId },
      include: {
        subject: true,
        faculty: { include: { user: { select: { name: true } } } },
      },
      orderBy: { subject: { code: 'asc' } },
    });

    // Group marks by subject
    const subjectWise = subjects.map((sub) => {
      const subMarks = marks.filter((m) => m.subjectId === sub.id);

      const ia1 = subMarks.find((m) => m.examType === 'IA1');
      const ia2 = subMarks.find((m) => m.examType === 'IA2');
      const midterm = subMarks.find((m) => m.examType === 'MIDTERM');
      const endsem = subMarks.find((m) => m.examType === 'ENDSEM');

      let totalObtained = 0;
      let totalMax = 0;

      subMarks.forEach((m) => {
        totalObtained += m.marksObtained;
        totalMax += m.maxMarks;
      });

      const percentage = totalMax > 0 ? Math.round((totalObtained / totalMax) * 100) : 0;
      const { grade, point, status } = calculateGrade(totalObtained, totalMax);

      return {
        subjectId: sub.id,
        subjectName: sub.name,
        subjectCode: sub.code,
        credits: sub.credits,
        ia1: ia1 ? { marksObtained: ia1.marksObtained, maxMarks: ia1.maxMarks, grade: ia1.grade } : null,
        ia2: ia2 ? { marksObtained: ia2.marksObtained, maxMarks: ia2.maxMarks, grade: ia2.grade } : null,
        midterm: midterm ? { marksObtained: midterm.marksObtained, maxMarks: midterm.maxMarks, grade: midterm.grade } : null,
        endsem: endsem ? { marksObtained: endsem.marksObtained, maxMarks: endsem.maxMarks, grade: endsem.grade } : null,
        totalObtained,
        totalMax,
        percentage,
        overallGrade: grade,
        gradePoint: point,
        status,
        allExamMarks: subMarks,
      };
    });

    // Calculate Semester CGPA / SGPA
    let totalCredits = 0;
    let earnedGradePoints = 0;
    let overallMarksObtained = 0;
    let overallMaxMarks = 0;

    subjectWise.forEach((item) => {
      if (item.totalMax > 0) {
        totalCredits += item.credits;
        earnedGradePoints += item.gradePoint * item.credits;
        overallMarksObtained += item.totalObtained;
        overallMaxMarks += item.totalMax;
      }
    });

    const sgpa = totalCredits > 0 ? (earnedGradePoints / totalCredits).toFixed(2) : '0.00';
    const overallPercentage = overallMaxMarks > 0 ? Math.round((overallMarksObtained / overallMaxMarks) * 100) : 0;
    const hasBacklogs = subjectWise.some((item) => item.status === 'FAIL');

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
        batch: student.batch,
      },
      summary: {
        sgpa: parseFloat(sgpa),
        overallPercentage,
        totalCredits,
        status: hasBacklogs ? 'Backlogs' : 'All Clear',
        evaluatedSubjects: subjectWise.filter((s) => s.totalMax > 0).length,
        totalSubjects: subjects.length,
      },
      reportCard: subjectWise,
    });
  } catch (error) {
    console.error('Error fetching student marks report:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch marks report.' });
  }
};

module.exports = {
  saveMarks,
  getSubjectMarks,
  getStudentMarks,
};
