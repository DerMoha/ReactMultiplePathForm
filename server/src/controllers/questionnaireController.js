const QuestionnaireModel = require('../models/questionnaireModel');
const QuestionModel = require('../models/questionModel');
const OptionModel = require('../models/optionModel');

class QuestionnaireController {
  static async getAll(req, res) {
    try {
      const questionnaires = await QuestionnaireModel.getAll();
      res.json(questionnaires);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  static async getById(req, res) {
    try {
      const { id } = req.params;
      const questionnaire = await QuestionnaireModel.getWithQuestions(id);

      if (!questionnaire) {
        return res.status(404).json({ error: 'Questionnaire not found' });
      }

      res.json(questionnaire);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  static async create(req, res) {
    try {
      const { title, description } = req.body;

      if (!title) {
        return res.status(400).json({ error: 'Title is required' });
      }

      const id = await QuestionnaireModel.create({ title, description });
      const questionnaire = await QuestionnaireModel.getById(id);

      res.status(201).json(questionnaire);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  static async update(req, res) {
    try {
      const { id } = req.params;
      const questionnaire = await QuestionnaireModel.update(id, req.body);

      if (!questionnaire) {
        return res.status(404).json({ error: 'Questionnaire not found' });
      }

      res.json(questionnaire);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  static async delete(req, res) {
    try {
      const { id } = req.params;
      await QuestionnaireModel.delete(id);
      res.json({ message: 'Questionnaire deleted successfully' });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  static async saveComplete(req, res) {
    try {
      const { questionnaire } = req.body;

      if (!questionnaire || !questionnaire.title) {
        return res.status(400).json({ error: 'Invalid questionnaire data' });
      }

      // Create or update questionnaire
      let questionnaireId;
      if (questionnaire.id) {
        await QuestionnaireModel.update(questionnaire.id, {
          title: questionnaire.title,
          description: questionnaire.description
        });
        questionnaireId = questionnaire.id;
      } else {
        questionnaireId = await QuestionnaireModel.create({
          title: questionnaire.title,
          description: questionnaire.description
        });
      }

      // Delete existing questions and options (cascade will handle options)
      const existingQuestionnaire = await QuestionnaireModel.getWithQuestions(questionnaireId);
      if (existingQuestionnaire && existingQuestionnaire.questions) {
        for (const q of existingQuestionnaire.questions) {
          await QuestionModel.delete(q.id);
        }
      }

      // Create questions and options
      if (questionnaire.questions && questionnaire.questions.length > 0) {
        const questionIdMap = new Map(); // Map temporary IDs to real IDs

        for (const question of questionnaire.questions) {
          const questionId = await QuestionModel.create({
            questionnaire_id: questionnaireId,
            text: question.text,
            type: question.type,
            order_index: question.order_index,
            parent_option_id: question.parent_option_id
          });

          questionIdMap.set(question.tempId || question.id, questionId);

          if (question.options && question.options.length > 0) {
            for (const option of question.options) {
              await OptionModel.create({
                question_id: questionId,
                text: option.text,
                order_index: option.order_index,
                next_question_id: option.next_question_id
              });
            }
          }
        }
      }

      const savedQuestionnaire = await QuestionnaireModel.getWithQuestions(questionnaireId);
      res.json(savedQuestionnaire);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
}

module.exports = QuestionnaireController;
