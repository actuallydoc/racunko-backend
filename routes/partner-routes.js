const {createPartner,getPartners} = require('../controllers/partner-controllers');
const express = require('express');
const {verifyToken} = require("../controllers/user-controllers");
const PartnerRouter = express.Router();


PartnerRouter.post('/create', verifyToken, createPartner)
PartnerRouter.post('/get', verifyToken, getPartners)


module.exports = PartnerRouter;