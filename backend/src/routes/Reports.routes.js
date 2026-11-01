const express = require('express');
const { authenticateToken, requirePermission } = require('../middleware/auth');
const c = require('../controllers/Reports.controller');

const router = express.Router();
router.use(authenticateToken);
// ADMIN always passes; other roles need the "reports.view" permission
router.get('/summary', requirePermission('reports.view'), c.getAdminSummary);

module.exports = router;