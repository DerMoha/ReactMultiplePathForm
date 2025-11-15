const express = require('express');
const router = express.Router();
const QuestionnaireController = require('../controllers/questionnaireController');

router.get('/', QuestionnaireController.getAll);
router.get('/:id', QuestionnaireController.getById);
router.post('/', QuestionnaireController.create);
router.put('/:id', QuestionnaireController.update);
router.delete('/:id', QuestionnaireController.delete);
router.post('/save-complete', QuestionnaireController.saveComplete);

module.exports = router;
