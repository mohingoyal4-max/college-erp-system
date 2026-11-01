const bcrypt = require('bcryptjs');
const prisma = require('../config/prisma');

// Get all students with filtering and pagination
const getAllStudents = async (req, res) => {
  try {
    const { departmentId, semester, section, search } = req.query;
    const where = {};

    if (departmentId) where.departmentId = parseInt(departmentId);
    if (semester) where.semester = parseInt(semester);
    if (section) where.section = section.toUpperCase().trim();

    if (search) {
      where.OR = [
        { rollNo: { contains: search } },
        { enrollmentNo: { contains: search } },
        { user: { name: { contains: search } } },
        { user: { email: { contains: search } } },
      ];
    }

    const students = await prisma.studentProfile.findMany({
      where,
      include: {
        user: { select: { id: true, name: true, email: true, avatar: true } },
        department: true,
      },
      orderBy: [{ semester: 'asc' }, { rollNo: 'asc' }],
    });

    res.json({ success: true, count: students.length, data: students });
  } catch (error) {
    console.error('Error fetching students:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch students.' });
  }
};

// Get single student by ID
const getStudentById = async (req, res) => {
  try {
    const { id } = req.params;
    const student = await prisma.studentProfile.findUnique({
      where: { id: parseInt(id) },
      include: {
        user: { select: { id: true, name: true, email: true, avatar: true } },
        department: true,
        marks: {
          include: {
            subject: true,
            faculty: { include: { user: { select: { name: true } } } },
          },
        },
      },
    });

    if (!student) {
      return res.status(404).json({ success: false, message: 'Student not found.' });
    }

    res.json({ success: true, data: student });
  } catch (error) {
    console.error('Error fetching student details:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch student details.' });
  }
};

// Create a new student (Transaction: User + StudentProfile)
const createStudent = async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      rollNo,
      enrollmentNo,
      departmentId,
      semester,
      section,
      batch,
      phone,
      dob,
      gender,
      bloodGroup,
      parentName,
      parentPhone,
      address,
    } = req.body;

    if (!name || !email || !rollNo || !enrollmentNo || !departmentId || !semester || !section) {
      return res.status(400).json({
        success: false,
        message: 'Name, email, rollNo, enrollmentNo, department, semester, and section are required.',
      });
    }

    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
    });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'Email is already registered.' });
    }

    const existingRoll = await prisma.studentProfile.findUnique({
      where: { rollNo: rollNo.trim() },
    });
    if (existingRoll) {
      return res.status(400).json({ success: false, message: 'Roll number already exists.' });
    }

    const existingEnrollment = await prisma.studentProfile.findUnique({
      where: { enrollmentNo: enrollmentNo.trim() },
    });
    if (existingEnrollment) {
      return res.status(400).json({ success: false, message: 'Enrollment number already exists.' });
    }

    const hashedPassword = await bcrypt.hash(password || 'student123', 10);

    const result = await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          name: name.trim(),
          email: email.toLowerCase().trim(),
          password: hashedPassword,
          role: 'STUDENT',
        },
      });

      const profile = await tx.studentProfile.create({
        data: {
          userId: user.id,
          rollNo: rollNo.trim(),
          enrollmentNo: enrollmentNo.trim(),
          departmentId: parseInt(departmentId),
          semester: parseInt(semester),
          section: section.toUpperCase().trim(),
          batch: batch || '2023-2027',
          phone: phone || null,
          dob: dob || null,
          gender: gender || null,
          bloodGroup: bloodGroup || null,
          parentName: parentName || null,
          parentPhone: parentPhone || null,
          address: address || null,
        },
        include: {
          user: { select: { id: true, name: true, email: true } },
          department: true,
        },
      });

      return profile;
    });

    res.status(201).json({ success: true, message: 'Student registered successfully.', data: result });
  } catch (error) {
    console.error('Error creating student:', error);
    res.status(500).json({ success: false, message: 'Failed to create student.' });
  }
};

// Update student profile
const updateStudent = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      name,
      departmentId,
      semester,
      section,
      batch,
      phone,
      dob,
      gender,
      bloodGroup,
      parentName,
      parentPhone,
      address,
    } = req.body;

    const student = await prisma.studentProfile.findUnique({
      where: { id: parseInt(id) },
    });

    if (!student) {
      return res.status(404).json({ success: false, message: 'Student not found.' });
    }

    await prisma.$transaction(async (tx) => {
      if (name) {
        await tx.user.update({
          where: { id: student.userId },
          data: { name: name.trim() },
        });
      }

      await tx.studentProfile.update({
        where: { id: parseInt(id) },
        data: {
          departmentId: departmentId ? parseInt(departmentId) : undefined,
          semester: semester ? parseInt(semester) : undefined,
          section: section ? section.toUpperCase().trim() : undefined,
          batch: batch || undefined,
          phone: phone !== undefined ? phone : undefined,
          dob: dob !== undefined ? dob : undefined,
          gender: gender !== undefined ? gender : undefined,
          bloodGroup: bloodGroup !== undefined ? bloodGroup : undefined,
          parentName: parentName !== undefined ? parentName : undefined,
          parentPhone: parentPhone !== undefined ? parentPhone : undefined,
          address: address !== undefined ? address : undefined,
        },
      });
    });

    const updated = await prisma.studentProfile.findUnique({
      where: { id: parseInt(id) },
      include: {
        user: { select: { id: true, name: true, email: true } },
        department: true,
      },
    });

    res.json({ success: true, message: 'Student updated successfully.', data: updated });
  } catch (error) {
    console.error('Error updating student:', error);
    res.status(500).json({ success: false, message: 'Failed to update student.' });
  }
};

// Delete student
const deleteStudent = async (req, res) => {
  try {
    const { id } = req.params;
    const student = await prisma.studentProfile.findUnique({
      where: { id: parseInt(id) },
    });

    if (!student) {
      return res.status(404).json({ success: false, message: 'Student not found.' });
    }

    // Deleting the user will cascade delete StudentProfile, AttendanceRecords, Marks
    await prisma.user.delete({
      where: { id: student.userId },
    });

    res.json({ success: true, message: 'Student deleted successfully.' });
  } catch (error) {
    console.error('Error deleting student:', error);
    res.status(500).json({ success: false, message: 'Failed to delete student.' });
  }
};

// Get subjects for student's department and semester
const getStudentSubjects = async (req, res) => {
  try {
    let studentId;
    if (req.user.role === 'STUDENT') {
      studentId = req.user.studentId;
    } else {
      studentId = parseInt(req.params.id);
    }

    const student = await prisma.studentProfile.findUnique({
      where: { id: studentId },
    });

    if (!student) {
      return res.status(404).json({ success: false, message: 'Student profile not found.' });
    }

    const subjects = await prisma.subject.findMany({
      where: {
        departmentId: student.departmentId,
        semester: student.semester,
      },
      include: {
        assignments: {
          where: { section: student.section },
          include: {
            faculty: {
              include: {
                user: { select: { name: true, email: true } },
              },
            },
          },
        },
      },
    });

    res.json({ success: true, data: subjects });
  } catch (error) {
    console.error('Error fetching student subjects:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch student subjects.' });
  }
};

module.exports = {
  getAllStudents,
  getStudentById,
  createStudent,
  updateStudent,
  deleteStudent,
  getStudentSubjects,
};
