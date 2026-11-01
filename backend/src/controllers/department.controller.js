const prisma = require('../config/prisma');

// Get all departments with student & faculty counts
const getAllDepartments = async (req, res) => {
  try {
    const departments = await prisma.department.findMany({
      include: {
        _count: {
          select: {
            students: true,
            faculty: true,
            subjects: true,
          },
        },
      },
      orderBy: { name: 'asc' },
    });
    res.json({ success: true, data: departments });
  } catch (error) {
    console.error('Error fetching departments:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch departments.' });
  }
};

// Create a department
const createDepartment = async (req, res) => {
  try {
    const { name, code, description } = req.body;
    if (!name || !code) {
      return res.status(400).json({ success: false, message: 'Name and Code are required.' });
    }

    const existing = await prisma.department.findUnique({
      where: { code: code.toUpperCase().trim() },
    });
    if (existing) {
      return res.status(400).json({ success: false, message: 'Department code already exists.' });
    }

    const department = await prisma.department.create({
      data: {
        name: name.trim(),
        code: code.toUpperCase().trim(),
        description: description?.trim() || null,
      },
    });

    res.status(201).json({ success: true, message: 'Department created successfully.', data: department });
  } catch (error) {
    console.error('Error creating department:', error);
    res.status(500).json({ success: false, message: 'Failed to create department.' });
  }
};

// Update department
const updateDepartment = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, code, description } = req.body;

    const updated = await prisma.department.update({
      where: { id: parseInt(id) },
      data: {
        name: name?.trim(),
        code: code?.toUpperCase().trim(),
        description: description?.trim(),
      },
    });

    res.json({ success: true, message: 'Department updated.', data: updated });
  } catch (error) {
    console.error('Error updating department:', error);
    res.status(500).json({ success: false, message: 'Failed to update department.' });
  }
};

// Delete department
const deleteDepartment = async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.department.delete({
      where: { id: parseInt(id) },
    });
    res.json({ success: true, message: 'Department deleted successfully.' });
  } catch (error) {
    console.error('Error deleting department:', error);
    res.status(500).json({ success: false, message: 'Failed to delete department.' });
  }
};

module.exports = {
  getAllDepartments,
  createDepartment,
  updateDepartment,
  deleteDepartment,
};
