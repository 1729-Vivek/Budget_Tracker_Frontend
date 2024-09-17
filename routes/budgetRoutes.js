const express = require('express');
const { getBudgets, addBudget, deleteBudget } = require('../controllers/budgetController');

const router = express.Router();

router.get('/', getBudgets);
router.post('/', addBudget);
router.delete('/:id', deleteBudget);

module.exports = router;
