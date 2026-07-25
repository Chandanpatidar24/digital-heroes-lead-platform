const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const prisma = new PrismaClient();

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'Email and password are required',
      });
    }

    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
    });

    if (!user) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'Invalid email or password',
      });
    }

    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);

    if (!isPasswordValid) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'Invalid email or password',
      });
    }

    const tokenPayload = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    };

    const token = jwt.sign(
      tokenPayload,
      process.env.JWT_SECRET || 'digital_heroes_super_secret_jwt_key_2026',
      { expiresIn: '7d' }
    );

    return res.status(200).json({
      message: 'Login successful',
      token,
      user: tokenPayload,
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({
      error: 'Internal Server Error',
      message: 'An unexpected error occurred during login',
    });
  }
};

const register = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !name.trim() || !email || !email.trim() || !password) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'Name, email, and password are required',
      });
    }

    const cleanEmail = email.toLowerCase().trim();

    const existingUser = await prisma.user.findUnique({
      where: { email: cleanEmail },
    });

    if (existingUser) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'A user with this email address already exists',
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const userRole = role === 'ADMIN' ? 'ADMIN' : 'MEMBER';

    const newUser = await prisma.user.create({
      data: {
        name: name.trim(),
        email: cleanEmail,
        passwordHash: hashedPassword,
        role: userRole,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
      },
    });

    return res.status(201).json({
      message: `User ${newUser.name} created successfully`,
      user: newUser,
    });
  } catch (error) {
    console.error('Error creating user:', error);
    return res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to create user account.',
    });
  }
};

const deleteUser = async (req, res) => {
  try {
    const targetUserId = parseInt(req.params.id);
    const { reassignToId } = req.body || {};

    if (isNaN(targetUserId)) {
      return res.status(400).json({ error: 'Bad Request', message: 'Invalid user ID' });
    }

    if (targetUserId === req.user.id) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'You cannot delete your own admin account while logged in.',
      });
    }

    const targetUser = await prisma.user.findUnique({ where: { id: targetUserId } });
    if (!targetUser) {
      return res.status(404).json({ error: 'Not Found', message: 'User not found' });
    }

    // Determine target reassignment ID (null if unassigned, or parsed target user ID)
    let newAssigneeId = null;
    if (reassignToId !== undefined && reassignToId !== null && reassignToId !== 'null' && reassignToId !== '') {
      const parsedReassign = parseInt(reassignToId);
      if (!isNaN(parsedReassign) && parsedReassign !== targetUserId) {
        const replacementUser = await prisma.user.findUnique({ where: { id: parsedReassign } });
        if (replacementUser) {
          newAssigneeId = replacementUser.id;
        }
      }
    }

    // Reassign all leads owned by target user to the replacement rep (or Unassigned)
    const reassignedResult = await prisma.lead.updateMany({
      where: { assignedToId: targetUserId },
      data: { assignedToId: newAssigneeId },
    });

    await prisma.user.delete({ where: { id: targetUserId } });

    return res.status(200).json({
      message: `Team member "${targetUser.name}" removed successfully. ${reassignedResult.count} lead(s) reassigned.`,
      reassignedCount: reassignedResult.count,
    });
  } catch (error) {
    console.error('Error deleting user:', error);
    return res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to delete user account.',
    });
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
        createdAt: true,
      },
    });

    if (!user) {
      return res.status(404).json({ error: 'Not Found', message: 'User not found' });
    }

    return res.status(200).json({ user });
  } catch (error) {
    return res.status(500).json({ error: 'Internal Server Error', message: error.message });
  }
};

const getUsers = async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        _count: {
          select: { assignedLeads: true },
        },
      },
      orderBy: { name: 'asc' },
    });

    return res.status(200).json({ users });
  } catch (error) {
    return res.status(500).json({ error: 'Internal Server Error', message: error.message });
  }
};

module.exports = {
  login,
  register,
  deleteUser,
  getMe,
  getUsers,
};
