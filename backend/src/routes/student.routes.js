const express = require('express');
const {
  getAllStudents,
  getStudentById,
  createStudent,
  updateStudent,
  deleteStudent,
  getStudentSubjects,
} = require('../controllers/student.controller');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');

const router = express.Router();

router.use(authenticateToken);

router.get('/my-subjects', authorizeRoles('STUDENT'), getStudentSubjects);
router.get('/', authorizeRoles('ADMIN', 'FACULTY'), getAllStudents);
router.get('/:id', authorizeRoles('ADMIN', 'FACULTY', 'STUDENT'), getStudentById);
router.get('/:id/subjects', authorizeRoles('ADMIN', 'FACULTY'), getStudentSubjects);
router.post('/', authorizeRoles('ADMIN'), createStudent);
router.put('/:id', authorizeRoles('ADMIN', 'FACULTY'), updateStudent);
router.delete('/:id', authorizeRoles('ADMIN'), deleteStudent);

module.exports = router;
