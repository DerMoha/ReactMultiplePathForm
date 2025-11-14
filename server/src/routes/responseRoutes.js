const express = require('express');
const router = express.Router();
const ResponseController = require('../controllers/responseController');

router.post('/', ResponseController.create);
router.get('/session/:sessionId', ResponseController.getBySession);
router.delete('/session/:sessionId', ResponseController.deleteBySession);

module.exports = router;
