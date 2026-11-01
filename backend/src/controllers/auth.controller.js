const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const prisma = require('../config/prisma');

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET || JWT_SECRET.length < 32) {
  throw new Error('JWT_SECRET must be set in the environment and be at least 32 characters long.');
}

// Roles that people may pick for themselves on the sign-up form (comma-separated, in .env).
// Use SELF_SIGNUP_ROLES=* to allow every role except ADMIN (any role you create in the Roles screen).
// ADMIN can never be self-assigned. Every other role must also exist in the Role table.
const SELF_SIGNUP_ROLES = (process.env.SELF_SIGNUP_ROLES || 'STUDENT,FACULTY,HOD,EXAM_CONTROLLER')
  .split(',')
  .map((r) => r.trim().toUpperCase())
  .filter((r) => r && r !== 'ADMIN');

// Google sign-in is only enabled when a client ID is configured.
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
let googleClient = null;
if (GOOGLE_CLIENT_ID) {
  const { OAuth2Client } = require('google-auth-library');
  googleClient = new OAuth2Client(GOOGLE_CLIENT_ID);
}

// Helper to get role permissions
const getRoleDetails = async (roleName) => {
  try {
    const roleRecord = await prisma.role.findUnique({
      where: { name: roleName },
    });
    if (roleRecord) {
      return {
        displayName: roleRecord.displayName,
        permissions: JSON.parse(roleRecord.permissions || '[]'),
      };
    }
  } catch (e) {
    // fallback
  }
  return { displayName: roleName, permissions: [] };
};

// Standard Email/Password Login (supports any @gmail.com or custom domain)
const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide email and password.' });
    }

    const cleanEmail = email.toLowerCase().trim();

    const user = await prisma.user.findUnique({
      where: { email: cleanEmail },
      include: {
        studentProfile: {
          include: { department: true },
        },
        facultyProfile: {
          include: { department: true },
        },
      },
    });

    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }

    const roleInfo = await getRoleDetails(user.role);

    const tokenPayload = {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      permissions: roleInfo.permissions,
      studentId: user.studentProfile?.id,
      facultyId: user.facultyProfile?.id,
      departmentId: user.studentProfile?.departmentId || user.facultyProfile?.departmentId,
    };

    const token = jwt.sign(tokenPayload, JWT_SECRET, { expiresIn: '7d' });

    res.json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        roleDisplayName: roleInfo.displayName,
        permissions: roleInfo.permissions,
        avatar: user.avatar,
        studentProfile: user.studentProfile,
        facultyProfile: user.facultyProfile,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ success: false, message: 'Server error during login.' });
  }
};

