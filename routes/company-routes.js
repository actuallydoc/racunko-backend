const {createCompany} = require('../controllers/company-controllers');
const express = require('express');
const companyRouter = express.Router();


companyRouter.post('/create', createCompany)



module.exports = companyRouter;