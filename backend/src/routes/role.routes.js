const express = require('express');
const {
  getAllRoles,
  createRole,
  updateRole,
  deleteRole,
  createUserForRole,
} = require('../controllers/role.controller');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');

const router = express.Router();

// Anyone can view available roles (useful for registration dropdown)
router.get('/', getAllRoles);

// Admin-only management routes
router.post('/', authenticateToken, authorizeRoles('ADMIN'), createRole);
router.put('/:id', authenticateToken, authorizeRoles('ADMIN'), updateRole);
router.delete('/:id', authenticateToken, authorizeRoles('ADMIN'), deleteRole);
router.post('/create-user', authenticateToken, authorizeRoles('ADMIN'), createUserForRole);

module.exports = router;
