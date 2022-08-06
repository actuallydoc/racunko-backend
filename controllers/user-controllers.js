const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const createUser = async (req, res) => {
  let exists;
  const { firstName, email } = req.body;
  try {
    exists = await prisma.user.findUnique({
      where: {
        email: email,
      },
    });
    if (exists) {
      return res.status(400).send({ message: "User already exists" });
    }
    const user = await prisma.user.create({
      data: {
        firstName: firstName,
        email: email,
      },
    });
    return res.status(200).send({ message: "User created sucessfully!" });
  } catch (error) {
    console.log(error);
    return res.status(400).send(error);
  }
};

const createCompany = async (req, res) => {};

exports.createUser = createUser;
