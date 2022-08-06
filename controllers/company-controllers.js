const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const createCompany = async (req, res) => {
  let Userexists;
  let Companyexists;
  const {
    sign,
    email,
    companyId,
    companyName,
    companyAddress,
    companyPostalCode,
    companyCity,
    companyVAT,
    companyIBAN,
    companySWIFT,
    companyBankname,
    companyMaticnast,
    companyPhone,
    createdby,
  } = req.body;
  try {
    console.log(req.body);
    Userexists = await prisma.user.findUnique({
      where: {
        email: email,
      },
    });
    console.log(Userexists);
    if (Userexists) {
      Companyexists = await prisma.company.findFirst({
        where: {
          userId: Userexists.id,
        },
      });
      if (Companyexists) {
        return res.status(400).send({ message: "You already have a company!" });
      }
      const company = await prisma.company.create({
        data: {
          companyName: companyName,
          companyAddress: companyAddress,
          companyPostalCode: companyPostalCode,
          companyCity: companyCity,
          companyVAT: companyVAT,
          companyIBAN: companyIBAN,
          companySWIFT: companySWIFT,
          companyBankname: companyBankname,
          companyMaticnast: companyMaticnast,
          companyPhone: companyPhone,
          createdby: createdby,
          companyId: companyId,
          userId: Userexists.id,
          sign: sign,
        },
      });
      return res
        .status(200)
        .send({ message: "Company created sucessfully!", company: company });
    }
  } catch (error) {
    console.log(error);
    return res.status(400).send(error);
  }
};

exports.createCompany = createCompany;
