const express = require('express');
const router = express.Router();

// Example routes for vendors
router.get('/', (req, res) => {
    res.render('vendor/list'); // Adjust as necessary
});



module.exports = router;
