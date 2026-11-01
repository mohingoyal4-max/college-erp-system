const express = require('express');
const { authenticateToken, authorizeRoles, requirePermission } = require('../middleware/auth');
const c = require('../controllers/Fees.controller');

const router = express.Router();
router.use(authenticateToken);

// Students
router.get('/my', authorizeRoles('STUDENT'), c.getMyFees);

// Fee structure: managers see everything, students see their own (checked in controller)
router.get('/structures', c.getStructures);

// Managers only (ADMIN always; other roles need the "fees.manage" permission)
router.post('/structures', requirePermission('fees.manage'), c.createStructure);
router.put('/structures/:id', requirePermission('fees.manage'), c.updateStructure);
router.delete('/structures/:id', requirePermission('fees.manage'), c.deleteStructure);
router.get('/lookup', requirePermission('fees.manage'), c.getStudentFees);
router.get('/student/:studentId', requirePermission('fees.manage'), c.getStudentFees);
router.post('/payments', requirePermission('fees.manage'), c.recordPayment);
router.get('/report', requirePermission('fees.manage'), c.getFeeReport);
router.get('/summary', requirePermission('fees.manage'), c.getSummary);

module.exports = router;