const pool = require('../config/database');

const formModel = {
  // Get all forms
  getAll: async () => {
    const [rows] = await pool.query(
      'SELECT * FROM forms ORDER BY created_at DESC'
    );
    return rows;
  },

  // Get form by ID with all related data
  getById: async (id) => {
    // Get form
    const [forms] = await pool.query('SELECT * FROM forms WHERE id = ?', [id]);
    if (forms.length === 0) return null;

    const form = forms[0];

    // Get sections
    const [sections] = await pool.query(
      'SELECT * FROM sections WHERE form_id = ? ORDER BY order_index',
      [id]
    );

    // Get all questions for this form
    const [questions] = await pool.query(`
      SELECT q.* FROM questions q
      INNER JOIN sections s ON q.section_id = s.id
      WHERE s.form_id = ?
      ORDER BY s.order_index, q.order_index
    `, [id]);

    // Get all options
    const questionIds = questions.map(q => q.id);
    let options = [];
    if (questionIds.length > 0) {
      const [optionRows] = await pool.query(`
        SELECT * FROM options
        WHERE question_id IN (?)
        ORDER BY order_index
      `, [questionIds]);
      options = optionRows;
    }

    // Get all conditions
    let conditions = [];
    if (questionIds.length > 0) {
      const [conditionRows] = await pool.query(`
        SELECT * FROM conditions
        WHERE question_id IN (?)
      `, [questionIds]);
      conditions = conditionRows;
    }

    // Build the structure
    form.sections = sections.map(section => ({
      ...section,
      questions: questions
        .filter(q => q.section_id === section.id)
        .map(question => ({
          ...question,
          options: options.filter(o => o.question_id === question.id),
          conditions: conditions.filter(c => c.question_id === question.id)
        }))
    }));

    return form;
  },

  // Create form
  create: async (formData) => {
    const [result] = await pool.query(
      'INSERT INTO forms (title, description) VALUES (?, ?)',
      [formData.title, formData.description]
    );
    return result.insertId;
  },

  // Update form
  update: async (id, formData) => {
    await pool.query(
      'UPDATE forms SET title = ?, description = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [formData.title, formData.description, id]
    );
    return id;
  },

  // Delete form
  delete: async (id) => {
    await pool.query('DELETE FROM forms WHERE id = ?', [id]);
    return true;
  },

  // Save complete form with sections, questions, options, and conditions
  saveComplete: async (formData) => {
    const connection = await pool.getConnection();

    try {
      await connection.beginTransaction();

      let formId;

      // Create or update form
      if (formData.id) {
        formId = formData.id;
        await connection.query(
          'UPDATE forms SET title = ?, description = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
          [formData.title, formData.description, formId]
        );

        // Delete existing sections (cascade will delete questions, options, conditions)
        await connection.query('DELETE FROM sections WHERE form_id = ?', [formId]);
      } else {
        const [result] = await connection.query(
          'INSERT INTO forms (title, description) VALUES (?, ?)',
          [formData.title, formData.description]
        );
        formId = result.insertId;
      }

      // Insert sections, questions, options, and conditions
      if (formData.sections && formData.sections.length > 0) {
        for (const section of formData.sections) {
          const [sectionResult] = await connection.query(
            'INSERT INTO sections (form_id, title, order_index, is_collapsible) VALUES (?, ?, ?, ?)',
            [formId, section.title, section.order_index, section.is_collapsible !== false]
          );
          const sectionId = sectionResult.insertId;

          if (section.questions && section.questions.length > 0) {
            for (const question of section.questions) {
              const [questionResult] = await connection.query(
                'INSERT INTO questions (section_id, text, type, order_index, is_required, placeholder) VALUES (?, ?, ?, ?, ?, ?)',
                [sectionId, question.text, question.type, question.order_index, question.is_required || false, question.placeholder || null]
              );
              const questionId = questionResult.insertId;

              // Insert options for radio/checkbox questions
              if ((question.type === 'radio' || question.type === 'checkbox') && question.options) {
                const optionIdMap = {}; // Map temp IDs to real IDs

                for (const option of question.options) {
                  const [optionResult] = await connection.query(
                    'INSERT INTO options (question_id, text, value, order_index) VALUES (?, ?, ?, ?)',
                    [questionId, option.text, option.value, option.order_index]
                  );
                  optionIdMap[option.tempId || option.id] = optionResult.insertId;
                }

                // Insert conditions
                if (question.conditions && question.conditions.length > 0) {
                  for (const condition of question.conditions) {
                    const realOptionId = optionIdMap[condition.depends_on_option_id] || condition.depends_on_option_id;
                    await connection.query(
                      'INSERT INTO conditions (question_id, depends_on_option_id, condition_type) VALUES (?, ?, ?)',
                      [questionId, realOptionId, condition.condition_type || 'show_if_selected']
                    );
                  }
                }
              }
            }
          }
        }
      }

      await connection.commit();
      return formId;

    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }
};

module.exports = formModel;
