const {createUser} = require('../controllers/user-controllers');
const express = require('express');
const userRouter = express.Router();


userRouter.post('/create', createUser)



module.exports = userRouter;