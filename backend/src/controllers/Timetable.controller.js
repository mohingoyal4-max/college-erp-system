const prisma = require('../config/prisma');

const canManage = (u) => u.role === 'ADMIN' || (u.permissions || []).includes('timetable.manage');
const TIME = /^([01]\d|2[0-3]):[0-5]\d$/;
const include = {
  subject: { select: { id: true, name: true, code: true } },
  faculty: { select: { id: true, user: { select: { name: true } } } },
  department: { select: { code: true } },
};
const shape = (s) => ({
  id: s.id, departmentId: s.departmentId, semester: s.semester, section: s.section, dayOfWeek: s.dayOfWeek,
  startTime: s.startTime, endTime: s.endTime, room: s.room,
  subject: s.subject, facultyId: s.facultyId, facultyName: s.faculty?.user?.name, department: s.department?.code,
});
const order = [{ dayOfWeek: 'asc' }, { startTime: 'asc' }];

// GET /timetable/my  -> student: own class; faculty: own teaching slots
const getMyTimetable = async (req, res) => {
  try {
    let where;
    if (req.user.role === 'STUDENT' && req.user.studentId) {
      const st = await prisma.studentProfile.findUnique({ where: { id: req.user.studentId } });
      if (!st) return res.status(404).json({ success: false, message: 'Student not found.' });
      where = { departmentId: st.departmentId, semester: st.semester, section: st.section };
    } else if (req.user.facultyId) {
      where = { facultyId: req.user.facultyId };
    } else {
      return res.json({ success: true, data: [] });
    }
    const rows = await prisma.timetableSlot.findMany({ where, include, orderBy: order });
    res.json({ success: true, data: rows.map(shape) });
  } catch (e) {
    console.error('getMyTimetable:', e);
    res.status(500).json({ success: false, message: 'Failed to fetch timetable.' });
  }
};

// GET /timetable?departmentId=&semester=&section=
const getTimetable = async (req, res) => {
  try {
    const { departmentId, semester, section, facultyId } = req.query;
    const where = {};
    if (departmentId) where.departmentId = parseInt(departmentId);
    if (semester) where.semester = parseInt(semester);
    if (section) where.section = section.toUpperCase().trim();
    if (facultyId) where.facultyId = parseInt(facultyId);
    const rows = await prisma.timetableSlot.findMany({ where, include, orderBy: order });
    res.json({ success: true, data: rows.map(shape) });
  } catch (e) {
    console.error('getTimetable:', e);
    res.status(500).json({ success: false, message: 'Failed to fetch timetable.' });
  }
};

// Dropdown data for the management form
const getOptions = async (req, res) => {
  try {
    const [departments, subjects, faculty] = await Promise.all([
      prisma.department.findMany({ select: { id: true, name: true, code: true }, orderBy: { code: 'asc' } }),
      prisma.subject.findMany({ select: { id: true, name: true, code: true, departmentId: true, semester: true }, orderBy: { code: 'asc' } }),
      prisma.facultyProfile.findMany({ select: { id: true, departmentId: true, user: { select: { name: true } } } }),
    ]);
    res.json({ success: true, departments, subjects, faculty: faculty.map((f) => ({ id: f.id, departmentId: f.departmentId, name: f.user.name })) });
  } catch (e) {
    console.error('getOptions:', e);
    res.status(500).json({ success: false, message: 'Failed to load options.' });
  }
};

const validate = async (b, ignoreId) => {
  const departmentId = parseInt(b.departmentId), semester = parseInt(b.semester), subjectId = parseInt(b.subjectId), facultyId = parseInt(b.facultyId);
  const dayOfWeek = parseInt(b.dayOfWeek);
  const section = (b.section || '').toUpperCase().trim();
  const { startTime, endTime } = b;
  const room = b.room?.trim() || null;

  if (![departmentId, semester, subjectId, facultyId, dayOfWeek].every(Number.isInteger) || !section) return { error: 'department, semester, section, day, subject and faculty are required.' };
  if (dayOfWeek < 1 || dayOfWeek > 6) return { error: 'dayOfWeek must be 1 (Mon) to 6 (Sat).' };
  if (!TIME.test(startTime || '') || !TIME.test(endTime || '') || startTime >= endTime) return { error: 'Use HH:MM times, with end after start.' };

  const [subject, faculty] = await Promise.all([
    prisma.subject.findUnique({ where: { id: subjectId } }),
    prisma.facultyProfile.findUnique({ where: { id: facultyId } }),
  ]);
  if (!subject || !faculty) return { error: 'Subject or faculty not found.' };

  // Overlap checks on the same day
  const sameDay = await prisma.timetableSlot.findMany({
    where: { dayOfWeek, ...(ignoreId ? { id: { not: ignoreId } } : {}) },
    include: { subject: { select: { code: true } } },
  });
  for (const o of sameDay) {
    if (!(startTime < o.endTime && o.startTime < endTime)) continue;
    if (o.facultyId === facultyId) return { error: `Faculty already teaches ${o.subject.code} at ${o.startTime}-${o.endTime}.` };
    if (room && o.room && o.room.toLowerCase() === room.toLowerCase()) return { error: `Room ${room} is booked at ${o.startTime}-${o.endTime}.` };
    if (o.departmentId === departmentId && o.semester === semester && o.section === section) return { error: `This class already has ${o.subject.code} at ${o.startTime}-${o.endTime}.` };
  }
  return { data: { departmentId, semester, section, dayOfWeek, startTime, endTime, subjectId, facultyId, room } };
};

const createSlot = async (req, res) => {
  try {
    const v = await validate(req.body);
    if (v.error) return res.status(400).json({ success: false, message: v.error });
    const slot = await prisma.timetableSlot.create({ data: v.data, include });
    res.status(201).json({ success: true, message: 'Class added to timetable.', data: shape(slot) });
  } catch (e) {
    console.error('createSlot:', e);
    res.status(500).json({ success: false, message: 'Failed to add class.' });
  }
};

const updateSlot = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const existing = await prisma.timetableSlot.findUnique({ where: { id } });
    if (!existing) return res.status(404).json({ success: false, message: 'Slot not found.' });
    const v = await validate({ ...existing, ...req.body }, id);
    if (v.error) return res.status(400).json({ success: false, message: v.error });
    const slot = await prisma.timetableSlot.update({ where: { id }, data: v.data, include });
    res.json({ success: true, message: 'Timetable updated.', data: shape(slot) });
  } catch (e) {
    console.error('updateSlot:', e);
    res.status(500).json({ success: false, message: 'Failed to update class.' });
  }
};

const deleteSlot = async (req, res) => {
  try {
    await prisma.timetableSlot.delete({ where: { id: parseInt(req.params.id) } });
    res.json({ success: true, message: 'Class removed.' });
  } catch (e) {
    console.error('deleteSlot:', e);
    res.status(500).json({ success: false, message: 'Failed to remove class.' });
  }
};

module.exports = { getMyTimetable, getTimetable, getOptions, createSlot, updateSlot, deleteSlot, canManage };