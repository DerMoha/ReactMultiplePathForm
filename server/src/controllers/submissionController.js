const submissionModel = require('../models/submissionModel');

const submissionController = {
  // Create submission with answers
  create: async (req, res) => {
    try {
      const { form_id, session_id, answers } = req.body;

      if (!form_id || !session_id || !answers) {
        return res.status(400).json({ error: 'Missing required fields: form_id, session_id, answers' });
      }

      const submissionId = await submissionModel.create(form_id, session_id, answers);
      res.status(201).json({
        id: submissionId,
        message: 'Submission created successfully'
      });
    } catch (error) {
      console.error('Error creating submission:', error);
      res.status(500).json({ error: 'Failed to create submission', details: error.message });
    }
  },

  // Get all submissions for a form
  getByFormId: async (req, res) => {
    try {
      const submissions = await submissionModel.getByFormId(req.params.formId);
      res.json(submissions);
    } catch (error) {
      console.error('Error getting submissions:', error);
      res.status(500).json({ error: 'Failed to get submissions' });
    }
  },

  // Get submission by ID with answers
  getById: async (req, res) => {
    try {
      const submission = await submissionModel.getById(req.params.id);
      if (!submission) {
        return res.status(404).json({ error: 'Submission not found' });
      }
      res.json(submission);
    } catch (error) {
      console.error('Error getting submission:', error);
      res.status(500).json({ error: 'Failed to get submission' });
    }
  },

  // Get submission by session ID
  getBySessionId: async (req, res) => {
    try {
      const submission = await submissionModel.getBySessionId(req.params.sessionId);
      if (!submission) {
        return res.status(404).json({ error: 'Submission not found' });
      }
      res.json(submission);
    } catch (error) {
      console.error('Error getting submission:', error);
      res.status(500).json({ error: 'Failed to get submission' });
    }
  },

  // Delete submission
  delete: async (req, res) => {
    try {
      await submissionModel.delete(req.params.id);
      res.json({ message: 'Submission deleted successfully' });
    } catch (error) {
      console.error('Error deleting submission:', error);
      res.status(500).json({ error: 'Failed to delete submission' });
    }
  }
};

module.exports = submissionController;
