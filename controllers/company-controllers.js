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
        id: req.id,
        email: email,
      },
    });
    if (Userexists) {
      Companyexists = await prisma.company.findFirst({
        where: {
companyId: companyId,
        },
      });
        console.log(Companyexists);
    //  if (Companyexists) {
        //  return res.status(400).send({ message: "You already have a company!" });
      //}

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
const getCompanies = async (req, res) => {
    let user;
    let company
    //Send all the invoices from the user id
    const id = req.id
    console.log("Id invoice", id)
    //Create an invoice by the company id
    try {
        user = await prisma.user.findUnique({
        where: {
            id: id,
        },
        include: {
            company: true,
        },
        });
        if (!user.company[0]){
            return res.status(400).send({ message: "User with  company does not exist" });
        }
        company = await prisma.company.findMany({
        where: {
            userId: user.id,
        },
        });
        return res.send({ companies: company });
    } catch (error) {
        console.log(error);
        return res.status(400).send(error);
    }
}
const updateCompany = async (req, res) => {
    let user;
    let company
    //Send all the invoices from the user id
    const id = req.id
    console.log("Id invoice", id)
    //Create an invoice by the company id
    try {
        user = await prisma.user.findUnique({
        where: {
            id: id,
        },
        include: {
            company: true,
        },
        });
        if (!user.company[0]){
            return res.status(400).send({ message: "User with  company does not exist" });
        }
        company = await prisma.company.update({
        where: {
            id: user.company[0].id,
        },
        data: {
            companyName: req.body.companyName,
            companyAddress: req.body.companyAddress,
            companyPostalCode: req.body.companyPostalCode,
            companyCity: req.body.companyCity,
            companyVAT: req.body.companyVAT,
            companyIBAN: req.body.companyIBAN,
            companySWIFT: req.body.companySWIFT,
            companyBankname: req.body.companyBankname,
            companyMaticnast: req.body.companyMaticnast,
            companyPhone: req.body.companyPhone,
            createdby: req.body.createdby,
            companyId: req.body.companyId,
            userId: user.id,
            sign: req.body.sign,
        },
        });
        return res
            .status(200)
            .send({ message: "Company updated sucessfully!", company: company });
    } catch (error) {
        console.log(error);
        return res.status(400).send(error);
    }
}

const deleteCompany = async (req, res) => {
    let user;
    let company
    //Send all the invoices from the user id
    const id = req.id
    console.log("Id invoice", id)
    //Create an invoice by the company id
    try {
        user = await prisma.user.findUnique({
        where: {
            id: id,
        },
        include: {
            company: true,
        },
        });
        if (!user.company[0]){
            return res.status(400).send({ message: "User with  company does not exist" });
        }
        company = await prisma.company.delete({
        where: {
            id: user.company[0].id,
        },
        });
        return res.send({ message: "Company deleted sucessfully!" });
    } catch (error) {
        console.log(error);
        return res.status(400).send(error);
    }
}
exports.deleteCompany = deleteCompany;
exports.updateCompany = updateCompany;
exports.getCompanies = getCompanies;
exports.createCompany = createCompany;
