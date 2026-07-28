const router = require('express').Router();
const { listPages, getPage, createPage, updatePage, deletePage } = require('../controllers/pages.controller');

router.get('/', listPages);
router.get('/:id', getPage);
router.post('/', createPage);
router.put('/:id', updatePage);
router.delete('/:id', deletePage);

module.exports = router;
