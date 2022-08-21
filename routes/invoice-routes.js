const {createInvoice,getInvoices, removeInvoice, updateInvoice} = require('../controllers/invoice-controllers');
const express = require('express');
const {verifyToken} = require("../controllers/user-controllers");
const InvoiceRouter = express.Router();


InvoiceRouter.post('/create',verifyToken, createInvoice)
InvoiceRouter.get('/get', verifyToken,getInvoices)
InvoiceRouter.post('/delete', verifyToken, removeInvoice)
InvoiceRouter.post('/update', verifyToken, updateInvoice)

module.exports = InvoiceRouter;