const express = require('express');
const router = express.Router();
const submissionController = require('../controllers/submissionController');

// Create submission
router.post('/', submissionController.create);

// Get submissions by form ID
router.get('/form/:formId', submissionController.getByFormId);

// Get submission by ID
router.get('/:id', submissionController.getById);

// Get submission by session ID
router.get('/session/:sessionId', submissionController.getBySessionId);

// Delete submission
router.delete('/:id', submissionController.delete);

module.exports = router;
