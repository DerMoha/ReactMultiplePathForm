const db = require('../config/database');

class QuestionModel {
  static async create(data) {
    const { questionnaire_id, text, type, order_index, parent_option_id } = data;
    const [result] = await db.query(
      'INSERT INTO questions (questionnaire_id, text, type, order_index, parent_option_id) VALUES (?, ?, ?, ?, ?)',
      [questionnaire_id, text, type, order_index, parent_option_id || null]
    );
    return result.insertId;
  }

  static async update(id, data) {
    const { text, type, order_index, parent_option_id } = data;
    await db.query(
      'UPDATE questions SET text = ?, type = ?, order_index = ?, parent_option_id = ? WHERE id = ?',
      [text, type, order_index, parent_option_id || null, id]
    );
    return id;
  }

  static async delete(id) {
    await db.query('DELETE FROM questions WHERE id = ?', [id]);
    return true;
  }

  static async getById(id) {
    const [rows] = await db.query('SELECT * FROM questions WHERE id = ?', [id]);
    return rows[0];
  }
}

module.exports = QuestionModel;
