const express = require('express');
const router = express.Router();

// Example routes for sales
router.get('/', (req, res) => {
    res.render('sale/list'); // Adjust as necessary
});

router.get('/create', (req, res) => {
    res.render('sale/create');
});

router.get('/return', (req, res) => {
    res.render('sale/return');
});

module.exports = router;
