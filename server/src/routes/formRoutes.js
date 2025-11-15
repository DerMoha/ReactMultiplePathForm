const express = require('express');
const router = express.Router();
const formController = require('../controllers/formController');

// Get all forms
router.get('/', formController.getAll);

// Get form by ID
router.get('/:id', formController.getById);

// Create form
router.post('/', formController.create);

// Update form
router.put('/:id', formController.update);

// Delete form
router.delete('/:id', formController.delete);

// Save complete form (with all nested data)
router.post('/save-complete', formController.saveComplete);

module.exports = router;
