const formModel = require('../models/formModel');

const formController = {
  // Get all forms
  getAll: async (req, res) => {
    try {
      const forms = await formModel.getAll();
      res.json(forms);
    } catch (error) {
      console.error('Error getting forms:', error);
      res.status(500).json({ error: 'Failed to get forms' });
    }
  },

  // Get form by ID with all sections, questions, options, and conditions
  getById: async (req, res) => {
    try {
      const form = await formModel.getById(req.params.id);
      if (!form) {
        return res.status(404).json({ error: 'Form not found' });
      }
      res.json(form);
    } catch (error) {
      console.error('Error getting form:', error);
      res.status(500).json({ error: 'Failed to get form' });
    }
  },

  // Create form
  create: async (req, res) => {
    try {
      const id = await formModel.create(req.body);
      res.status(201).json({ id, message: 'Form created successfully' });
    } catch (error) {
      console.error('Error creating form:', error);
      res.status(500).json({ error: 'Failed to create form' });
    }
  },

  // Update form
  update: async (req, res) => {
    try {
      await formModel.update(req.params.id, req.body);
      res.json({ message: 'Form updated successfully' });
    } catch (error) {
      console.error('Error updating form:', error);
      res.status(500).json({ error: 'Failed to update form' });
    }
  },

  // Delete form
  delete: async (req, res) => {
    try {
      await formModel.delete(req.params.id);
      res.json({ message: 'Form deleted successfully' });
    } catch (error) {
      console.error('Error deleting form:', error);
      res.status(500).json({ error: 'Failed to delete form' });
    }
  },

  // Save complete form (create or update with all nested data)
  saveComplete: async (req, res) => {
    try {
      const formData = req.body.form || req.body;
      const formId = await formModel.saveComplete(formData);
      res.json({
        id: formId,
        message: formData.id ? 'Form updated successfully' : 'Form created successfully'
      });
    } catch (error) {
      console.error('Error saving form:', error);
      res.status(500).json({ error: 'Failed to save form', details: error.message });
    }
  }
};

module.exports = formController;
