const db = require('../config/database');

class ResponseModel {
  static async create(data) {
    const { questionnaire_id, session_id, question_id, option_id } = data;
    const [result] = await db.query(
      'INSERT INTO responses (questionnaire_id, session_id, question_id, option_id) VALUES (?, ?, ?, ?)',
      [questionnaire_id, session_id, question_id, option_id]
    );
    return result.insertId;
  }

  static async getBySession(sessionId) {
    const [rows] = await db.query(
      'SELECT * FROM responses WHERE session_id = ? ORDER BY created_at',
      [sessionId]
    );
    return rows;
  }

  static async deleteBySession(sessionId) {
    await db.query('DELETE FROM responses WHERE session_id = ?', [sessionId]);
    return true;
  }
}

module.exports = ResponseModel;
