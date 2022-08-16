const {createCompany, getCompanies,updateCompany, deleteCompany} = require('../controllers/company-controllers');
const express = require('express');
const {verifyToken} = require("../controllers/user-controllers");

const companyRouter = express.Router();


companyRouter.post('/create', verifyToken, createCompany)
companyRouter.get('/get', verifyToken, getCompanies)
companyRouter.post('/update', verifyToken, updateCompany)
companyRouter.post('/delete', verifyToken, deleteCompany)
module.exports = companyRouter;