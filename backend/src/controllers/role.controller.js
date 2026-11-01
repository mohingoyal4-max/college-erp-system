const bcrypt = require('bcryptjs');
const prisma = require('../config/prisma');

// Get all roles
const getAllRoles = async (req, res) => {
  try {
    const roles = await prisma.role.findMany({
      orderBy: { isSystem: 'desc' },
    });

    // Count users in each role
    const rolesWithCounts = await Promise.all(
      roles.map(async (r) => {
        const userCount = await prisma.user.count({ where: { role: r.name } });
        let permissions = [];
        try {
          permissions = JSON.parse(r.permissions);
        } catch (e) {
          permissions = [];
        }
        return {
          ...r,
          permissions,
          userCount,
        };
      })
    );

    res.json({ success: true, data: rolesWithCounts });
  } catch (error) {
    console.error('Error fetching roles:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch roles.' });
  }
};

// Create a new role
const createRole = async (req, res) => {
  try {
    const { name, displayName, description, permissions } = req.body;

    if (!name || !displayName) {
      return res.status(400).json({
        success: false,
        message: 'Role Identifier Name and Display Title are required.',
      });
    }

    const cleanName = name.toUpperCase().replace(/\s+/g, '_').trim();

    const existing = await prisma.role.findUnique({
      where: { name: cleanName },
    });
    if (existing) {
      return res.status(400).json({
        success: false,
        message: `Role "${cleanName}" already exists.`,
      });
    }

    const role = await prisma.role.create({
      data: {
        name: cleanName,
        displayName: displayName.trim(),
        description: description?.trim() || null,
        permissions: JSON.stringify(permissions || []),
        isSystem: false,
      },
    });

    res.status(201).json({
      success: true,
      message: `Role ${cleanName} created successfully.`,
      data: {
        ...role,
        permissions: JSON.parse(role.permissions),
      },
    });
  } catch (error) {
    console.error('Error creating role:', error);
    res.status(500).json({ success: false, message: 'Failed to create role.' });
  }
};

// Update an existing role
const updateRole = async (req, res) => {
  try {
    const { id } = req.params;
    const { displayName, description, permissions } = req.body;

    const existing = await prisma.role.findUnique({
      where: { id: parseInt(id) },
    });

    if (!existing) {
      return res.status(404).json({ success: false, message: 'Role not found.' });
    }

    const updated = await prisma.role.update({
      where: { id: parseInt(id) },
      data: {
        displayName: displayName?.trim() || existing.displayName,
        description: description !== undefined ? description?.trim() : existing.description,
        permissions: permissions ? JSON.stringify(permissions) : existing.permissions,
      },
    });

    res.json({
      success: true,
      message: 'Role updated successfully.',
      data: {
        ...updated,
        permissions: JSON.parse(updated.permissions),
      },
    });
  } catch (error) {
    console.error('Error updating role:', error);
    res.status(500).json({ success: false, message: 'Failed to update role.' });
  }
};

// Delete a role
const deleteRole = async (req, res) => {
  try {
    const { id } = req.params;
    const role = await prisma.role.findUnique({
      where: { id: parseInt(id) },
    });

    if (!role) {
      return res.status(404).json({ success: false, message: 'Role not found.' });
    }

    if (role.isSystem) {
      return res.status(400).json({
        success: false,
        message: 'System roles (ADMIN, FACULTY, STUDENT) cannot be deleted.',
      });
    }

    // Check if any users have this role
    const assignedUsers = await prisma.user.count({ where: { role: role.name } });
    if (assignedUsers > 0) {
      return res.status(400).json({
        success: false,
        message: `Cannot delete role "${role.name}" because ${assignedUsers} user(s) are assigned to it.`,
      });
    }

    await prisma.role.delete({ where: { id: parseInt(id) } });

    res.json({ success: true, message: `Role "${role.name}" deleted successfully.` });
  } catch (error) {
    console.error('Error deleting role:', error);
    res.status(500).json({ success: false, message: 'Failed to delete role.' });
  }
};

// Create a user assigned to a role
const createUserForRole = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password || !role) {
      return res.status(400).json({
        success: false,
        message: 'Name, email, password, and role are required.',
      });
    }

    const roleRecord = await prisma.role.findUnique({
      where: { name: role.toUpperCase().trim() },
    });

    if (!roleRecord) {
      return res.status(400).json({
        success: false,
        message: `Role "${role}" does not exist.`,
      });
    }

    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User with this email already exists.',
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: {
        name: name.trim(),
        email: email.toLowerCase().trim(),
        password: hashedPassword,
        role: roleRecord.name,
      },
    });

    res.status(201).json({
      success: true,
      message: `User created with role "${roleRecord.displayName}".`,
      data: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error('Error creating user for role:', error);
    res.status(500).json({ success: false, message: 'Failed to create user.' });
  }
};

module.exports = {
  getAllRoles,
  createRole,
  updateRole,
  deleteRole,
  createUserForRole,
};
