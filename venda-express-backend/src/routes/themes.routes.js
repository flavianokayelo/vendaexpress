const router = require('express').Router();
const { listThemes } = require('../controllers/themes.controller');

router.get('/', listThemes);

module.exports = router;
