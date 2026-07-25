const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const authMiddleware = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      error: 'Unauthorized',
      message: 'Access token is missing or malformed',
    });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'digital_heroes_super_secret_jwt_key_2026');

    // Prioritize email lookup first for exact user identity match, then fallback to ID
    let dbUser = null;
    if (decoded.email) {
      dbUser = await prisma.user.findUnique({
        where: { email: decoded.email.toLowerCase().trim() },
      });
    }
    
    if (!dbUser && decoded.id) {
      dbUser = await prisma.user.findUnique({
        where: { id: parseInt(decoded.id) },
      });
    }

    if (!dbUser) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'Your login session is invalid. Please log out and log in again.',
      });
    }

    req.user = {
      id: dbUser.id,
      email: dbUser.email,
      name: dbUser.name,
      role: dbUser.role,
    };
    next();
  } catch (error) {
    return res.status(401).json({
      error: 'Unauthorized',
      message: 'Invalid or expired token',
    });
  }
};

module.exports = authMiddleware;
