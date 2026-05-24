const express = require('express');
const router = express.Router();
const complaintController = require('../controllers/complaintController');
const auth = require('../middleware/authMiddleware');

// Public routes
router.post('/', complaintController.createComplaint);
router.get('/:id', complaintController.getComplaintByTrackingId);

// Admin only routes
router.get('/', auth, complaintController.getAllComplaints);
router.patch('/:id/status', auth, complaintController.updateStatus);
router.delete('/:id', auth, complaintController.deleteComplaint);

module.exports = router;
