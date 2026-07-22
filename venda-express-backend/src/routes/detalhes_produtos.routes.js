const express = require('express');
const router = express.Router();
const { getProductFullDetails } = require('../controllers/detalhes_produtos.controller');

// GET /api/detalhes-produtos/:id
router.get('/:id', getProductFullDetails);

module.exports = router;