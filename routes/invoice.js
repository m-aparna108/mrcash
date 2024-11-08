const express = require('express');
const router = express.Router();
const db = require('C:/Users/APARNA/OneDrive/Desktop/final/model/db');
const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

// Ensure the invoices directory exists
const invoiceFolder = path.join(__dirname,'..','invoices');
// Log the resolved path to ensure it's correct
console.log('Invoice Folder Path:', invoiceFolder);

// Check if the folder exists, if not create it
if (!fs.existsSync(invoiceFolder)) {
    fs.mkdirSync(invoiceFolder);
}

// Route to generate invoice PDF
router.post('/:po_id', (req, res) => {
    const poId = req.params.po_id;
    console.log('Received PO ID:', poId); // Log the received PO ID

    // Fetch purchase order data, including vendor name
    const orderQuery = `
        SELECT po.po_id, po.vendor_id, po.orderdate, po.total_amount, v.vendor_name
        FROM Purchase_Order AS po
        JOIN vendor AS v ON po.vendor_id = v.vendor_id
        WHERE po.po_id = ?`;
    db.query(orderQuery, [poId], (err, orderResults) => {
        if (err) {
            console.error('Error fetching purchase order:', err);
            return res.status(500).send('Error fetching purchase order');
        }
        
        if (orderResults.length === 0) {
            return res.status(404).send('Purchase order not found');
        }

        const order = orderResults[0]; // Now includes vendor_name

        // Fetch associated items, including product names
        const itemsQuery = `
            SELECT poi.product_id, poi.Qty, poi.PurchaseRate_per_unit, p.product_name
            FROM Purchase_Order_Items AS poi
            JOIN product AS p ON poi.product_id = p.product_id
            WHERE poi.po_id = ?`;
        db.query(itemsQuery, [poId], (err, itemsResults) => {
            if (err) {
                console.error('Error fetching order items:', err);
                return res.status(500).send('Error fetching order items');
            }

            // Generate PDF
            const doc = new PDFDocument();
            const filePath = path.join(invoiceFolder, `invoice_${poId}.pdf`);  // Use the invoiceFolder path here

            // Pipe the PDF into a file
            const fileStream = fs.createWriteStream(filePath);
            doc.pipe(fileStream);

            // Document content
            doc.fontSize(25).text('Invoice', { align: 'center' });
            doc.moveDown();

            doc.fontSize(20).text(`Invoice Number: ${order.po_id}`);
            doc.text(`Vendor ID: ${order.vendor_id}`);
            doc.text(`Vendor Name: ${order.vendor_name}`); // Added Vendor Name
            doc.text(`Order Date: ${order.orderdate}`);
            doc.text(`Total Amount: ${order.total_amount}`);
            doc.moveDown();

            doc.text('Items:', { underline: true });
            itemsResults.forEach(item => {
                doc.text(`Product Name: ${item.product_name}, Product ID: ${item.product_id}, Quantity: ${item.Qty}, Rate: ${item.PurchaseRate_per_unit}`);
            });

            doc.end();

            // Wait until the file is fully written
            fileStream.on('finish', () => {
                console.log('PDF file generated successfully:', filePath);

                // Read the generated PDF file and save it to the database
                fs.readFile(filePath, (err, data) => {
                    if (err) {
                        console.error('Error reading PDF file:', err);
                        return res.status(500).send('Failed to read PDF');
                    }

                    // Insert the PDF as binary data into the database
                    const insertQuery = 'INSERT INTO purchaseinvoice (po_id, invoice_pdf) VALUES (?, ?)';
                    db.query(insertQuery, [poId, data], (err, result) => {
                        if (err) {
                            console.error('Error saving PDF to database:', err);
                            return res.status(500).send('Failed to save PDF');
                        }
                        console.log('PDF saved to database successfully');
                    });
                });
                // After the file is fully written, serve the download
                res.download(filePath, `invoice_${poId}.pdf`, (err) => {
                    if (err) {
                        console.error('Error downloading the PDF:', err);
                        return res.status(500).json({ error: 'Error downloading the PDF' });
                    }

                    // Optionally delete the file after download
                    fs.unlink(filePath, (err) => {
                        if (err) console.error('Error deleting the PDF file:', err);
                    });
                });
            });

            fileStream.on('error', (err) => {
                console.error('Error writing file:', err);
                return res.status(500).send('Error writing the invoice PDF');
            });

        });
    });
});

module.exports = router;
