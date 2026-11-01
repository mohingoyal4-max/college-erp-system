const prisma = require('../config/prisma');

const canManage = (user) =>
  user.role === 'ADMIN' || (user.permissions || []).includes('fees.manage');

const round = (n) => Math.round(n * 100) / 100;

// Build the dues view for one student: every fee structure for their department
// up to their current semester, with paid / balance / status.
const buildStudentFees = async (student) => {
  const structures = await prisma.feeStructure.findMany({
    where: { departmentId: student.departmentId, semester: { lte: student.semester } },
    orderBy: [{ semester: 'asc' }, { feeType: 'asc' }],
  });
  const payments = await prisma.feePayment.findMany({
    where: { studentId: student.id },
    orderBy: { paidAt: 'desc' },
  });

  const today = new Date().toISOString().slice(0, 10);
  const items = structures.map((fs) => {
    const paid = round(payments.filter((p) => p.feeStructureId === fs.id).reduce((a, p) => a + p.amountPaid, 0));
    const balance = round(Math.max(fs.amount - paid, 0));
    let status = 'PENDING';
    if (balance === 0) status = 'PAID';
    else if (paid > 0) status = 'PARTIAL';
    if (balance > 0 && fs.dueDate && fs.dueDate < today) status = 'OVERDUE';
    return { ...fs, paid, balance, status, payments: payments.filter((p) => p.feeStructureId === fs.id) };
  });

  const totalFee = round(items.reduce((a, i) => a + i.amount, 0));
  const totalPaid = round(items.reduce((a, i) => a + i.paid, 0));
  return {
    student: {
      id: student.id,
      name: student.user?.name,
      rollNo: student.rollNo,
      department: student.department?.name,
      semester: student.semester,
      section: student.section,
    },
    summary: { totalFee, totalPaid, totalBalance: round(totalFee - totalPaid) },
    items,
  };
};

const loadStudent = (where) =>
  prisma.studentProfile.findUnique({
    where,
    include: { user: { select: { name: true } }, department: true },
  });

// GET /fees/structures  (managers: all, filterable; students: own department/semesters)
const getStructures = async (req, res) => {
  try {
    const where = {};
    if (canManage(req.user)) {
      if (req.query.departmentId) where.departmentId = parseInt(req.query.departmentId);
      if (req.query.semester) where.semester = parseInt(req.query.semester);
    } else if (req.user.role === 'STUDENT' && req.user.studentId) {
      const st = await prisma.studentProfile.findUnique({ where: { id: req.user.studentId } });
      if (!st) return res.status(404).json({ success: false, message: 'Student not found.' });
      where.departmentId = st.departmentId;
      where.semester = { lte: st.semester };
    } else {
      return res.status(403).json({ success: false, message: 'Forbidden.' });
    }
    const data = await prisma.feeStructure.findMany({
      where,
      include: { department: { select: { name: true, code: true } }, _count: { select: { payments: true } } },
      orderBy: [{ departmentId: 'asc' }, { semester: 'asc' }, { feeType: 'asc' }],
    });
    res.json({ success: true, data });
  } catch (e) {
    console.error('getStructures:', e);
    res.status(500).json({ success: false, message: 'Failed to fetch fee structure.' });
  }
};

const createStructure = async (req, res) => {
  try {
    const { departmentId, semester, feeType, amount, dueDate, academicYear, description } = req.body;
    const amt = parseFloat(amount);
    if (!departmentId || !semester || !feeType || !(amt > 0)) {
      return res.status(400).json({ success: false, message: 'departmentId, semester, feeType and a positive amount are required.' });
    }
    const dept = await prisma.department.findUnique({ where: { id: parseInt(departmentId) } });
    if (!dept) return res.status(404).json({ success: false, message: 'Department not found.' });

    const year = (academicYear || '2025-2026').trim();
    const type = feeType.toUpperCase().trim().replace(/\s+/g, '_');
    const exists = await prisma.feeStructure.findUnique({
      where: { departmentId_semester_feeType_academicYear: { departmentId: dept.id, semester: parseInt(semester), feeType: type, academicYear: year } },
    });
    if (exists) return res.status(400).json({ success: false, message: 'This fee already exists for that department, semester and year.' });

    const data = await prisma.feeStructure.create({
      data: {
        departmentId: dept.id, semester: parseInt(semester), feeType: type, amount: amt,
        dueDate: dueDate || null, academicYear: year, description: description?.trim() || null,
      },
    });
    res.status(201).json({ success: true, message: 'Fee added.', data });
  } catch (e) {
    console.error('createStructure:', e);
    res.status(500).json({ success: false, message: 'Failed to add fee.' });
  }
};

