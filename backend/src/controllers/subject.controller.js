const prisma = require('../config/prisma');

// Get all subjects with optional filters
const getAllSubjects = async (req, res) => {
  try {
    const { departmentId, semester } = req.query;
    const where = {};

    if (departmentId) where.departmentId = parseInt(departmentId);
    if (semester) where.semester = parseInt(semester);

    const subjects = await prisma.subject.findMany({
      where,
      include: {
        department: true,
        assignments: {
          include: {
            faculty: {
              include: { user: { select: { name: true, email: true } } },
            },
          },
        },
      },
      orderBy: [{ departmentId: 'asc' }, { semester: 'asc' }, { name: 'asc' }],
    });

    res.json({ success: true, data: subjects });
  } catch (error) {
    console.error('Error fetching subjects:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch subjects.' });
  }
};

// Create subject
const createSubject = async (req, res) => {
  try {
    const { name, code, departmentId, semester, credits, type } = req.body;

    if (!name || !code || !departmentId || !semester) {
      return res.status(400).json({ success: false, message: 'Name, code, department, and semester are required.' });
    }

    const existing = await prisma.subject.findUnique({
      where: { code: code.toUpperCase().trim() },
    });
    if (existing) {
      return res.status(400).json({ success: false, message: 'Subject code already exists.' });
    }

    const subject = await prisma.subject.create({
      data: {
        name: name.trim(),
        code: code.toUpperCase().trim(),
        departmentId: parseInt(departmentId),
        semester: parseInt(semester),
        credits: parseInt(credits) || 3,
        type: type || 'Theory',
      },
      include: { department: true },
    });

    res.status(201).json({ success: true, message: 'Subject created successfully.', data: subject });
  } catch (error) {
    console.error('Error creating subject:', error);
    res.status(500).json({ success: false, message: 'Failed to create subject.' });
  }
};

// Update subject
const updateSubject = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, code, departmentId, semester, credits, type } = req.body;

    const updated = await prisma.subject.update({
      where: { id: parseInt(id) },
      data: {
        name: name?.trim(),
        code: code?.toUpperCase().trim(),
        departmentId: departmentId ? parseInt(departmentId) : undefined,
        semester: semester ? parseInt(semester) : undefined,
        credits: credits ? parseInt(credits) : undefined,
        type: type || undefined,
      },
      include: { department: true },
    });

    res.json({ success: true, message: 'Subject updated successfully.', data: updated });
  } catch (error) {
    console.error('Error updating subject:', error);
    res.status(500).json({ success: false, message: 'Failed to update subject.' });
  }
};

// Delete subject
const deleteSubject = async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.subject.delete({
      where: { id: parseInt(id) },
    });
    res.json({ success: true, message: 'Subject deleted successfully.' });
  } catch (error) {
    console.error('Error deleting subject:', error);
    res.status(500).json({ success: false, message: 'Failed to delete subject.' });
  }
};

// Assign faculty to subject with section
const assignFacultyToSubject = async (req, res) => {
  try {
    const { subjectId, facultyId, section, academicYear } = req.body;

    if (!subjectId || !facultyId || !section) {
      return res.status(400).json({ success: false, message: 'Subject, faculty, and section are required.' });
    }

    const assignment = await prisma.subjectAssignment.upsert({
      where: {
        subjectId_facultyId_section_academicYear: {
          subjectId: parseInt(subjectId),
          facultyId: parseInt(facultyId),
          section: section.toUpperCase().trim(),
          academicYear: academicYear || '2025-2026',
        },
      },
      update: {},
      create: {
        subjectId: parseInt(subjectId),
        facultyId: parseInt(facultyId),
        section: section.toUpperCase().trim(),
        academicYear: academicYear || '2025-2026',
      },
      include: {
        subject: true,
        faculty: { include: { user: { select: { name: true } } } },
      },
    });

    res.json({ success: true, message: 'Faculty assigned successfully.', data: assignment });
  } catch (error) {
    console.error('Error assigning faculty:', error);
    res.status(500).json({ success: false, message: 'Failed to assign faculty.' });
  }
};

// Remove assignment
const removeFacultyAssignment = async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.subjectAssignment.delete({
      where: { id: parseInt(id) },
    });
    res.json({ success: true, message: 'Assignment removed successfully.' });
  } catch (error) {
    console.error('Error removing assignment:', error);
    res.status(500).json({ success: false, message: 'Failed to remove assignment.' });
  }
};

module.exports = {
  getAllSubjects,
  createSubject,
  updateSubject,
  deleteSubject,
  assignFacultyToSubject,
  removeFacultyAssignment,
};
