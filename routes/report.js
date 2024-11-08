const express = require('express');
const router = express.Router();

// Example routes for reports
router.get('/sales', (req, res) => {
    res.render('report/sales'); // Adjust as necessary
});



module.exports = router;
