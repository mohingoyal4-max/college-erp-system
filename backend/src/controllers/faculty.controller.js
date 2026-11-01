const bcrypt = require('bcryptjs');
const prisma = require('../config/prisma');

// Get all faculty
const getAllFaculty = async (req, res) => {
  try {
    const { departmentId, search } = req.query;
    const where = {};

    if (departmentId) where.departmentId = parseInt(departmentId);

    if (search) {
      where.OR = [
        { employeeId: { contains: search } },
        { user: { name: { contains: search } } },
        { user: { email: { contains: search } } },
        { designation: { contains: search } },
      ];
    }

    const faculty = await prisma.facultyProfile.findMany({
      where,
      include: {
        user: { select: { id: true, name: true, email: true, avatar: true } },
        department: true,
        assignments: {
          include: {
            subject: true,
          },
        },
      },
      orderBy: { employeeId: 'asc' },
    });

    res.json({ success: true, count: faculty.length, data: faculty });
  } catch (error) {
    console.error('Error fetching faculty:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch faculty.' });
  }
};

// Get single faculty by ID
const getFacultyById = async (req, res) => {
  try {
    const { id } = req.params;
    const faculty = await prisma.facultyProfile.findUnique({
      where: { id: parseInt(id) },
      include: {
        user: { select: { id: true, name: true, email: true, avatar: true } },
        department: true,
        assignments: {
          include: { subject: true },
        },
      },
    });

    if (!faculty) {
      return res.status(404).json({ success: false, message: 'Faculty not found.' });
    }

    res.json({ success: true, data: faculty });
  } catch (error) {
    console.error('Error fetching faculty details:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch faculty details.' });
  }
};

// Create a new faculty member (Transaction: User + FacultyProfile)
const createFaculty = async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      employeeId,
      departmentId,
      designation,
      qualification,
      phone,
      officeRoom,
    } = req.body;

    if (!name || !email || !employeeId || !departmentId || !designation || !qualification) {
      return res.status(400).json({
        success: false,
        message: 'Name, email, employeeId, department, designation, and qualification are required.',
      });
    }

    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
    });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'Email is already registered.' });
    }

    const existingEmployeeId = await prisma.facultyProfile.findUnique({
      where: { employeeId: employeeId.trim() },
    });
    if (existingEmployeeId) {
      return res.status(400).json({ success: false, message: 'Employee ID already exists.' });
    }

    const hashedPassword = await bcrypt.hash(password || 'faculty123', 10);

    const result = await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          name: name.trim(),
          email: email.toLowerCase().trim(),
          password: hashedPassword,
          role: 'FACULTY',
        },
      });

      const profile = await tx.facultyProfile.create({
        data: {
          userId: user.id,
          employeeId: employeeId.trim(),
          departmentId: parseInt(departmentId),
          designation: designation.trim(),
          qualification: qualification.trim(),
          phone: phone || null,
          officeRoom: officeRoom || null,
        },
        include: {
          user: { select: { id: true, name: true, email: true } },
          department: true,
        },
      });

      return profile;
    });

    res.status(201).json({ success: true, message: 'Faculty registered successfully.', data: result });
  } catch (error) {
    console.error('Error creating faculty:', error);
    res.status(500).json({ success: false, message: 'Failed to create faculty.' });
  }
};

// Update faculty profile
const updateFaculty = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, departmentId, designation, qualification, phone, officeRoom } = req.body;

    const faculty = await prisma.facultyProfile.findUnique({
      where: { id: parseInt(id) },
    });

    if (!faculty) {
      return res.status(404).json({ success: false, message: 'Faculty not found.' });
    }

    await prisma.$transaction(async (tx) => {
      if (name) {
        await tx.user.update({
          where: { id: faculty.userId },
          data: { name: name.trim() },
        });
      }

      await tx.facultyProfile.update({
        where: { id: parseInt(id) },
        data: {
          departmentId: departmentId ? parseInt(departmentId) : undefined,
          designation: designation?.trim(),
          qualification: qualification?.trim(),
          phone: phone !== undefined ? phone : undefined,
          officeRoom: officeRoom !== undefined ? officeRoom : undefined,
        },
      });
    });

    const updated = await prisma.facultyProfile.findUnique({
      where: { id: parseInt(id) },
      include: {
        user: { select: { id: true, name: true, email: true } },
        department: true,
      },
    });

    res.json({ success: true, message: 'Faculty updated successfully.', data: updated });
  } catch (error) {
    console.error('Error updating faculty:', error);
    res.status(500).json({ success: false, message: 'Failed to update faculty.' });
  }
};

// Delete faculty
const deleteFaculty = async (req, res) => {
  try {
    const { id } = req.params;
    const faculty = await prisma.facultyProfile.findUnique({
      where: { id: parseInt(id) },
    });

    if (!faculty) {
      return res.status(404).json({ success: false, message: 'Faculty not found.' });
    }

    await prisma.user.delete({
      where: { id: faculty.userId },
    });

    res.json({ success: true, message: 'Faculty deleted successfully.' });
  } catch (error) {
    console.error('Error deleting faculty:', error);
    res.status(500).json({ success: false, message: 'Failed to delete faculty.' });
  }
};

// Get assigned subjects and classes for logged-in or specified faculty
const getFacultyClasses = async (req, res) => {
  try {
    let facultyId;
    if (req.user.role === 'FACULTY') {
      facultyId = req.user.facultyId;
    } else {
      facultyId = parseInt(req.params.id);
    }

    if (!facultyId) {
      return res.status(400).json({ success: false, message: 'Faculty profile not found.' });
    }

    const assignments = await prisma.subjectAssignment.findMany({
      where: { facultyId },
      include: {
        subject: {
          include: { department: true },
        },
      },
      orderBy: { subject: { name: 'asc' } },
    });

    res.json({ success: true, data: assignments });
  } catch (error) {
    console.error('Error fetching faculty classes:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch faculty classes.' });
  }
};

module.exports = {
  getAllFaculty,
  getFacultyById,
  createFaculty,
  updateFaculty,
  deleteFaculty,
  getFacultyClasses,
};
