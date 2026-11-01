const express = require('express');
const {
  saveMarks,
  getSubjectMarks,
  getStudentMarks,
} = require('../controllers/marks.controller');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');

const router = express.Router();

router.use(authenticateToken);

// Faculty / Admin saves marks for an exam
router.post('/save', authorizeRoles('FACULTY', 'ADMIN'), saveMarks);

// Subject-level marks
router.get('/subject/:subjectId', authorizeRoles('FACULTY', 'ADMIN'), getSubjectMarks);

// Student self-report card
router.get('/my-marks', authorizeRoles('STUDENT'), getStudentMarks);

// View specific student's marks (Admin, Faculty)
router.get('/student/:id', authorizeRoles('ADMIN', 'FACULTY'), getStudentMarks);

module.exports = router;
