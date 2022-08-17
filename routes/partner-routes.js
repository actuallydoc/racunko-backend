const {createPartner,getPartners, updatePartner, removePartner} = require('../controllers/partner-controllers');
const express = require('express');
const {verifyToken} = require("../controllers/user-controllers");
const PartnerRouter = express.Router();


PartnerRouter.post('/create', verifyToken, createPartner)
PartnerRouter.get('/get', verifyToken, getPartners)
PartnerRouter.post('/update', verifyToken, updatePartner)
PartnerRouter.post('/remove', verifyToken, removePartner)

module.exports = PartnerRouter;