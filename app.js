// Import required modules
const express = require('express');
const path = require('path');
const db = require('./model/db'); // Assuming db.js is in the model folder

// Initialize the Express app
const app = express();

// Set the view engine to EJS
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views')); // Specify the views folder

// Middleware to parse incoming request bodies
app.use(express.urlencoded({ extended: true })); // For form submissions
app.use(express.json()); // For JSON payloads

// Serve static files (CSS, images, etc.)
app.use(express.static(path.join(__dirname, 'public')));

// Import route files
const purchaseRoutes = require('./routes/purchase');
const inventoryRoutes = require('./routes/inventory');
const saleRoutes = require('./routes/sale');
const vendorRoutes = require('./routes/vendor');
const reportRoutes = require('./routes/report');
const invoiceRouter = require('./routes/invoice');


// Use routes
app.use('/purchase', purchaseRoutes);
app.use('/inventory', inventoryRoutes);
app.use('/sale', saleRoutes);
app.use('/vendor', vendorRoutes);
app.use('/report', reportRoutes);
app.use('/invoice', invoiceRouter);


// Set up a basic route
app.get('/', (req, res) => {
    res.render('index'); // You can create an index.ejs file as the homepage
});

app.get('/index', (req, res) => {
    res.render('index'); // Renders index.ejs
});




// Start the server
const PORT = process.env.PORT || 3000; // Use environment variable or default to 3000
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});

//reading invoice
app.get('/download/:po_id', (req, res) => {
    const poId = req.params.po_id;

    const query = 'SELECT invoice_pdf FROM purchaseinvoice WHERE po_id = ?';
    db.query(query, [poId], (err, result) => {
        if (err || result.length === 0) {
            console.error('Error retrieving PDF:', err);
            return res.status(404).send('PDF not found');
        }
        const pdfData = result[0].invoice_pdf;
        //res.contentType("application/pdf");---for testing
        if (!pdfData) {
            return res.status(404).send('PDF data not found');
        }

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', 'inline; filename="invoice.pdf"');

        res.send(pdfData);
    });
});


// Error handling for 404
app.use((req, res) => {
    res.status(404).send('Page not found');
});


/*
app.get('/purchaselist', (req, res) => {
    const query = 'SELECT * FROM purchase_order';  // Modify based on your actual query needs
    db.query(query, (err, results) => {
        if (err) {
            console.error('Error fetching purchase orders:', err);
            return res.status(500).send('Error fetching purchase orders');
        }

        // Now, for each purchase order, check if it has an invoice
        results.forEach(order => {
            const invoiceQuery = 'SELECT * FROM purchaseinvoice WHERE po_id = ?';
            db.query(invoiceQuery, [order.po_id], (err, invoiceResult) => {
                if (err) {
                    console.error('Error fetching invoice:', err);
                    return;
                }
                // If there's an invoice, set the link to it
                if (invoiceResult.length > 0) {
                    order.invoice_pdf = `/purchase/download/${order.po_id}`;  // The URL to view the PDF
                } else {
                    order.invoice_pdf = null;  // If no invoice, set it to null
                }
            });
        });

        // Pass the data to the EJS template
        res.render('purchase/purchaselist', { purchaseOrders: results });
    });
});*/

//this is a comment

