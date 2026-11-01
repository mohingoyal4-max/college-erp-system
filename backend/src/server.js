require('dotenv').config();
const express = require('express');
const path = require('path');
const cors = require('cors');

const authRoutes = require('./routes/auth.routes');
const departmentRoutes = require('./routes/department.routes');
const subjectRoutes = require('./routes/subject.routes');
const studentRoutes = require('./routes/student.routes');
const facultyRoutes = require('./routes/faculty.routes');
const attendanceRoutes = require('./routes/attendance.routes');
const marksRoutes = require('./routes/marks.routes');
const noticeRoutes = require('./routes/notice.routes');
const dashboardRoutes = require('./routes/dashboard.routes');
const roleRoutes = require('./routes/role.routes');
const feesRoutes = require('./routes/Fees.routes');
const timetableRoutes = require('./routes/Timetable.routes');
const reportsRoutes = require('./routes/Reports.routes');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/departments', departmentRoutes);
app.use('/api/subjects', subjectRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/faculty', facultyRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/marks', marksRoutes);
app.use('/api/notices', noticeRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/roles', roleRoutes);
app.use('/api/fees', feesRoutes);
app.use('/api/timetable', timetableRoutes);
app.use('/api/reports', reportsRoutes);

// Standalone pages (fees, timetable, admin summary report) from ./public
app.use('/erp-static', express.static(path.join(__dirname, 'public')));
['fees', 'timetable', 'reports'].forEach((name) => {
  app.get('/' + name, (req, res) => res.sendFile(path.join(__dirname, 'public', name + '.html')));
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    system: 'AcademiaPro College ERP System',
    timestamp: new Date().toISOString(),
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ success: false, message: 'API route not found' });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Unhandled server error:', err);
  res.status(500).json({
    success: false,
    message: err.message || 'Internal Server Error',
  });
});

app.listen(PORT, () => {
  console.log(`🚀 College ERP Server running on port ${PORT}`);
});