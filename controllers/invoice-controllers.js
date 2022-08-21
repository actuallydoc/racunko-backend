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
  let company;
  let {
    status,
    stRacuna,
    datumIzdaje,
    datumStoritve,
    datumPlacila,
    partnerId,
    companyId,
    services,
    taxPercent
  } = req.body;

  let parsed = JSON.stringify(services)
  //Create an invoice by the company id
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
    return res.status(400).send({ message: "User and company does not exist" });
  }

  console.log("Company id: ", companyId);
  try {
    company = await prisma.company.findFirst({
      where: {
        id: companyId,
      },
    });
    console.log("Company", company);
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
    invoice = await prisma.invoice.create({
      data: {
        datumIzdaje: datumIzdaje,
        datumStoritve: datumStoritve,
        datumPlacila: datumPlacila,
        stRacuna: stRacuna,
        invoiceId: req.id,
        companyId: companyId,
        partnerId: partner.id,
        Pdf64: Pdf64,
        status: status,
        signedPdf64: signedPdf64,
        services: parsed,
        taxPercent: taxPercent,
      },
    });
    delete invoice.Pdf64
    delete invoice.signedPdf64
    return res.send({ invoiceData: invoice });
  } catch (err) {
    console.log(err)
  }
};

const getInvoices = async (req, res) => {
    console.log('get invoices')
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
    console.log("user", user);
    if (!user.company[0]){
        return res.status(200).send({ message: "No Companies" });
    }

  } catch (err) {
    console.log("No Token Found");
    return res.status(401)
  }
  try {
    console.log("company", company);

  } catch (err) {
    console.log("Company does not exist");
    return  res.status(400).send({message: "You do not have a company"});
  }
  try{
    const invoices = await prisma.invoice.findMany({
      where: {
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
    } catch (err) {
        console.log(err);
    }
    return res.send({ message: "Invoice deleted" });
}

const updateInvoice = async(req, res) => {
  let exists
  let partner
  let company
  let user
  let {stRacuna,id ,partnerId ,datumIzdaje, datumStoritve, datumPlacila, status, services, companyId, taxPercent } = req.body;
  console.log("Invoice id: ", id);
  console.log("Debug")
  try {
    user = await prisma.user.findUnique({
      where: {
        id: req.id,
      },
      include: {
        company: true,
      },
    });
    exists = await prisma.invoice.findUnique({
      where: {
        id: id,
      }
    });
    if (!exists) {
      return res.status(400).send({message: "Invoice does not exist"});
    }
    company = await prisma.company.findFirst({
      where: {
        id: companyId,
      },
    });
    partner = await prisma.partner.findUnique({
        where: {
            id: partnerId,
        }})
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

    let {signedPdf64, Pdf64} = await generatePDF(
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
        services,
        taxPercent
    )
    let parsed = JSON.stringify(services)
    invoice = await prisma.invoice.update({
      where: {
        id: id,
      },
      data: {
        stRacuna: stRacuna,
        datumIzdaje: datumIzdaje,
        datumStoritve: datumStoritve,
        datumPlacila: datumPlacila,
        status: status,
        services: parsed,
        Pdf64: Pdf64,
        signedPdf64: signedPdf64,
        companyId: companyId,
        partnerId: companyId,
        taxPercent: taxPercent
      },
    });
    delete invoice.signedPdf64
    delete invoice.Pdf64
    return res.status(200).send({invoice: invoice});
  }
   catch (err) {
    console.log(err);
    }

}


exports.updateInvoice = updateInvoice;
exports.removeInvoice = removeInvoice;
exports.getInvoices = getInvoices;
exports.createInvoice = createInvoice;
