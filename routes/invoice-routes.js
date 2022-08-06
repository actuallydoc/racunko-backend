const {createInvoice,getInvoice} = require('../controllers/invoice-controllers');
const express = require('express');
const InvoiceRouter = express.Router();


InvoiceRouter.post('/create', createInvoice)
InvoiceRouter.post('/get', getInvoice)


module.exports = InvoiceRouter;