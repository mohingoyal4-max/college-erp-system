const express = require('express');
const {
  getAllSubjects,
  createSubject,
  updateSubject,
  deleteSubject,
  assignFacultyToSubject,
  removeFacultyAssignment,
} = require('../controllers/subject.controller');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');

const router = express.Router();

router.use(authenticateToken);

router.get('/', getAllSubjects);
router.post('/', authorizeRoles('ADMIN'), createSubject);
router.put('/:id', authorizeRoles('ADMIN'), updateSubject);
router.delete('/:id', authorizeRoles('ADMIN'), deleteSubject);

// Assigning faculty to subjects
router.post('/assign', authorizeRoles('ADMIN'), assignFacultyToSubject);
router.delete('/assign/:id', authorizeRoles('ADMIN'), removeFacultyAssignment);

module.exports = router;
