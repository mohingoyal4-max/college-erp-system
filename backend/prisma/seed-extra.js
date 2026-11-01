/**
 * Adds demo data WITHOUT deleting anything (safe to run more than once):
 *   - faculty, subjects and subject assignments for IT, ECE and ME
 *   - 6 students in each of IT, ECE and ME (semester 4, section A)
 *   - weekly timetable for every department (semester 4, section A)
 *   - fee structure (semesters 3 and 4) and sample payments for every student
 *   - sample attendance and IA1 marks for the new students
 *
 * Run from the backend folder:   node prisma/seed-extra.js
 * Logins created:  student.<branch><n>@erp.edu / student123   faculty.<branch><n>@erp.edu / faculty123
 */
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
const bcrypt = require('bcryptjs');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();
const YEAR = '2025-2026';

const FACULTY = [
  { dept: 'IT', name: 'Prof. Rakesh Iyer', email: 'faculty.it2@erp.edu', empId: 'FAC-IT-02', desig: 'Assistant Professor', qual: 'M.Tech in Information Security (NIT Trichy)', room: 'Block C, Room 105' },
  { dept: 'IT', name: 'Dr. Pooja Malhotra', email: 'faculty.it3@erp.edu', empId: 'FAC-IT-03', desig: 'Associate Professor', qual: 'Ph.D. in Cloud Computing (IIT Bombay)', room: 'Block C, Room 106' },
  { dept: 'ECE', name: 'Dr. Meera Joshi', email: 'faculty.ece1@erp.edu', empId: 'FAC-ECE-01', desig: 'Professor & HOD', qual: 'Ph.D. in Signal Processing (IISc Bangalore)', room: 'Block D, Room 201' },
  { dept: 'ECE', name: 'Prof. Arjun Rao', email: 'faculty.ece2@erp.edu', empId: 'FAC-ECE-02', desig: 'Assistant Professor', qual: 'M.Tech in VLSI Design (NIT Warangal)', room: 'Block D, Room 204' },
  { dept: 'ME', name: 'Dr. Kiran Desai', email: 'faculty.me1@erp.edu', empId: 'FAC-ME-01', desig: 'Professor & HOD', qual: 'Ph.D. in Thermal Engineering (IIT Madras)', room: 'Block E, Room 101' },
  { dept: 'ME', name: 'Prof. Sunita Reddy', email: 'faculty.me2@erp.edu', empId: 'FAC-ME-02', desig: 'Assistant Professor', qual: 'M.Tech in Machine Design (NIT Surathkal)', room: 'Block E, Room 105' },
];

// [code, name, type, credits, faculty email]
const SUBJECTS = {
  IT: [
    ['IT401', 'Web Technologies', 'Theory', 4, 'faculty.it2@erp.edu'],
    ['IT402', 'Software Engineering', 'Theory', 3, 'faculty.it3@erp.edu'],
    ['IT403', 'Information Security', 'Theory', 3, 'faculty.it2@erp.edu'],
    ['IT404', 'Cloud Computing', 'Theory', 3, 'faculty.it3@erp.edu'],
    ['IT405', 'Web Technologies Lab', 'Practical', 2, 'faculty.it2@erp.edu'],
  ],
  ECE: [
    ['EC401', 'Digital Signal Processing', 'Theory', 4, 'faculty.ece1@erp.edu'],
    ['EC402', 'Analog Circuits', 'Theory', 3, 'faculty.ece2@erp.edu'],
    ['EC403', 'Microprocessors & Microcontrollers', 'Theory', 4, 'faculty.ece1@erp.edu'],
    ['EC404', 'Communication Systems', 'Theory', 3, 'faculty.ece2@erp.edu'],
    ['EC405', 'Electronics Lab', 'Practical', 2, 'faculty.ece2@erp.edu'],
  ],
  ME: [
    ['ME401', 'Thermodynamics', 'Theory', 4, 'faculty.me1@erp.edu'],
    ['ME402', 'Fluid Mechanics', 'Theory', 3, 'faculty.me2@erp.edu'],
    ['ME403', 'Machine Design', 'Theory', 4, 'faculty.me1@erp.edu'],
    ['ME404', 'Manufacturing Processes', 'Theory', 3, 'faculty.me2@erp.edu'],
    ['ME405', 'CAD/CAM Lab', 'Practical', 2, 'faculty.me2@erp.edu'],
  ],
};

