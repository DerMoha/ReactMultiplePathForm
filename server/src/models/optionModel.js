const db = require('../config/database');

class OptionModel {
  static async create(data) {
    const { question_id, text, order_index, next_question_id } = data;
    const [result] = await db.query(
      'INSERT INTO options (question_id, text, order_index, next_question_id) VALUES (?, ?, ?, ?)',
      [question_id, text, order_index, next_question_id || null]
    );
    return result.insertId;
  }

  static async update(id, data) {
    const { text, order_index, next_question_id } = data;
    await db.query(
      'UPDATE options SET text = ?, order_index = ?, next_question_id = ? WHERE id = ?',
      [text, order_index, next_question_id || null, id]
    );
    return id;
  }

  static async delete(id) {
    await db.query('DELETE FROM options WHERE id = ?', [id]);
    return true;
  }

  static async getById(id) {
    const [rows] = await db.query('SELECT * FROM options WHERE id = ?', [id]);
    return rows[0];
  }
}

module.exports = OptionModel;
