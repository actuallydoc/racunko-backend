const {createUser, userLogin,  verifyToken, getUser, updateProfilePicture} = require('../controllers/user-controllers');
const express = require('express');
const userRouter = express.Router();


userRouter.post('/create', createUser)
userRouter.post('/login', userLogin)
userRouter.get('/data', verifyToken, getUser)
userRouter.post('/updateprofile', verifyToken, updateProfilePicture)

module.exports = userRouter;