const updateStructure = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const { amount, dueDate, description } = req.body;
    const existing = await prisma.feeStructure.findUnique({ where: { id } });
    if (!existing) return res.status(404).json({ success: false, message: 'Fee not found.' });
    const data = {};
    if (amount !== undefined) {
      const amt = parseFloat(amount);
      if (!(amt > 0)) return res.status(400).json({ success: false, message: 'Amount must be positive.' });
      data.amount = amt;
    }
    if (dueDate !== undefined) data.dueDate = dueDate || null;
    if (description !== undefined) data.description = description?.trim() || null;
    const updated = await prisma.feeStructure.update({ where: { id }, data });
    res.json({ success: true, message: 'Fee updated.', data: updated });
  } catch (e) {
    console.error('updateStructure:', e);
    res.status(500).json({ success: false, message: 'Failed to update fee.' });
  }
};

const deleteStructure = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const count = await prisma.feePayment.count({ where: { feeStructureId: id } });
    if (count > 0) {
      return res.status(400).json({ success: false, message: `Cannot delete: ${count} payment(s) are recorded against this fee.` });
    }
    await prisma.feeStructure.delete({ where: { id } });
    res.json({ success: true, message: 'Fee deleted.' });
  } catch (e) {
    console.error('deleteStructure:', e);
    res.status(500).json({ success: false, message: 'Failed to delete fee.' });
  }
};

// GET /fees/my  (student)
const getMyFees = async (req, res) => {
  try {
    if (!req.user.studentId) return res.status(400).json({ success: false, message: 'No student profile on this account.' });
    const student = await loadStudent({ id: req.user.studentId });
    if (!student) return res.status(404).json({ success: false, message: 'Student not found.' });
    res.json({ success: true, ...(await buildStudentFees(student)) });
  } catch (e) {
    console.error('getMyFees:', e);
    res.status(500).json({ success: false, message: 'Failed to fetch fees.' });
  }
};

// GET /fees/student/:studentId  or  /fees/lookup?rollNo=  (managers)
const getStudentFees = async (req, res) => {
  try {
    let student;
    if (req.query.rollNo) student = await loadStudent({ rollNo: String(req.query.rollNo).trim() });
    else student = await loadStudent({ id: parseInt(req.params.studentId) });
    if (!student) return res.status(404).json({ success: false, message: 'Student not found.' });
    res.json({ success: true, ...(await buildStudentFees(student)) });
  } catch (e) {
    console.error('getStudentFees:', e);
    res.status(500).json({ success: false, message: 'Failed to fetch student fees.' });
  }
};

// POST /fees/payments  (managers)
const recordPayment = async (req, res) => {
  try {
    const { studentId, feeStructureId, amountPaid, method, reference, remarks } = req.body;
    const amt = parseFloat(amountPaid);
    if (!studentId || !feeStructureId || !(amt > 0)) {
      return res.status(400).json({ success: false, message: 'studentId, feeStructureId and a positive amountPaid are required.' });
    }
    const student = await prisma.studentProfile.findUnique({ where: { id: parseInt(studentId) } });
    const fs = await prisma.feeStructure.findUnique({ where: { id: parseInt(feeStructureId) } });
    if (!student || !fs) return res.status(404).json({ success: false, message: 'Student or fee not found.' });
    if (fs.departmentId !== student.departmentId) {
      return res.status(400).json({ success: false, message: 'This fee does not apply to the student\'s department.' });
    }

    const agg = await prisma.feePayment.aggregate({
      where: { studentId: student.id, feeStructureId: fs.id },
      _sum: { amountPaid: true },
    });
    const balance = round(fs.amount - (agg._sum.amountPaid || 0));
    if (amt > balance + 0.001) {
      return res.status(400).json({ success: false, message: `Amount exceeds outstanding balance (${balance}).` });
    }

    const allowed = ['CASH', 'UPI', 'CARD', 'BANK_TRANSFER', 'CHEQUE'];
    const m = (method || 'CASH').toUpperCase();
    const payment = await prisma.feePayment.create({
      data: {
        studentId: student.id,
        feeStructureId: fs.id,
        amountPaid: round(amt),
        method: allowed.includes(m) ? m : 'CASH',
        reference: reference?.trim() || null,
        remarks: remarks?.trim() || null,
        recordedById: req.user.id,
        receiptNo: `RCP-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`,
      },
    });
    res.status(201).json({ success: true, message: `Payment recorded. Receipt ${payment.receiptNo}.`, data: payment });
  } catch (e) {
    console.error('recordPayment:', e);
    res.status(500).json({ success: false, message: 'Failed to record payment.' });
  }
};

