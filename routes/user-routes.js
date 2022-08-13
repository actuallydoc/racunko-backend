const {createUser, userLogin,  verifyToken, getUser} = require('../controllers/user-controllers');
const express = require('express');
const userRouter = express.Router();


userRouter.post('/create', createUser)
userRouter.post('/login', userLogin)
userRouter.get('/data', verifyToken, getUser)


module.exports = userRouter;