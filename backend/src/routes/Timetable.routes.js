const express = require('express');
const { authenticateToken, requirePermission } = require('../middleware/auth');
const c = require('../controllers/Timetable.controller');

const router = express.Router();
router.use(authenticateToken);

router.get('/my', c.getMyTimetable);
router.get('/', c.getTimetable);

router.get('/options', requirePermission('timetable.manage'), c.getOptions);
router.post('/', requirePermission('timetable.manage'), c.createSlot);
router.put('/:id', requirePermission('timetable.manage'), c.updateSlot);
router.delete('/:id', requirePermission('timetable.manage'), c.deleteSlot);

module.exports = router;