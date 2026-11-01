const express = require('express');
const {
  markAttendance,
  getSessions,
  getSessionDetail,
  getStudentAttendance,
  getSubjectAttendanceStats,
} = require('../controllers/attendance.controller');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');

const router = express.Router();

router.use(authenticateToken);

// Mark attendance (Faculty or Admin)
router.post('/mark', authorizeRoles('FACULTY', 'ADMIN'), markAttendance);

// View attendance sessions history
router.get('/sessions', authorizeRoles('FACULTY', 'ADMIN'), getSessions);
router.get('/sessions/:id', authorizeRoles('FACULTY', 'ADMIN'), getSessionDetail);

// Subject-wide stats (Faculty or Admin)
router.get('/subject-stats', authorizeRoles('FACULTY', 'ADMIN'), getSubjectAttendanceStats);

// Student self-attendance summary
router.get('/my-attendance', authorizeRoles('STUDENT'), getStudentAttendance);

// View specific student's attendance summary (Admin or Faculty)
router.get('/student/:id', authorizeRoles('ADMIN', 'FACULTY'), getStudentAttendance);

module.exports = router;
