const express = require('express');
const {
  getAllFaculty,
  getFacultyById,
  createFaculty,
  updateFaculty,
  deleteFaculty,
  getFacultyClasses,
} = require('../controllers/faculty.controller');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');

const router = express.Router();

router.use(authenticateToken);

router.get('/my-classes', authorizeRoles('FACULTY'), getFacultyClasses);
router.get('/', getAllFaculty);
router.get('/:id', getFacultyById);
router.get('/:id/classes', authorizeRoles('ADMIN'), getFacultyClasses);
router.post('/', authorizeRoles('ADMIN'), createFaculty);
router.put('/:id', authorizeRoles('ADMIN', 'FACULTY'), updateFaculty);
router.delete('/:id', authorizeRoles('ADMIN'), deleteFaculty);

module.exports = router;
