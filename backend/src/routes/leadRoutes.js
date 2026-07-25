const express = require('express');
const {
  createPublicLead,
  getLeads,
  getLeadById,
  updateLead,
  deleteLead,
  addNote,
} = require('../controllers/leadController');
const authMiddleware = require('../middleware/authMiddleware');
const { requireAdmin } = require('../middleware/roleGuard');

const router = express.Router();

// Public capture route
router.post('/public', createPublicLead);

// Protected routes
router.get('/', authMiddleware, getLeads);
router.get('/:id', authMiddleware, getLeadById);
router.patch('/:id', authMiddleware, updateLead);
router.post('/:id/notes', authMiddleware, addNote);

// Admin-only route
router.delete('/:id', authMiddleware, requireAdmin, deleteLead);

module.exports = router;
