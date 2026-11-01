const express = require('express');
const {
  getAllDepartments,
  createDepartment,
  updateDepartment,
  deleteDepartment,
} = require('../controllers/department.controller');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');

const router = express.Router();

router.use(authenticateToken);

router.get('/', getAllDepartments);
router.post('/', authorizeRoles('ADMIN'), createDepartment);
router.put('/:id', authorizeRoles('ADMIN'), updateDepartment);
router.delete('/:id', authorizeRoles('ADMIN'), deleteDepartment);

module.exports = router;