const STUDENTS = {
  IT: { tag: 'it', roll: 'IT', names: ['Aarav Mehta', 'Diya Kapoor', 'Kabir Singh', 'Ishita Bansal', 'Vivaan Joshi', 'Ananya Pillai'] },
  ECE: { tag: 'ece', roll: 'EC', names: ['Arjun Nambiar', 'Sakshi Deshmukh', 'Rahul Chauhan', 'Tanvi Kulkarni', 'Harsh Vardhan', 'Meenal Sethi'] },
  ME: { tag: 'me', roll: 'ME', names: ['Yash Agarwal', 'Pooja Yadav', 'Nikhil Bhatt', 'Simran Kaur', 'Dev Malhotra', 'Riya Menon'] },
};

const TUITION = { CSE: 60000, IT: 55000, ECE: 58000, ME: 52000 };
const PERIODS = [['09:00', '09:50'], ['10:00', '10:50'], ['11:10', '12:00'], ['12:10', '13:00']];
const ROOM_PREFIX = { CSE: '1', IT: '2', ECE: '3', ME: '4' };

const grade = (obtained, max) => {
  const p = (obtained / max) * 100;
  if (p >= 90) return 'A+'; if (p >= 80) return 'A'; if (p >= 70) return 'B';
  if (p >= 60) return 'C'; if (p >= 50) return 'D'; if (p >= 40) return 'E';
  return 'F';
};

