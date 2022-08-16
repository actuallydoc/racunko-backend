const {createCompany, getCompanies,updateCompany} = require('../controllers/company-controllers');
const express = require('express');
const {verifyToken} = require("../controllers/user-controllers");

const companyRouter = express.Router();


companyRouter.post('/create', verifyToken, createCompany)
companyRouter.get('/get', verifyToken, getCompanies)
companyRouter.post('/update', verifyToken, updateCompany)

module.exports = companyRouter;