// GET /fees/summary  (managers): collected vs expected per fee, plus overall totals
const getSummary = async (req, res) => {
  try {
    const structures = await prisma.feeStructure.findMany({ include: { department: { select: { code: true } } } });
    const students = await prisma.studentProfile.findMany({ select: { departmentId: true, semester: true } });
    const sums = await prisma.feePayment.groupBy({ by: ['feeStructureId'], _sum: { amountPaid: true } });
    const paidBy = Object.fromEntries(sums.map((s) => [s.feeStructureId, s._sum.amountPaid || 0]));

    const rows = structures.map((fs) => {
      const applicable = students.filter((s) => s.departmentId === fs.departmentId && s.semester >= fs.semester).length;
      const expected = round(applicable * fs.amount);
      const collected = round(paidBy[fs.id] || 0);
      return {
        id: fs.id, department: fs.department.code, semester: fs.semester, feeType: fs.feeType,
        amount: fs.amount, students: applicable, expected, collected, outstanding: round(Math.max(expected - collected, 0)),
      };
    });
    const totals = rows.reduce(
      (t, r) => ({ expected: round(t.expected + r.expected), collected: round(t.collected + r.collected), outstanding: round(t.outstanding + r.outstanding) }),
      { expected: 0, collected: 0, outstanding: 0 }
    );
    res.json({ success: true, totals, data: rows });
  } catch (e) {
    console.error('getSummary:', e);
    res.status(500).json({ success: false, message: 'Failed to build summary.' });
  }
};

// GET /fees/report?status=&departmentId=&semester=  (managers): fee status for every student
const getFeeReport = async (req, res) => {
  try {
    const { status, departmentId, semester } = req.query;
    const sWhere = {};
    if (departmentId) sWhere.departmentId = parseInt(departmentId);
    if (semester) sWhere.semester = parseInt(semester);
    const [students, structures, sums] = await Promise.all([
      prisma.studentProfile.findMany({ where: sWhere, include: { user: { select: { name: true } }, department: { select: { code: true } } }, orderBy: { rollNo: 'asc' } }),
      prisma.feeStructure.findMany(),
      prisma.feePayment.groupBy({ by: ['studentId', 'feeStructureId'], _sum: { amountPaid: true } }),
    ]);
    const paidMap = {};
    sums.forEach((g) => { paidMap[g.studentId + ':' + g.feeStructureId] = g._sum.amountPaid || 0; });
    const today = new Date().toISOString().slice(0, 10);

    let rows = students.map((st) => {
      let totalFee = 0, paid = 0, overdue = false;
      structures.filter((f) => f.departmentId === st.departmentId && f.semester <= st.semester).forEach((f) => {
        const p = paidMap[st.id + ':' + f.id] || 0;
        totalFee += f.amount; paid += p;
        if (p < f.amount && f.dueDate && f.dueDate < today) overdue = true;
      });
      const balance = round(Math.max(totalFee - paid, 0));
      let st_ = 'PENDING';
      if (totalFee === 0) st_ = 'NO_FEES';
      else if (balance === 0) st_ = 'PAID';
      else if (overdue) st_ = 'OVERDUE';
      else if (paid > 0) st_ = 'PARTIAL';
      return { studentId: st.id, name: st.user.name, rollNo: st.rollNo, department: st.department.code, semester: st.semester, section: st.section, totalFee: round(totalFee), paid: round(paid), balance, status: st_ };
    });
    const counts = rows.reduce((c, r) => ({ ...c, [r.status]: (c[r.status] || 0) + 1 }), {});
    if (status) rows = rows.filter((r) => r.status === status.toUpperCase());
    res.json({ success: true, counts, data: rows });
  } catch (e) {
    console.error('getFeeReport:', e);
    res.status(500).json({ success: false, message: 'Failed to build fee report.' });
  }
};

module.exports = { getFeeReport, getStructures, createStructure, updateStructure, deleteStructure, getMyFees, getStudentFees, recordPayment, getSummary };