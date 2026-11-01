const prisma = require('../config/prisma');

// Get all notices visible to the user
const getNotices = async (req, res) => {
  try {
    const role = req.user.role;
    const targetRoles = ['ALL'];
    if (role === 'STUDENT') targetRoles.push('STUDENT');
    if (role === 'FACULTY') targetRoles.push('FACULTY');
    if (role === 'ADMIN') targetRoles.push('STUDENT', 'FACULTY', 'ADMIN');

    const notices = await prisma.notice.findMany({
      where: {
        targetRole: { in: targetRoles },
      },
      include: {
        author: { select: { name: true, role: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: 20,
    });

    res.json({ success: true, data: notices });
  } catch (error) {
    console.error('Error fetching notices:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch notices.' });
  }
};

// Create a notice
const createNotice = async (req, res) => {
  try {
    const { title, content, targetRole, category } = req.body;

    if (!title || !content) {
      return res.status(400).json({ success: false, message: 'Title and content are required.' });
    }

    const notice = await prisma.notice.create({
      data: {
        title: title.trim(),
        content: content.trim(),
        targetRole: targetRole || 'ALL',
        category: category || 'GENERAL',
        authorId: req.user.id,
      },
      include: {
        author: { select: { name: true, role: true } },
      },
    });

    res.status(201).json({ success: true, message: 'Notice posted successfully.', data: notice });
  } catch (error) {
    console.error('Error creating notice:', error);
    res.status(500).json({ success: false, message: 'Failed to post notice.' });
  }
};

// Delete a notice
const deleteNotice = async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.notice.delete({
      where: { id: parseInt(id) },
    });
    res.json({ success: true, message: 'Notice deleted successfully.' });
  } catch (error) {
    console.error('Error deleting notice:', error);
    res.status(500).json({ success: false, message: 'Failed to delete notice.' });
  }
};

module.exports = {
  getNotices,
  createNotice,
  deleteNotice,
};
