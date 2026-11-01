const prisma = require('../config/prisma');
const round = (n, d = 1) => Math.round(n * 10 ** d) / 10 ** d;
const pct = (a, b) => (b > 0 ? round((a / b) * 100) : 0);
const PRESENT = ['PRESENT', 'LATE'];
const SHORTAGE_LIMIT = 75;

// GET /reports/summary
const getAdminSummary = async (req, res) => {
  try {
    const [departments, users, students, facultyCount, subjects, notices, sessions, attGroups, marks, structures, studentRows, feeSums] = await Promise.all([
      prisma.department.findMany({ orderBy: { code: 'asc' } }),
      prisma.user.groupBy({ by: ['role'], _count: { _all: true } }),
      prisma.studentProfile.findMany({ select: { id: true, departmentId: true, semester: true } }),
      prisma.facultyProfile.groupBy({ by: ['departmentId'], _count: { _all: true } }),
      prisma.subject.count(),
      prisma.notice.findMany({ orderBy: { createdAt: 'desc' }, take: 5, select: { id: true, title: true, category: true, createdAt: true } }),
      prisma.attendanceSession.findMany({ select: { id: true, departmentId: true } }),
      prisma.attendanceRecord.groupBy({ by: ['studentId', 'status'], _count: { _all: true } }),
      prisma.mark.findMany({ select: { marksObtained: true, maxMarks: true, grade: true, student: { select: { departmentId: true } } } }),
      prisma.feeStructure.findMany(),
      prisma.studentProfile.findMany({ select: { id: true, departmentId: true, semester: true } }),
      prisma.feePayment.aggregate({ _sum: { amountPaid: true } }),
    ]);

    // Per-student attendance
    const att = {};
    attGroups.forEach((g) => {
      att[g.studentId] = att[g.studentId] || { present: 0, total: 0 };
      att[g.studentId].total += g._count._all;
      if (PRESENT.includes(g.status)) att[g.studentId].present += g._count._all;
    });
    const deptOf = Object.fromEntries(students.map((s) => [s.id, s.departmentId]));
    const facByDept = Object.fromEntries(facultyCount.map((f) => [f.departmentId, f._count._all]));

    // Expected fees
    let expected = 0;
    studentRows.forEach((s) => {
      structures.forEach((f) => {
        if (f.departmentId === s.departmentId && f.semester <= s.semester) expected += f.amount;
      });
    });
    const collected = feeSums._sum.amountPaid || 0;

    const byDepartment = departments.map((d) => {
      const dStudents = students.filter((s) => s.departmentId === d.id);
      let p = 0, t = 0;
      dStudents.forEach((s) => { if (att[s.id]) { p += att[s.id].present; t += att[s.id].total; } });
      const dMarks = marks.filter((m) => m.student.departmentId === d.id);
      return {
        id: d.id, code: d.code, name: d.name,
        students: dStudents.length, faculty: facByDept[d.id] || 0,
        attendancePercent: pct(p, t),
        avgMarksPercent: pct(dMarks.reduce((a, m) => a + m.marksObtained, 0), dMarks.reduce((a, m) => a + m.maxMarks, 0)),
        passPercent: pct(dMarks.filter((m) => m.grade !== 'F').length, dMarks.length),
      };
    });

    const allP = Object.values(att).reduce((a, x) => a + x.present, 0);
    const allT = Object.values(att).reduce((a, x) => a + x.total, 0);
    const shortage = students.filter((s) => att[s.id] && pct(att[s.id].present, att[s.id].total) < SHORTAGE_LIMIT).length;

    res.json({
      success: true,
      generatedAt: new Date().toISOString(),
      totals: {
        students: students.length,
        faculty: facultyCount.reduce((a, f) => a + f._count._all, 0),
        departments: departments.length,
        subjects,
        users: Object.fromEntries(users.map((u) => [u.role, u._count._all])),
      },
      attendance: { overallPercent: pct(allP, allT), sessionsConducted: sessions.length, shortageLimit: SHORTAGE_LIMIT, studentsInShortage: shortage },
      academics: {
        marksRecorded: marks.length,
        avgPercent: pct(marks.reduce((a, m) => a + m.marksObtained, 0), marks.reduce((a, m) => a + m.maxMarks, 0)),
        passPercent: pct(marks.filter((m) => m.grade !== 'F').length, marks.length),
      },
      fees: { expected: round(expected, 2), collected: round(collected, 2), outstanding: round(Math.max(expected - collected, 0), 2), collectionPercent: pct(collected, expected) },
      byDepartment,
      recentNotices: notices,
    });
  } catch (e) {
    console.error('getAdminSummary:', e);
    res.status(500).json({ success: false, message: 'Failed to build summary report.' });
  }
};

module.exports = { getAdminSummary };