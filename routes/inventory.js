const express = require('express');
const router = express.Router();

// Example routes for inventory
router.get('/', (req, res) => {
    res.render('inventory/list'); // Adjust as necessary
});



module.exports = router;
