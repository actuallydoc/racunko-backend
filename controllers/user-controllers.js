const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const createUser = async (req, res) => {
  let exists;
  const {username, email, password} = req.body;
  try {
    exists = await prisma.user.findUnique({
      where: {
        email: email,
      },
    });
  } catch (error) {
    console.log(error);
  }
    if (exists) {
      console.log('user already exists');
      return res.status(400).send({message: "User already exists!"});
    }
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    try {
      const newUser = await prisma.user.create({
        data: {
          username: username,
          email: email,
          password: hashedPassword
        },
      });
      console.log('user created');
      return res.status(200).send({message: "User created sucessfully!" , user: newUser});
    } catch (error) {
      console.log(error);
      return res.status(500).send({message: "Something went wrong"});
    }

}


const userLogin = async (req, res) => {
    console.log("Login page")
  const {email, password} = req.body;
    try {
        const user = await prisma.user.findUnique({
            where: {
            email: email,
            },
            include: {
            company: true,
            }
        });
        if (!user) {
            return res.status(400).send({message: "User does not exist!"});
        }
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).send({message: "Invalid credentials!"});
        }
        delete user.password
        delete user.picture
        delete user.company
        const token = jwt.sign(user, process.env.JWT_SECRET,  {expiresIn: '60d'} );
        res.cookie("token", token, {
            httpOnly: false,
            SameSite: "none",
            secure: process.env.NODE_ENV === "production",
            expires: new Date(Date.now() + 1000 * 60 * 60),
        })
        return res.status(200).send({message: "Logged in successfully!"});

    } catch (error) {
        console.log(error);
        return res.status(500).send({message: "Something went wrong"});
    }
}

const verifyToken = async (req, res, next) => {
    const token = req.cookies.token;
    if (!token) {
        return res.status(401).send({message: "Unauthorized"});
    }
    try{
        const user = jwt.verify(token, process.env.JWT_SECRET);
        req.id = user.id;
        next();
    }catch (error) {
        return res.status(401).send({message: "Unauthorized"});
    }

}

const getUser = async (req, res) => {
    const  id = req.id;
    console.log(req.id)
    try{
        const user = await prisma.user.findFirst({
            where: {
                id: id
            },
            include: {
                company: true,
            }
        });
        delete user.password
        return res.status(200).send({message: "User found", user: user});
    }
    catch (error) {
        console.log(error);
        return res.status(500).send({message: "Something went wrong"});
    }
}

const updateProfilePicture = async (req, res) => {
    const {picture} = req.body;
    console.log(picture)
    const id = req.id;
    const user = await prisma.user.update({
        where: {
            id: id
        },
        data: {
            picture: picture
        },
    });
    delete user.password
    return res.status(200).send({message: "Profile picture updated", user: user});
}

exports.updateProfilePicture = updateProfilePicture;
exports.userLogin = userLogin;
exports.createUser = createUser;
exports.getUser = getUser;
exports.verifyToken = verifyToken;