const {createPartner,getPartners} = require('../controllers/partner-controllers');
const express = require('express');
const PartnerRouter = express.Router();


PartnerRouter.post('/create', createPartner)
PartnerRouter.post('/get', getPartners)


module.exports = PartnerRouter;