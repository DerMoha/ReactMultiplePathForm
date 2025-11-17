const pool = require('../config/database');

const submissionModel = {
  // Create a submission with all answers
  create: async (formId, sessionId, answers) => {
    const connection = await pool.getConnection();

    try {
      await connection.beginTransaction();

      // Create submission
      const [result] = await connection.query(
        'INSERT INTO submissions (form_id, session_id) VALUES (?, ?)',
        [formId, sessionId]
      );
      const submissionId = result.insertId;

      // Insert all answers
      if (answers && answers.length > 0) {
        for (const answer of answers) {
          await connection.query(
            'INSERT INTO answers (submission_id, question_id, option_id, text_value) VALUES (?, ?, ?, ?)',
            [submissionId, answer.question_id, answer.option_id || null, answer.text_value || null]
          );
        }
      }

      await connection.commit();
      return submissionId;

    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  },

  // Get all submissions for a form
  getByFormId: async (formId) => {
    const [rows] = await pool.query(`
      SELECT
        s.id,
        s.form_id,
        s.session_id,
        s.created_at,
        f.title as form_title
      FROM submissions s
      INNER JOIN forms f ON s.form_id = f.id
      WHERE s.form_id = ?
      ORDER BY s.created_at DESC
    `, [formId]);

    return rows;
  },

  // Get submission by ID with all answers
  getById: async (id) => {
    const [submissions] = await pool.query(`
      SELECT
        s.*,
        f.title as form_title
      FROM submissions s
      INNER JOIN forms f ON s.form_id = f.id
      WHERE s.id = ?
    `, [id]);

    if (submissions.length === 0) return null;

    const submission = submissions[0];

    // Get all answers for this submission
    const [answers] = await pool.query(`
      SELECT
        a.*,
        q.text as question_text,
        q.type as question_type,
        o.text as option_text
      FROM answers a
      INNER JOIN questions q ON a.question_id = q.id
      LEFT JOIN options o ON a.option_id = o.id
      WHERE a.submission_id = ?
      ORDER BY q.order_index
    `, [id]);

    submission.answers = answers;

    return submission;
  },

  // Get submission by session ID
  getBySessionId: async (sessionId) => {
    const [submissions] = await pool.query(`
      SELECT
        s.*,
        f.title as form_title
      FROM submissions s
      INNER JOIN forms f ON s.form_id = f.id
      WHERE s.session_id = ?
    `, [sessionId]);

    if (submissions.length === 0) return null;

    const submission = submissions[0];

    // Get all answers
    const [answers] = await pool.query(`
      SELECT
        a.*,
        q.text as question_text,
        q.type as question_type,
        o.text as option_text
      FROM answers a
      INNER JOIN questions q ON a.question_id = q.id
      LEFT JOIN options o ON a.option_id = o.id
      WHERE a.submission_id = ?
      ORDER BY q.order_index
    `, [submission.id]);

    submission.answers = answers;

    return submission;
  },

  // Delete submission
  delete: async (id) => {
    await pool.query('DELETE FROM submissions WHERE id = ?', [id]);
    return true;
  }
};

module.exports = submissionModel;
