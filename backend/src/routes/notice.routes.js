const express = require('express');
const { getNotices, createNotice, deleteNotice } = require('../controllers/notice.controller');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');

const router = express.Router();

router.use(authenticateToken);

router.get('/', getNotices);
router.post('/', authorizeRoles('ADMIN', 'FACULTY'), createNotice);
router.delete('/:id', authorizeRoles('ADMIN'), deleteNotice);

module.exports = router;
