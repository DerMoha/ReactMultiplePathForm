const db = require('../config/database');

class QuestionnaireModel {
  static async getAll() {
    const [rows] = await db.query('SELECT * FROM questionnaires ORDER BY created_at DESC');
    return rows;
  }

  static async getById(id) {
    const [rows] = await db.query('SELECT * FROM questionnaires WHERE id = ?', [id]);
    return rows[0];
  }

  static async create(data) {
    const { title, description } = data;
    const [result] = await db.query(
      'INSERT INTO questionnaires (title, description) VALUES (?, ?)',
      [title, description]
    );
    return result.insertId;
  }

  static async update(id, data) {
    const { title, description } = data;
    await db.query(
      'UPDATE questionnaires SET title = ?, description = ? WHERE id = ?',
      [title, description, id]
    );
    return this.getById(id);
  }

  static async delete(id) {
    await db.query('DELETE FROM questionnaires WHERE id = ?', [id]);
    return true;
  }

  static async getWithQuestions(id) {
    // Get questionnaire
    const questionnaire = await this.getById(id);
    if (!questionnaire) return null;

    // Get all questions for this questionnaire
    const [questions] = await db.query(
      'SELECT * FROM questions WHERE questionnaire_id = ? ORDER BY order_index',
      [id]
    );

    // Get all options for these questions
    for (let question of questions) {
      const [options] = await db.query(
        'SELECT * FROM options WHERE question_id = ? ORDER BY order_index',
        [question.id]
      );
      question.options = options;
    }

    questionnaire.questions = questions;
    return questionnaire;
  }
}

module.exports = QuestionnaireModel;