// Register any Account (supports any Gmail or domain)
const register = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Name, email, and password are required.' });
    }
    if (String(password).length < 8) {
      return res.status(400).json({ success: false, message: 'Password must be at least 8 characters.' });
    }

    const cleanEmail = email.toLowerCase().trim();
    const targetRole = (role || 'STUDENT').toUpperCase().trim();

    // Role must be allowed for self sign-up AND exist in the Role table (so roles
    // created in the Roles screen work), but ADMIN can never be self-assigned.
    if (targetRole === 'ADMIN' || !(SELF_SIGNUP_ROLES.includes('*') || SELF_SIGNUP_ROLES.includes(targetRole))) {
      return res.status(403).json({ success: false, message: `Role "${targetRole}" cannot be selected at sign-up.` });
    }
    const roleRecord = await prisma.role.findUnique({ where: { name: targetRole } });
    if (!roleRecord && targetRole !== 'STUDENT') {
      return res.status(400).json({ success: false, message: `Role "${targetRole}" does not exist.` });
    }

    const existingUser = await prisma.user.findUnique({
      where: { email: cleanEmail },
    });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'An account with this email already exists.' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // Get default department for auto-profile creation
    const defaultDept = await prisma.department.findFirst({ orderBy: { id: 'asc' } });
    const deptId = defaultDept ? defaultDept.id : 1;

    const result = await prisma.$transaction(async (tx) => {
      const newUser = await tx.user.create({
        data: {
          name: name.trim(),
          email: cleanEmail,
          password: hashedPassword,
          role: targetRole,
          avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(cleanEmail)}`,
        },
      });

      let studentProfile = null;
      let facultyProfile = null;

      if (targetRole === 'STUDENT') {
        const randNum = Date.now().toString().slice(-4);
        studentProfile = await tx.studentProfile.create({
          data: {
            userId: newUser.id,
            rollNo: `STU-${randNum}`,
            enrollmentNo: `ENR-${Date.now().toString().slice(-6)}`,
            departmentId: deptId,
            semester: 4,
            section: 'A',
            batch: '2023-2027',
          },
          include: { department: true },
        });
      } else if (targetRole === 'FACULTY') {
        const randNum = Date.now().toString().slice(-4);
        facultyProfile = await tx.facultyProfile.create({
          data: {
            userId: newUser.id,
            employeeId: `FAC-${randNum}`,
            departmentId: deptId,
            designation: 'Assistant Professor',
            qualification: 'M.Tech / Ph.D.',
          },
          include: { department: true },
        });
      }

      return { user: newUser, studentProfile, facultyProfile };
    });

    const roleInfo = await getRoleDetails(targetRole);

    const tokenPayload = {
      id: result.user.id,
      email: result.user.email,
      name: result.user.name,
      role: result.user.role,
      permissions: roleInfo.permissions,
      studentId: result.studentProfile?.id,
      facultyId: result.facultyProfile?.id,
      departmentId: result.studentProfile?.departmentId || result.facultyProfile?.departmentId,
    };

    const token = jwt.sign(tokenPayload, JWT_SECRET, { expiresIn: '7d' });

    res.status(201).json({
      success: true,
      message: `Account created successfully with role "${roleInfo.displayName}".`,
      token,
      user: {
        id: result.user.id,
        name: result.user.name,
        email: result.user.email,
        role: result.user.role,
        roleDisplayName: roleInfo.displayName,
        permissions: roleInfo.permissions,
        avatar: result.user.avatar,
        studentProfile: result.studentProfile,
        facultyProfile: result.facultyProfile,
      },
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ success: false, message: 'Server error during registration.' });
  }
};

// Gmail sign-in has two modes:
//  1. Verified (production): client sends a Google ID token as `credential`; it is verified
//     server-side and email/name come from the token. Needs GOOGLE_CLIENT_ID.
//  2. Unverified form (ALLOW_UNVERIFIED_GMAIL_SIGNIN=true): matches the current UI, where the
//     user just types an email. Because the email is NOT proven, this mode can only CREATE new
//     accounts (never log in to an existing one) and the role must be in SELF_SIGNUP_ROLES.
//     Existing users (including admin) must sign in with their password.
const ALLOW_UNVERIFIED = String(process.env.ALLOW_UNVERIFIED_GMAIL_SIGNIN).toLowerCase() === 'true';

const googleAuth = async (req, res) => {
  try {
    const { credential, email, name, role } = req.body;

    let cleanEmail;
    let verifiedName;
    let targetRole = 'STUDENT';
    let verified = false;

    if (credential && googleClient) {
      let payload;
      try {
        const ticket = await googleClient.verifyIdToken({ idToken: credential, audience: GOOGLE_CLIENT_ID });
        payload = ticket.getPayload();
      } catch (e) {
        return res.status(401).json({ success: false, message: 'Invalid Google credential.' });
      }
      if (!payload || !payload.email || !payload.email_verified) {
        return res.status(401).json({ success: false, message: 'Google account email is not verified.' });
      }
      cleanEmail = payload.email.toLowerCase().trim();
      verifiedName = payload.name;
      verified = true;
    } else if (ALLOW_UNVERIFIED) {
      if (!email) {
        return res.status(400).json({ success: false, message: 'Gmail address is required.' });
      }
      cleanEmail = email.toLowerCase().trim();
      verifiedName = name;
      targetRole = (role || 'STUDENT').toUpperCase().trim();
      if (targetRole === 'ADMIN' || !(SELF_SIGNUP_ROLES.includes('*') || SELF_SIGNUP_ROLES.includes(targetRole))) {
        return res.status(403).json({ success: false, message: `Role "${targetRole}" cannot be selected at sign-up.` });
      }
      const roleRecord = await prisma.role.findUnique({ where: { name: targetRole } });
      if (!roleRecord && targetRole !== 'STUDENT') {
        return res.status(400).json({ success: false, message: `Role "${targetRole}" does not exist.` });
      }
    } else {
      return res.status(503).json({ success: false, message: 'Google sign-in is not configured.' });
    }

    const displayName = verifiedName || cleanEmail.split('@')[0].replace(/[._]/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());

    // Check if user already exists
    let user = await prisma.user.findUnique({
      where: { email: cleanEmail },
      include: {
        studentProfile: { include: { department: true } },
        facultyProfile: { include: { department: true } },
      },
    });

    if (user && !verified) {
      return res.status(403).json({
        success: false,
        message: 'This email already has an account. Please sign in with your password.',
      });
    }

    if (!user) {
      // Auto-create account for this Gmail address
      const randomPassword = await bcrypt.hash(`gmail_${Date.now()}_pwd`, 10);
      const defaultDept = await prisma.department.findFirst({ orderBy: { id: 'asc' } });
      const deptId = defaultDept ? defaultDept.id : 1;

      user = await prisma.$transaction(async (tx) => {
        const newUser = await tx.user.create({
          data: {
            name: displayName,
            email: cleanEmail,
            password: randomPassword,
            role: targetRole,
            avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(cleanEmail)}`,
          },
        });

        let studentProfile = null;
        let facultyProfile = null;

        if (targetRole === 'STUDENT') {
          const randNum = Date.now().toString().slice(-4);
          studentProfile = await tx.studentProfile.create({
            data: {
              userId: newUser.id,
              rollNo: `GMAIL-${randNum}`,
              enrollmentNo: `ENR-G-${Date.now().toString().slice(-5)}`,
              departmentId: deptId,
              semester: 4,
              section: 'A',
              batch: '2023-2027',
            },
            include: { department: true },
          });
        } else if (targetRole === 'FACULTY') {
          const randNum = Date.now().toString().slice(-4);
          facultyProfile = await tx.facultyProfile.create({
            data: {
              userId: newUser.id,
              employeeId: `FAC-G-${randNum}`,
              departmentId: deptId,
              designation: 'Faculty Instructor',
              qualification: 'Google Certified Educator',
            },
            include: { department: true },
          });
        }

        return {
          ...newUser,
          studentProfile,
          facultyProfile,
        };
      });
    }

    const roleInfo = await getRoleDetails(user.role);

    const tokenPayload = {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      permissions: roleInfo.permissions,
      studentId: user.studentProfile?.id,
      facultyId: user.facultyProfile?.id,
      departmentId: user.studentProfile?.departmentId || user.facultyProfile?.departmentId,
    };

    const token = jwt.sign(tokenPayload, JWT_SECRET, { expiresIn: '7d' });

    res.json({
      success: true,
      message: `Signed in with Gmail: ${cleanEmail}`,
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        roleDisplayName: roleInfo.displayName,
        permissions: roleInfo.permissions,
        avatar: user.avatar,
        studentProfile: user.studentProfile,
        facultyProfile: user.facultyProfile,
      },
    });
  } catch (error) {
    console.error('Google auth error:', error);
    res.status(500).json({ success: false, message: 'Server error during Google/Gmail sign in.' });
  }
};

const getMe = async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        avatar: true,
        createdAt: true,
        studentProfile: {
          include: { department: true },
        },
        facultyProfile: {
          include: { department: true },
        },
      },
    });

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    const roleInfo = await getRoleDetails(user.role);

    res.json({
      success: true,
      user: {
        ...user,
        roleDisplayName: roleInfo.displayName,
        permissions: roleInfo.permissions,
      },
    });
  } catch (error) {
    console.error('getMe error:', error);
    res.status(500).json({ success: false, message: 'Server error fetching user.' });
  }
};

const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ success: false, message: 'Both passwords required.' });
    }

    const user = await prisma.user.findUnique({ where: { id: req.user.id } });
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ success: false, message: 'Current password incorrect.' });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await prisma.user.update({
      where: { id: req.user.id },
      data: { password: hashedPassword },
    });

    res.json({ success: true, message: 'Password updated successfully.' });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({ success: false, message: 'Server error changing password.' });
  }
};

module.exports = {
  login,
  register,
  googleAuth,
  getMe,
  changePassword,
};