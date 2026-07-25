const express = require('express');
const { login, register, deleteUser, getMe, getUsers } = require('../controllers/authController');
const authMiddleware = require('../middleware/authMiddleware');
const { requireAdmin } = require('../middleware/roleGuard');

const router = express.Router();

router.post('/login', login);
router.post('/register', authMiddleware, requireAdmin, register);
router.delete('/users/:id', authMiddleware, requireAdmin, deleteUser);
router.get('/me', authMiddleware, getMe);
router.get('/users', authMiddleware, getUsers);

module.exports = router;
