const ResponseModel = require('../models/responseModel');

class ResponseController {
  static async create(req, res) {
    try {
      const { questionnaire_id, session_id, question_id, option_id } = req.body;

      if (!questionnaire_id || !session_id || !question_id || !option_id) {
        return res.status(400).json({ error: 'Missing required fields' });
      }

      const id = await ResponseModel.create({
        questionnaire_id,
        session_id,
        question_id,
        option_id
      });

      res.status(201).json({ id, message: 'Response saved' });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  static async getBySession(req, res) {
    try {
      const { sessionId } = req.params;
      const responses = await ResponseModel.getBySession(sessionId);
      res.json(responses);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  static async deleteBySession(req, res) {
    try {
      const { sessionId } = req.params;
      await ResponseModel.deleteBySession(sessionId);
      res.json({ message: 'Session responses deleted' });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
}

module.exports = ResponseController;