async function ensureUser(email, data) {
  const found = await prisma.user.findUnique({ where: { email } });
  if (found) return { user: found, created: false };
  const user = await prisma.user.create({
    data: { ...data, email, avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(email)}` },
  });
  return { user, created: true };
}

async function main() {
  const facultyPw = await bcrypt.hash('faculty123', 10);
  const studentPw = await bcrypt.hash('student123', 10);

  const depts = {};
  for (const code of ['CSE', 'IT', 'ECE', 'ME']) {
    depts[code] = await prisma.department.findUnique({ where: { code } });
    if (!depts[code]) throw new Error(`Department ${code} not found. Run the main seed first.`);
  }
  const admin = await prisma.user.findFirst({ where: { role: 'ADMIN' }, orderBy: { id: 'asc' } });

  // ---------- Faculty ----------
  const facultyByEmail = {};
  let n = 0;
  for (const f of FACULTY) {
    const { user } = await ensureUser(f.email, { name: f.name, password: facultyPw, role: 'FACULTY' });
    let profile = await prisma.facultyProfile.findUnique({ where: { userId: user.id } });
    if (!profile) {
      profile = await prisma.facultyProfile.create({
        data: { userId: user.id, employeeId: f.empId, departmentId: depts[f.dept].id, designation: f.desig, qualification: f.qual, phone: '+91 98765 4' + (3300 + n), officeRoom: f.room },
      });
      n++;
    }
    facultyByEmail[f.email] = profile;
  }
  console.log(`✅ Faculty ready (${n} new)`);

  // ---------- Subjects + assignments ----------
  n = 0;
  for (const [code, list] of Object.entries(SUBJECTS)) {
    for (const [scode, name, type, credits, femail] of list) {
      let subject = await prisma.subject.findUnique({ where: { code: scode } });
      if (!subject) {
        subject = await prisma.subject.create({ data: { name, code: scode, departmentId: depts[code].id, semester: 4, credits, type } });
        n++;
      }
      const fac = facultyByEmail[femail];
      const exists = await prisma.subjectAssignment.findFirst({ where: { subjectId: subject.id, section: 'A', academicYear: YEAR } });
      if (!exists) await prisma.subjectAssignment.create({ data: { subjectId: subject.id, facultyId: fac.id, section: 'A', academicYear: YEAR } });
    }
  }
  console.log(`✅ Subjects ready (${n} new)`);

  // ---------- Students ----------
  const newStudents = { IT: [], ECE: [], ME: [] };
  n = 0;
  for (const [code, s] of Object.entries(STUDENTS)) {
    for (let i = 0; i < s.names.length; i++) {
      const num = String(i + 1).padStart(3, '0');
      const email = `student.${s.tag}${i + 1}@erp.edu`;
      const { user } = await ensureUser(email, { name: s.names[i], password: studentPw, role: 'STUDENT' });
      let profile = await prisma.studentProfile.findUnique({ where: { userId: user.id } });
      if (!profile) {
        profile = await prisma.studentProfile.create({
          data: {
            userId: user.id, rollNo: `${s.roll}2023-${num}`, enrollmentNo: `ENR2023${s.roll}${num}`,
            departmentId: depts[code].id, semester: 4, section: 'A', batch: '2023-2027',
            phone: '+91 90000 ' + (10000 + n), gender: i % 2 === 0 ? 'Male' : 'Female',
            bloodGroup: ['O+', 'A+', 'B+', 'AB+', 'O-', 'A-'][i % 6],
            parentName: 'Mr. ' + s.names[i].split(' ').pop(), parentPhone: '+91 90001 ' + (10000 + n), address: 'Hostel / City Campus',
          },
        });
        n++;
      }
      newStudents[code].push(profile);
    }
  }
  console.log(`✅ Students ready (${n} new)`);

  // ---------- Timetable ----------
  n = 0;
  for (const code of Object.keys(depts)) {
    const dept = depts[code];
    const have = await prisma.timetableSlot.count({ where: { departmentId: dept.id, semester: 4, section: 'A' } });
    if (have > 0) continue;
    const subjects = await prisma.subject.findMany({ where: { departmentId: dept.id, semester: 4 }, orderBy: { code: 'asc' } });
    const assign = {};
    for (const s of subjects) {
      const a = await prisma.subjectAssignment.findFirst({ where: { subjectId: s.id, section: 'A' } });
      if (a) assign[s.id] = a.facultyId;
    }
    const theory = subjects.filter((s) => s.type !== 'Practical' && assign[s.id]);
    const labs = subjects.filter((s) => s.type === 'Practical' && assign[s.id]);
    if (theory.length === 0) continue;
    const room = `LH-${ROOM_PREFIX[code]}01`;
    const data = [];
    for (let d = 1; d <= 5; d++) {
      PERIODS.forEach(([startTime, endTime], p) => {
        const s = theory[(d + p) % theory.length];
        data.push({ departmentId: dept.id, semester: 4, section: 'A', dayOfWeek: d, startTime, endTime, subjectId: s.id, facultyId: assign[s.id], room });
      });
    }
    if (labs[0]) {
      data.push({ departmentId: dept.id, semester: 4, section: 'A', dayOfWeek: 3, startTime: '14:00', endTime: '16:00', subjectId: labs[0].id, facultyId: assign[labs[0].id], room: `LAB-${ROOM_PREFIX[code]}01` });
    }
    await prisma.timetableSlot.createMany({ data });
    n += data.length;
  }
  console.log(`✅ Timetable ready (${n} new periods)`);

  // ---------- Fee structure ----------
  n = 0;
  const structures = [];
  for (const code of Object.keys(depts)) {
    const items = [
      [3, 'TUITION', TUITION[code], '2026-01-15'], [3, 'EXAM', 3000, '2026-01-31'],
      [4, 'TUITION', TUITION[code], '2026-12-15'], [4, 'EXAM', 3000, '2026-12-31'],
      [4, 'LIBRARY', 1500, '2026-12-15'], [4, 'LAB', 4000, '2026-12-15'],
    ];
    for (const [semester, feeType, amount, dueDate] of items) {
      const where = { departmentId_semester_feeType_academicYear: { departmentId: depts[code].id, semester, feeType, academicYear: YEAR } };
      let fs = await prisma.feeStructure.findUnique({ where });
      if (!fs) {
        fs = await prisma.feeStructure.create({ data: { departmentId: depts[code].id, semester, feeType, amount, dueDate, academicYear: YEAR, description: `Semester ${semester} ${feeType.toLowerCase()} fee` } });
        n++;
      }
      structures.push(fs);
    }
  }
  console.log(`✅ Fee structure ready (${n} new)`);

  // ---------- Fee payments (mix of paid / partial / pending / overdue) ----------
  n = 0;
  const allStudents = await prisma.studentProfile.findMany({ orderBy: { id: 'asc' } });
  const methods = ['UPI', 'CASH', 'CARD', 'BANK_TRANSFER'];
  for (let idx = 0; idx < allStudents.length; idx++) {
    const st = allStudents[idx];
    if ((await prisma.feePayment.count({ where: { studentId: st.id } })) > 0) continue;
    const mine = structures.filter((f) => f.departmentId === st.departmentId && f.semester <= st.semester);
    const pattern = idx % 4; // 0 = all paid, 1 = sem 3 paid + half of sem 4 tuition, 2 = sem 3 paid, 3 = nothing paid
    const pay = [];
    for (const f of mine) {
      if (pattern === 0) pay.push([f, f.amount]);
      else if (pattern === 1 && f.semester === 3) pay.push([f, f.amount]);
      else if (pattern === 1 && f.feeType === 'TUITION') pay.push([f, Math.round(f.amount / 2)]);
      else if (pattern === 2 && f.semester === 3) pay.push([f, f.amount]);
    }
    for (const [f, amt] of pay) {
      await prisma.feePayment.create({
        data: { studentId: st.id, feeStructureId: f.id, amountPaid: amt, method: methods[(idx + f.id) % 4], reference: 'TXN' + (100000 + st.id * 100 + f.id), receiptNo: `RCP-SEED-${st.id}-${f.id}`, recordedById: admin ? admin.id : null, remarks: 'Demo payment' },
      });
      n++;
    }
  }
  console.log(`✅ Fee payments ready (${n} new)`);

  // ---------- Attendance + marks for the new students ----------
  const dates = ['2026-03-02', '2026-03-03', '2026-03-04'];
  const present = ['PRESENT', 'PRESENT', 'PRESENT', 'LATE', 'PRESENT', 'PRESENT', 'ABSENT', 'PRESENT', 'PRESENT', 'PRESENT'];
  for (const code of ['IT', 'ECE', 'ME']) {
    const dept = depts[code];
    const students = newStudents[code];
    const subjects = (await prisma.subject.findMany({ where: { departmentId: dept.id, semester: 4 }, orderBy: { code: 'asc' } })).filter((s) => s.type !== 'Practical').slice(0, 2);
    const facOf = {};
    for (const s of subjects) facOf[s.id] = (await prisma.subjectAssignment.findFirst({ where: { subjectId: s.id, section: 'A' } })).facultyId;

    if ((await prisma.attendanceSession.count({ where: { departmentId: dept.id } })) === 0) {
      let sIdx = 0;
      for (const subject of subjects) {
        for (const date of dates) {
          const session = await prisma.attendanceSession.create({
            data: { subjectId: subject.id, facultyId: facOf[subject.id], departmentId: dept.id, semester: 4, section: 'A', date, timeSlot: '09:00 - 09:50 AM', topic: 'Unit 1 introduction' },
          });
          await prisma.attendanceRecord.createMany({
            data: students.map((st, j) => ({
              sessionId: session.id, studentId: st.id,
              // last student has poor attendance (shortage warning demo)
              status: j === students.length - 1 ? (sIdx % 2 === 0 ? 'PRESENT' : 'ABSENT') : present[(sIdx + j) % present.length],
            })),
          });
          sIdx++;
        }
      }
      console.log(`✅ ${code}: attendance added`);
    }

    if ((await prisma.mark.count({ where: { student: { departmentId: dept.id } } })) === 0) {
      const rows = [];
      subjects.forEach((subject, s) => {
        students.forEach((st, j) => {
          const obtained = 12 + ((j * 7 + s * 5) % 19);
          rows.push({ studentId: st.id, subjectId: subject.id, facultyId: facOf[subject.id], examType: 'IA1', marksObtained: obtained, maxMarks: 30, grade: grade(obtained, 30), remarks: null });
        });
      });
      await prisma.mark.createMany({ data: rows });
      console.log(`✅ ${code}: IA1 marks added`);
    }
  }

  console.log('\n🎉 Done. New logins: student.it1@erp.edu, student.ece1@erp.edu, student.me1@erp.edu (student123); faculty.ece1@erp.edu, faculty.me1@erp.edu, faculty.it2@erp.edu (faculty123)');
}

main()
  .catch((e) => { console.error('❌ Seed failed:', e); process.exitCode = 1; })
  .finally(() => prisma.$disconnect());