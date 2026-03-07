const express = require('express');
const router = express.Router();
const replyController = require('../controllers/replyController');

// POST /api/complaints — Create a new complaint
router.post('/', replyController.createComplaint);

// GET /api/complaints/:complaintId/replies
router.get('/:complaintId/replies', replyController.getReplies);

// POST /api/complaints/:complaintId/replies — Add reply
router.post('/:complaintId/replies', replyController.addReply);

module.exports = router;
