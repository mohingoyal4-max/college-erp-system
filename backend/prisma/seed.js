const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // Clean existing data
  await prisma.role.deleteMany({});
  await prisma.attendanceRecord.deleteMany({});
  await prisma.attendanceSession.deleteMany({});
  await prisma.mark.deleteMany({});
  await prisma.notice.deleteMany({});
  await prisma.subjectAssignment.deleteMany({});
  await prisma.subject.deleteMany({});
  await prisma.studentProfile.deleteMany({});
  await prisma.facultyProfile.deleteMany({});
  await prisma.department.deleteMany({});
  await prisma.user.deleteMany({});

  console.log('🧹 Cleaned existing tables.');

  // Common hashed passwords
  const adminPassword = await bcrypt.hash('admin123', 10);
  const facultyPassword = await bcrypt.hash('faculty123', 10);
  const studentPassword = await bcrypt.hash('student123', 10);

  // 1. Create Admin Users
  const adminUser = await prisma.user.create({
    data: {
      name: 'Dr. Rajesh Sharma',
      email: 'admin@erp.edu',
      password: adminPassword,
      role: 'ADMIN',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150',
    },
  });

  // User's Personal Gmail Account (Super Administrator)
  const personalAdmin = await prisma.user.create({
    data: {
      name: 'Mohin Goyal',
      email: 'mohingoyal45@gmail.com',
      password: adminPassword,
      role: 'ADMIN',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=mohingoyal45',
    },
  });
  console.log('✅ Created Admin:', adminUser.email, 'and', personalAdmin.email);

  // 2. Create Departments
  const cseDept = await prisma.department.create({
    data: {
      name: 'Computer Science & Engineering',
      code: 'CSE',
      description: 'Department of Computer Science & Engineering covering core algorithms, systems, and software engineering.',
    },
  });

  const itDept = await prisma.department.create({
    data: {
      name: 'Information Technology',
      code: 'IT',
      description: 'Department of IT focused on web services, networks, cloud computing, and information security.',
    },
  });

  const eceDept = await prisma.department.create({
    data: {
      name: 'Electronics & Communication',
      code: 'ECE',
      description: 'Department of ECE focusing on embedded systems, IoT, VLSI, and communication networks.',
    },
  });

  const meDept = await prisma.department.create({
    data: {
      name: 'Mechanical Engineering',
      code: 'ME',
      description: 'Department of Mechanical Engineering with robotics, thermodynamics, and CAD/CAM.',
    },
  });

  console.log('✅ Created Departments: CSE, IT, ECE, ME');

  // 3. Create Faculty Users & Profiles
  const faculty1User = await prisma.user.create({
    data: {
      name: 'Dr. Ananya Verma',
      email: 'faculty.cs@erp.edu',
      password: facultyPassword,
      role: 'FACULTY',
      avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150',
    },
  });

  const faculty1Profile = await prisma.facultyProfile.create({
    data: {
      userId: faculty1User.id,
      employeeId: 'FAC-CSE-01',
      departmentId: cseDept.id,
      designation: 'Associate Professor',
      qualification: 'Ph.D. in Computer Science (IIT Delhi)',
      phone: '+91 98765 43210',
      officeRoom: 'Block B, Room 304',
    },
  });

  const faculty2User = await prisma.user.create({
    data: {
      name: 'Prof. Vikram Mehta',
      email: 'faculty.it@erp.edu',
      password: facultyPassword,
      role: 'FACULTY',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
    },
  });

  const faculty2Profile = await prisma.facultyProfile.create({
    data: {
      userId: faculty2User.id,
      employeeId: 'FAC-CSE-02',
      departmentId: cseDept.id,
      designation: 'Assistant Professor',
      qualification: 'M.Tech in Software Systems (BITS Pilani)',
      phone: '+91 98765 43211',
      officeRoom: 'Block B, Room 308',
    },
  });

  const faculty3User = await prisma.user.create({
    data: {
      name: 'Dr. Sneha Patel',
      email: 'faculty.ec@erp.edu',
      password: facultyPassword,
      role: 'FACULTY',
      avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150',
    },
  });

  const faculty3Profile = await prisma.facultyProfile.create({
    data: {
      userId: faculty3User.id,
      employeeId: 'FAC-IT-01',
      departmentId: itDept.id,
      designation: 'Professor & HOD',
      qualification: 'Ph.D. in Distributed Networks',
      phone: '+91 98765 43212',
      officeRoom: 'Block C, Room 102',
    },
  });

  console.log('✅ Created 3 Faculty profiles');

  // 4. Create Subjects
  const subDSA = await prisma.subject.create({
    data: {
      name: 'Data Structures & Algorithms',
      code: 'CS401',
      departmentId: cseDept.id,
      semester: 4,
      credits: 4,
      type: 'Theory',
    },
  });

  const subOS = await prisma.subject.create({
    data: {
      name: 'Operating Systems',
      code: 'CS402',
      departmentId: cseDept.id,
      semester: 4,
      credits: 4,
      type: 'Theory',
    },
  });

  const subDBMS = await prisma.subject.create({
    data: {
      name: 'Database Management Systems',
      code: 'CS403',
      departmentId: cseDept.id,
      semester: 4,
      credits: 4,
      type: 'Theory',
    },
  });

  const subWeb = await prisma.subject.create({
    data: {
      name: 'Full Stack Web Development',
      code: 'CS404',
      departmentId: cseDept.id,
      semester: 4,
      credits: 3,
      type: 'Practical',
    },
  });

  const subCN = await prisma.subject.create({
    data: {
      name: 'Computer Networks',
      code: 'CS405',
      departmentId: cseDept.id,
      semester: 4,
      credits: 3,
      type: 'Theory',
    },
  });

  console.log('✅ Created 5 Subjects for CSE Sem 4');

  // 5. Subject Assignments to Faculty
  await prisma.subjectAssignment.createMany({
    data: [
      { subjectId: subDSA.id, facultyId: faculty1Profile.id, section: 'A', academicYear: '2025-2026' },
      { subjectId: subDBMS.id, facultyId: faculty1Profile.id, section: 'A', academicYear: '2025-2026' },
      { subjectId: subOS.id, facultyId: faculty2Profile.id, section: 'A', academicYear: '2025-2026' },
      { subjectId: subWeb.id, facultyId: faculty2Profile.id, section: 'A', academicYear: '2025-2026' },
      { subjectId: subCN.id, facultyId: faculty3Profile.id, section: 'A', academicYear: '2025-2026' },
    ],
  });

  console.log('✅ Assigned Subjects to Faculty');

  // 6. Create Students
  const studentsRaw = [
    {
      name: 'Rohan Gupta',
      email: 'student1@erp.edu', // primary demo student (Good attendance)
      rollNo: 'CS2023-001',
      enrollmentNo: 'ENR20230101',
      phone: '+91 91234 56789',
      gender: 'Male',
      bloodGroup: 'O+',
      parentName: 'Sanjay Gupta',
      parentPhone: '+91 91234 56700',
      address: '74 Civil Lines, New Delhi',
    },
    {
      name: 'Priya Nair',
      email: 'student2@erp.edu', // demo student with Attendance Shortage alert!
      rollNo: 'CS2023-002',
      enrollmentNo: 'ENR20230102',
      phone: '+91 91234 56788',
      gender: 'Female',
      bloodGroup: 'B+',
      parentName: 'K. Nair',
      parentPhone: '+91 91234 56701',
      address: '12 Green Park, Bangalore',
    },
    {
      name: 'Amit Kumar',
      email: 'amit.kumar@erp.edu',
      rollNo: 'CS2023-003',
      enrollmentNo: 'ENR20230103',
      phone: '+91 91234 56787',
      gender: 'Male',
      bloodGroup: 'A+',
      parentName: 'Ramesh Kumar',
      parentPhone: '+91 91234 56702',
      address: '45 Tagore Nagar, Jaipur',
    },
    {
      name: 'Neha Sharma',
      email: 'neha.sharma@erp.edu',
      rollNo: 'CS2023-004',
      enrollmentNo: 'ENR20230104',
      phone: '+91 91234 56786',
      gender: 'Female',
      bloodGroup: 'AB+',
      parentName: 'P. Sharma',
      parentPhone: '+91 91234 56703',
      address: '88 Salt Lake, Kolkata',
    },
    {
      name: 'Rahul Verma',
      email: 'rahul.verma@erp.edu',
      rollNo: 'CS2023-005',
      enrollmentNo: 'ENR20230105',
      phone: '+91 91234 56785',
      gender: 'Male',
      bloodGroup: 'O-',
      parentName: 'M. Verma',
      parentPhone: '+91 91234 56704',
      address: '19 Gomti Nagar, Lucknow',
    },
    {
      name: 'Anjali Singh',
      email: 'anjali.singh@erp.edu',
      rollNo: 'CS2023-006',
      enrollmentNo: 'ENR20230106',
      phone: '+91 91234 56784',
      gender: 'Female',
      bloodGroup: 'B-',
      parentName: 'D. Singh',
      parentPhone: '+91 91234 56705',
      address: '22 Banjara Hills, Hyderabad',
    },
  ];

  const studentProfiles = [];

  for (const s of studentsRaw) {
    const user = await prisma.user.create({
      data: {
        name: s.name,
        email: s.email,
        password: studentPassword,
        role: 'STUDENT',
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${s.rollNo}`,
      },
    });

    const profile = await prisma.studentProfile.create({
      data: {
        userId: user.id,
        rollNo: s.rollNo,
        enrollmentNo: s.enrollmentNo,
        departmentId: cseDept.id,
        semester: 4,
        section: 'A',
        batch: '2023-2027',
        phone: s.phone,
        gender: s.gender,
        bloodGroup: s.bloodGroup,
        parentName: s.parentName,
        parentPhone: s.parentPhone,
        address: s.address,
      },
    });

    studentProfiles.push(profile);
  }

  console.log(`✅ Created ${studentProfiles.length} Students in CSE Sem 4 Sec A`);

  // 7. Create Past Attendance Sessions & Student Records
  const sessionsConfig = [
    { subjectId: subDSA.id, facultyId: faculty1Profile.id, date: '2026-03-01', slot: '09:00 - 10:00 AM', topic: 'Binary Search Trees & AVL Rotations' },
    { subjectId: subDSA.id, facultyId: faculty1Profile.id, date: '2026-03-03', slot: '09:00 - 10:00 AM', topic: 'Red-Black Trees and B-Trees' },
    { subjectId: subDSA.id, facultyId: faculty1Profile.id, date: '2026-03-05', slot: '09:00 - 10:00 AM', topic: 'Graph Traversal (BFS & DFS)' },
    { subjectId: subDBMS.id, facultyId: faculty1Profile.id, date: '2026-03-02', slot: '10:15 - 11:15 AM', topic: 'Relational Algebra & Normalization 3NF/BCNF' },
    { subjectId: subDBMS.id, facultyId: faculty1Profile.id, date: '2026-03-04', slot: '10:15 - 11:15 AM', topic: 'ACID Properties and Transaction Serializability' },
    { subjectId: subOS.id, facultyId: faculty2Profile.id, date: '2026-03-01', slot: '11:30 - 12:30 PM', topic: 'Process Scheduling & Round Robin Algorithm' },
    { subjectId: subOS.id, facultyId: faculty2Profile.id, date: '2026-03-03', slot: '11:30 - 12:30 PM', topic: 'Semaphores, Mutex, and Dining Philosophers' },
    { subjectId: subWeb.id, facultyId: faculty2Profile.id, date: '2026-03-02', slot: '02:00 - 04:00 PM', topic: 'React Component Architecture & Hooks' },
    { subjectId: subCN.id, facultyId: faculty3Profile.id, date: '2026-03-04', slot: '02:00 - 03:00 PM', topic: 'TCP/IP Model and Subnetting Calculations' },
  ];

  for (const sess of sessionsConfig) {
    const session = await prisma.attendanceSession.create({
      data: {
        subjectId: sess.subjectId,
        facultyId: sess.facultyId,
        departmentId: cseDept.id,
        semester: 4,
        section: 'A',
        date: sess.date,
        timeSlot: sess.slot,
        topic: sess.topic,
      },
    });

    // Record attendance for each student in this session
    for (let i = 0; i < studentProfiles.length; i++) {
      const stu = studentProfiles[i];
      let status = 'PRESENT';

      if (i === 1) {
        // Priya Nair: absent frequently to demonstrate < 75% warning flag
        status = (sess.date === '2026-03-01' || sess.date === '2026-03-04') ? 'PRESENT' : 'ABSENT';
      } else if (i === 2) {
        // Amit Kumar: occasional late
        status = (sess.date === '2026-03-03') ? 'LATE' : (sess.date === '2026-03-05' ? 'ABSENT' : 'PRESENT');
      } else {
        // Others mostly present
        status = 'PRESENT';
      }

      await prisma.attendanceRecord.create({
        data: {
          sessionId: session.id,
          studentId: stu.id,
          status,
        },
      });
    }
  }

  console.log('✅ Created Attendance Sessions and student logs');

  // 8. Create Marks for Students
  // IA1, IA2, Midterm across subjects
  const markDefs = [
    { subjectId: subDSA.id, facultyId: faculty1Profile.id, examType: 'IA1', maxMarks: 25 },
    { subjectId: subDSA.id, facultyId: faculty1Profile.id, examType: 'IA2', maxMarks: 25 },
    { subjectId: subDSA.id, facultyId: faculty1Profile.id, examType: 'MIDTERM', maxMarks: 50 },
    { subjectId: subDBMS.id, facultyId: faculty1Profile.id, examType: 'IA1', maxMarks: 25 },
    { subjectId: subDBMS.id, facultyId: faculty1Profile.id, examType: 'MIDTERM', maxMarks: 50 },
    { subjectId: subOS.id, facultyId: faculty2Profile.id, examType: 'IA1', maxMarks: 25 },
    { subjectId: subOS.id, facultyId: faculty2Profile.id, examType: 'MIDTERM', maxMarks: 50 },
    { subjectId: subWeb.id, facultyId: faculty2Profile.id, examType: 'IA1', maxMarks: 25 },
    { subjectId: subWeb.id, facultyId: faculty2Profile.id, examType: 'MIDTERM', maxMarks: 50 },
    { subjectId: subCN.id, facultyId: faculty3Profile.id, examType: 'IA1', maxMarks: 25 },
  ];

  // Grade helper
  const getGrade = (obtained, max) => {
    const pct = (obtained / max) * 100;
    if (pct >= 90) return 'A+';
    if (pct >= 80) return 'A';
    if (pct >= 70) return 'B';
    if (pct >= 60) return 'C';
    if (pct >= 50) return 'D';
    if (pct >= 40) return 'E';
    return 'F';
  };

  for (const mDef of markDefs) {
    for (let i = 0; i < studentProfiles.length; i++) {
      const stu = studentProfiles[i];
      let scoreFraction = 0.85; // default high

      if (i === 0) scoreFraction = 0.92; // Rohan: 92%
      else if (i === 1) scoreFraction = 0.58; // Priya: 58%
      else if (i === 2) scoreFraction = 0.74; // Amit: 74%
      else if (i === 3) scoreFraction = 0.88; // Neha: 88%
      else if (i === 4) scoreFraction = 0.65; // Rahul: 65%
      else if (i === 5) scoreFraction = 0.80; // Anjali: 80%

      // Slight variation based on exam
      if (mDef.examType === 'IA2') scoreFraction = Math.min(1.0, scoreFraction + 0.04);

      const marksObtained = Math.round(mDef.maxMarks * scoreFraction);
      const grade = getGrade(marksObtained, mDef.maxMarks);

      await prisma.mark.create({
        data: {
          studentId: stu.id,
          subjectId: mDef.subjectId,
          facultyId: mDef.facultyId,
          examType: mDef.examType,
          marksObtained,
          maxMarks: mDef.maxMarks,
          grade,
          remarks: marksObtained >= 20 ? 'Excellent performance' : 'Consistent effort needed',
        },
      });
    }
  }

  console.log('✅ Created Marks records (IA1, IA2, Midterm) for all students');

  // 9. Create Notices / Announcements
  await prisma.notice.createMany({
    data: [
      {
        title: 'Mid-Term Examinations Schedule Announced',
        content: 'Mid-term examinations for B.Tech Semester 4 will commence from April 15, 2026. Hall tickets will be issued through the student portal next week.',
        targetRole: 'ALL',
        category: 'EXAM',
        authorId: adminUser.id,
      },
      {
        title: 'Mandatory 75% Attendance Requirement for Exams',
        content: 'All students are reminded that a minimum of 75% attendance in each registered subject is required to be eligible for End-Semester Examinations.',
        targetRole: 'STUDENT',
        category: 'ACADEMIC',
        authorId: adminUser.id,
      },
      {
        title: 'Annual Hackathon "CodeCraft 2026" Registrations Open',
        content: 'Register your teams for the 36-hour inter-college hackathon hosted by the Computer Science Department. Exciting cash prizes and internship opportunities!',
        targetRole: 'ALL',
        category: 'GENERAL',
        authorId: adminUser.id,
      },
      {
        title: 'Faculty Senate Meeting on Friday',
        content: 'All faculty members are requested to attend the monthly senate meeting in the Conference Hall on Friday at 3:30 PM.',
        targetRole: 'FACULTY',
        category: 'GENERAL',
        authorId: adminUser.id,
      },
    ],
  });

  console.log('✅ Created Notices/Announcements');

  // 10. Seed Roles
  await prisma.role.createMany({
    data: [
      {
        name: 'ADMIN',
        displayName: 'Administrator',
        description: 'Full campus ERP administration and management',
        isSystem: true,
        permissions: JSON.stringify([
          'view_students', 'manage_students',
          'view_faculty', 'manage_faculty',
          'view_departments', 'manage_departments',
          'view_subjects', 'manage_subjects',
          'view_attendance', 'manage_attendance',
          'view_marks', 'manage_marks',
          'view_notices', 'manage_notices',
          'manage_roles',
        ]),
      },
      {
        name: 'FACULTY',
        displayName: 'Faculty Member',
        description: 'Teaching staff: marks attendance, enters exam marks, manages assigned classes',
        isSystem: true,
        permissions: JSON.stringify([
          'view_students',
          'manage_attendance', 'view_attendance',
          'view_marks', 'manage_marks',
          'view_subjects',
          'view_notices',
        ]),
      },
      {
        name: 'STUDENT',
        displayName: 'Student',
        description: 'Enrolled student: views personal attendance, marksheet, registered subjects',
        isSystem: true,
        permissions: JSON.stringify([
          'view_own_attendance',
          'view_own_marks',
          'view_own_courses',
          'view_notices',
        ]),
      },
      {
        name: 'HOD',
        displayName: 'Head of Department (HOD)',
        description: 'Departmental head: monitors faculty courses, student attendance rates, curriculum, and notices',
        isSystem: false,
        permissions: JSON.stringify([
          'view_students',
          'view_faculty',
          'view_departments',
          'view_subjects',
          'view_attendance',
          'view_marks',
          'manage_notices',
          'view_notices',
        ]),
      },
      {
        name: 'EXAM_CONTROLLER',
        displayName: 'Controller of Examinations',
        description: 'Oversees college assessments, grade distributions, marks entry, and exam circulars',
        isSystem: false,
        permissions: JSON.stringify([
          'view_students',
          'view_marks',
          'manage_marks',
          'view_subjects',
          'manage_notices',
          'view_notices',
        ]),
      },
    ],
  });

  // Create Users with Custom Roles
  const hodPassword = await bcrypt.hash('hod123', 10);
  const examPassword = await bcrypt.hash('exam123', 10);

  await prisma.user.create({
    data: {
      name: 'Dr. Arvind Mehta (HOD - CSE)',
      email: 'hod.cs@erp.edu',
      password: hodPassword,
      role: 'HOD',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
    },
  });

  await prisma.user.create({
    data: {
      name: 'Prof. S. K. Bansal (Exam Controller)',
      email: 'exam@erp.edu',
      password: examPassword,
      role: 'EXAM_CONTROLLER',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150',
    },
  });

  console.log('✅ Seeded System & Custom Roles (ADMIN, FACULTY, STUDENT, HOD, EXAM_CONTROLLER)');

  console.log('\n=============================================');
  console.log('🎉 SEED COMPLETED SUCCESSFULLY!');
  console.log('---------------------------------------------');
  console.log('Demo Credentials:');
  console.log('👑 Admin:           admin@erp.edu      / admin123');
  console.log('👨‍🏫 Faculty:         faculty.cs@erp.edu / faculty123');
  console.log('👨‍🎓 Student 1:       student1@erp.edu   / student123 (High Attendance)');
  console.log('👨‍🎓 Student 2:       student2@erp.edu   / student123 (Shortage Warning <75%)');
  console.log('🏛️ Custom HOD:      hod.cs@erp.edu     / hod123');
  console.log('📝 Exam Controller: exam@erp.edu       / exam123');
  console.log('=============================================\n');
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
