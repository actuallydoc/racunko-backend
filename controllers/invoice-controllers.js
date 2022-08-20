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
    status,
    stRacuna,
    datumIzdaje,
    datumStoritve,
    datumPlacila,
    partnerId,
    services,
    amount,
    taxamount
  } = req.body;

  let parsed = JSON.stringify(services)
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
    let { signedPdf64, Pdf64, storitve } = await generatePDF(
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
      company.sign,
      services
    );
    console.log("Storitve banckend: ", storitve)
    invoice = await prisma.invoice.create({
      data: {
        datumIzdaje: datumIzdaje,
        datumStoritve: datumStoritve,
        datumPlacila: datumPlacila,
        stRacuna: stRacuna,
        invoiceId: req.id,
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
        partnerId: partner.id,
        Pdf64: Pdf64,
        status: status,
        signedPdf64: signedPdf64,
        services: parsed,
        amount: amount,
        taxamount,
      },
    });
    delete invoice.Pdf64
    delete invoice.signedPdf64
    console.log("Invoice: ", invoice)
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
        return res.status(200).send({ message: "No Companies" });
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
        User: {
            id: req.id
        }
      },

    });
    const partners = await prisma.partner.findMany({
        where: {
          userId: id
        }
    })
    return res
        .status(200)
        .send({ data: invoices, partners: partners });
  } catch (err) {
    console.log(err);
  }
};
const removeInvoice = async (req, res) => {
  console.log('remove invoice')
  const {invoiceID, partnerId} = req.body
  console.log("Invoice id: ", invoiceID)
    let user;
    let company;
    let invoice;
    //Remove an invoice by the company id
    try {
        user = await prisma.user.findUnique({
        where: {
            id: req.id,
        },
        });
    } catch (err) {
        console.log(err);
    }
    if (!user) {
        return res.status(400).send({ message: "User does not exist" });
    }
    try {
        invoice = await prisma.invoice.delete({
        where: {
            id: invoiceID,
        },
        });
      console.log("Delete Invoice: ", invoice);
    } catch (err) {
        console.log(err);
    }
    return res.send({ message: "Invoice deleted" });
}
exports.removeInvoice = removeInvoice;
exports.getInvoices = getInvoices;
exports.createInvoice = createInvoice;
