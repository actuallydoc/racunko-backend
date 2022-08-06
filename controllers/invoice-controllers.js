const { PrismaClient } = require("@prisma/client");
const { generatePDF } = require("../utility");
// const autoTable = require("jspdf-autotable");
const prisma = new PrismaClient();

const Partner = (
  partner_name,
  partner_address,
  partner_zip,
  partner_vat_id,
  partner_city
) => {
  return {
    partner_name,
    partner_address,
    partner_zip,
    partner_vat_id,
    partner_city,
  };
};
const RačunInfo = (
  st_racuna,
  datum_racuna,
  datum_opravljene_storitve,
  datum_placila_racuna
) => {
  return {
    st_racuna,
    datum_racuna,
    datum_opravljene_storitve,
    datum_placila_racuna,
    ddv_percentage: "22%",
    currency: "€",
  };
};
const createInvoice = async (req, res) => {
  let user;
  let invoice;
  let partner;
  let partners;
  let company;
  let {
    userId,
    stRacuna,
    datumIzdaje,
    datumStoritve,
    datumPlacila,
    partnerId,
  } = req.body;
  //Create an invoice by the company id
  try {
    user = await prisma.user.findUnique({
      where: {
        id: userId,
      },
      include: {
        company: true,
      },
    });
  } catch (err) {
    console.log(err);
  }
  if (!user) {
    return res.status(400).send({ message: "User and company does not exist" });
  }
  company = user.company[0];
  try {
    partners = await prisma.company.findFirst({
      where: {
        id: company.id,
      },
      include: {
        partners: true,
      },
    });
  } catch (err) {
    console.log(err);
  }
  //Find the partner that has the id
  try {
    partner = await prisma.partner.findUnique({
      where: {
        id: partnerId,
      },
    });
  } catch (err) {
    console.log(err);
  }
  if (!partner) {
    return res.status(400).send({ message: "Partner does not exist" });
  }
  //Create the invoice
  //Create the partner from req.body
  let freshPartner = Partner(
    partner.partnerName,
    partner.partnerAddress,
    partner.partnerPostalCode,
    partner.partnerVAT,
    partner.partnerCity
  );
  let infoRacuna = RačunInfo(
    stRacuna,
    datumIzdaje,
    datumStoritve,
    datumPlacila
  );

  try {
    let { signedPdf64, Pdf64 } = await generatePDF(
      infoRacuna,
      freshPartner,
      company.companySWIFT,
      company.companyBankname,
      company.createdby,
      company.companyIBAN,
      company.companyName,
      company.companyAddress,
      company.companyPostalCode,
      company.companyCity,
      company.companyVAT,
      company.companyPhone,
      company.companyMaticnast,
      company.sign
    );
    invoice = await prisma.invoice.create({
      data: {
        datumIzdaje: datumIzdaje,
        datumStoritve: datumStoritve,
        datumPlacila: datumPlacila,
        stRacuna: stRacuna,
        invoiceId: company.id,
        companyName: company.companyName,
        companyAddress: company.companyAddress,
        companyPostalCode: company.companyPostalCode,
        companyCity: company.companyCity,
        companyVAT: company.companyVAT,
        companyIBAN: company.companyIBAN,
        companySWIFT: company.companySWIFT,
        companyBankname: company.companyBankname,
        companyMaticnast: company.companyMaticnast,
        companyPhone: company.companyPhone,
        createdby: company.createdby,
        partnerId: partnerId,
        Pdf64: Pdf64,
        signedPdf64: signedPdf64,
      },
    });
    return res.send({ invoiceData: invoice });
  } catch (err) {
    return res.status(400);
  }
};

const getInvoice = async (req, res) => {
  let user;
  const { userId } = req.body;
  //Send all the invoices from the user id
  const { userid } = req.body;
  //Create an invoice by the company id
  try {
    user = await prisma.user.findUnique({
      where: {
        id: userid,
      },
      include: {
        company: true,
      },
    });
  } catch (err) {
    console.log(err);
  }
  let company = user.company[0];
  invoices = await prisma.invoice.findMany({
    where: {
      invoiceId: company.id,
    },
  });
  return res
    .status(200)
    .send({ "All invoices for the company found!": invoices });
  //return res.status(200).send({ user: user });
};
exports.getInvoice = getInvoice;
exports.createInvoice = createInvoice;
