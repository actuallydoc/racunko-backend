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
        id: req.id,
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
    console.log(err)
  }
};

const getInvoices = async (req, res) => {
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
        return res.status(400).send({ message: "No Companies" });
    }

  } catch (err) {
    console.log("No Token Found");
    return res.status(401)
  }
  try {
    company = user.company[0];

  } catch (err) {
    console.log("Company does not exist");
    return  res.status(400).send({message: "You do not have a company"});
  }
  try{
    const invoices = await prisma.invoice.findMany({
      where: {
        invoiceId: company.id,
      },
    });
    return res
        .status(200)
        .send({ data: invoices });
  } catch (err) {
    console.log(err);
  }
};
exports.getInvoices = getInvoices;
exports.createInvoice = createInvoice;
