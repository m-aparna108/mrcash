const express = require('express');
const router = express.Router();
const db = require('C:/Users/APARNA/OneDrive/Desktop/final/model/db'); // Ensure you have your DB connection here

// Example routes
/*router.get('/list', (req, res) => {
    res.render('purchase/purchaselist'); // renders purchase list page
});*/

router.get('/create', (req, res) => {
    res.render('purchase/createpurchase'); // This should render your create purchase page
});



router.get('/products', (req, res) => {
    const query = 'SELECT product_id, product_name, unit_price FROM product'; // Adjust as necessary
    db.query(query, (err, results) => {
        if (err) {
            console.error('Database error fetching products:', err);
            return res.status(500).json({ error: err });
        }
        res.json(results);
        
    });
});

router.get('/vendors', (req, res) => {
    const query = 'SELECT vendor_id, vendor_name FROM vendor'; // Adjust as necessary
    db.query(query, (err,results) => {
        if (err) {
            console.error('Database error fetching vendors:', err);
            return res.status(500).json({ error: err });
        }
        res.json(results);
        
        //res.render('purchase/createpurchase', { vendors }); // Pass vendors to the template
    });
});

// Route to handle purchase order submission
router.post('/submit', (req, res) => {
    const { po_id, vendor_id, orderdate, total_amount, items } = req.body;

    // Insert into Purchase_Order
    const insertOrderQuery = `
        INSERT INTO Purchase_Order (po_id, vendor_id, orderdate, delivery_status, total_amount) 
        VALUES (?, ?, ?, 'undelivered', ?)`;
    
    db.query(insertOrderQuery, [po_id, vendor_id, orderdate, total_amount], (err, result) => {
        if (err) {
            console.error('Error inserting into Purchase_Order:', err);
            return res.status(500).send('Error inserting purchase order');
        }

        const poId = result.insertId; // Get the inserted purchase order ID

        // Prepare items for bulk insert
        const insertItemsQuery = `
            INSERT INTO Purchase_Order_Items (po_id, product_id, Qty, PurchaseRate_per_unit) 
            VALUES ?`;

        const itemsValues = items.map(item => [po_id, item.product_id, item.qty, item.purchaseRate_per_unit]);

        db.query(insertItemsQuery, [itemsValues], (err) => {
            if (err) {
                console.error('Error inserting into Purchase_Order_Items:', err);
                return res.status(500).send('Error inserting purchase order items');
            }

            // Successfully inserted both order and items
            res.status(200).send('Purchase order submitted successfully');
            //res.render('purchase/createpurchase', { po_id:po_id });
        });
    });
});

// Route for the index page
/*router.get('/index', (req, res) => {
    res.render('index'); // Renders index.ejs
});*/

// Get Purchase List
router.get('/list', async(req, res) => {
    const query = 'SELECT * FROM Purchase_Order';
    //---------------------testing-----------------------------
    try {
        // Fetch all purchase orders
        const [purchaseOrders] = await db.promise().query(query); // Using promise() for async/await
        console.log("Orders fetched:", purchaseOrders);//----testing---

        // For each purchase order, fetch the associated invoice
        for (const order of purchaseOrders) {
            const invoiceQuery = 'SELECT * FROM purchaseinvoice WHERE po_id = ?';
            const [invoiceResult] = await db.promise().query(invoiceQuery, [order.po_id]);

            // If there's an invoice, set the link to it
            if (invoiceResult.length > 0) {
                order.invoice_pdf = `/download/${order.po_id}`;  // The URL to view the PDF
                console.log(`PDF found for PO ${order.po_id}`);//-----testing---
            } else {
                order.invoice_pdf = null;  // If no invoice, set it to null
                console.log(`No PDF for PO ${order.po_id}`);//---testing---
            }
        }

        // Render the list with purchaseOrders now containing invoice_pdf links
        res.render('purchase/purchaselist', { purchaseOrders });

    } catch (err) {
        console.error('Error fetching purchase orders or invoices:', err);
        res.status(500).send('Error fetching purchase orders or invoices');
    }
    ///----------------------testing------------------------------
    /*db.query(query, (err, results) => {
        if (err) {
            return res.status(500).send('Error fetching purchase orders');
        }
        res.render('purchase/purchaselist', { purchaseOrders: results });
    });*/
});

// Delete Purchase Order
router.post('/delete/:id', (req, res) => {
    const orderId = req.params.id;

    // Start a transaction
    db.beginTransaction(err => {
        if (err) {
            return res.status(500).send('Error starting transaction');
        }

        // Delete from purchase_order_items
        const deleteItemsQuery = 'DELETE FROM purchase_order_items WHERE po_id = ?';
        db.query(deleteItemsQuery, [orderId], (err) => {
            if (err) {
                return db.rollback(() => {
                    res.status(500).send('Error deleting from purchase_order_items');
                });
            }

            // Delete from Purchase_Order
            const deleteOrderQuery = 'DELETE FROM Purchase_Order WHERE po_id = ?';
            db.query(deleteOrderQuery, [orderId], (err) => {
                if (err) {
                    return db.rollback(() => {
                        res.status(500).send('Error deleting from Purchase_Order');
                    });
                }

                // Commit the transaction
                db.commit(err => {
                    if (err) {
                        return db.rollback(() => {
                            res.status(500).send('Error committing transaction');
                        });
                    }
                    res.redirect('/purchase/list');
                });
            });
        });
    });
});

// Update Delivery Status
router.post('/update-status/:id', (req, res) => {
    const orderId = req.params.id;
    const { delivery_status } = req.body; // Capture the new status from the form

    const updateQuery = 'UPDATE Purchase_Order SET delivery_status = ? WHERE po_id = ?';
    
    db.query(updateQuery, [delivery_status, orderId], (err) => {
        if (err) {
            console.error('Error updating delivery status:', err);
            return res.status(500).send('Error updating delivery status');
        }
        res.redirect('/purchase/list'); // Redirect back to the purchase list
    });
});

//--------------------------------------------------------------------------------------------------//
// GET route to fetch purchase orders with optional filters
router.get('/purchase', async (req, res) => {
    const { orderDate, orderId, supplier, deliveryStatus } = req.query;

    let query = 'SELECT * FROM Purchase_Order WHERE 1=1'; // 1=1 for easier condition appending
    const queryParams = [];

    if (orderDate) {
        query += ' AND orderdate = ?';
        queryParams.push(orderDate);
    }
    if (orderId) {
        query += ' AND po_id = ?';
        queryParams.push(orderId);
    }
    if (supplier) {
        query += ' AND vendor_id IN (SELECT vendor_id FROM vendor WHERE name LIKE ?)';
        queryParams.push(`%${supplier}%`);
    }
    if (deliveryStatus) {
        query += ' AND delivery_status = ?';
        queryParams.push(deliveryStatus);
    }

    try {
        const [purchaseOrders] = await db.execute(query, queryParams);
        res.render('createpurchase', { purchaseOrders });
    } catch (error) {
        console.error('Database query failed:', error);
        res.status(500).send('Internal Server Error');
    }
});
//----------------------------------------------------------------------------//

module.exports = router;

