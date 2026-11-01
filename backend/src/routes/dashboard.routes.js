const express = require('express');
const {
  getAdminDashboard,
  getFacultyDashboard,
  getStudentDashboard,
} = require('../controllers/dashboard.controller');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');

const router = express.Router();

router.use(authenticateToken);

router.get('/admin', authorizeRoles('ADMIN'), getAdminDashboard);
router.get('/faculty', authorizeRoles('FACULTY'), getFacultyDashboard);
router.get('/student', authorizeRoles('STUDENT'), getStudentDashboard);

module.exports = router;
