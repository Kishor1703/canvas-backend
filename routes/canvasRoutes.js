const express = require('express');
const router = express.Router();
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });
const { createCanvasAPI, addElementAPI, exportPDFAPI } = require('../controllers/canvasController');

router.post('/create', createCanvasAPI);

router.post('/add', upload.single('image'), addElementAPI);

router.get('/export', exportPDFAPI);

module.exports = router;
