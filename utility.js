const { jsPDF } = require("jspdf");
const autoTable = require("jspdf-autotable");
let finalY = 0;

class Storitev {
  constructor(racun, opis, količina, cena_brez_ddv, znesek_z_ddv) {
    this.racun = racun;
    this.opis = opis;
    this.količina = količina;
    this.cena_brez_ddv = cena_brez_ddv;
    this.ddv = "22%";
    this.znesek_z_ddv = znesek_z_ddv;
  }

  returnData = () => {
    return [
      this.opis,
      this.količina,
      this.cena_brez_ddv + this.racun.currency,
      this.ddv,
      this.znesek_z_ddv + this.racun.currency,
    ];
  };
}
const generatePDF = async (
  racun,
  partner,
  companySWIFT,
  companyBankname,
  createdBy,
  companyIBAN,
  companyName,
  companyAddress,
  companyPostalCode,
  companyCity,
  companyVAT,
  companyPhone,
  companyMaticnast,
  sign
) => {
  const doc = new jsPDF();
  finalY = doc.lastAutoTable.finalY || 10;
  doc.addFont("fonts/DejaVuSans.ttf", "DejaVu", "normal");
  doc.addFont("fonts/DejaVuSans-Bold.ttf", "DejaVu", "bold");
  let storitve = [];
  storitve[0] = new Storitev(
    racun,
    "POMOČ NA LICU MESTA ZA MOTORNO KOLO YAMAHA\nREG :CE55BN\nLASTNIK: ŽUNK ERNEST\nREFERENCA: TBSC202208040130\nRELACIJA: BOŠTANJ-KOZJE-BOŠTANJ",
    "1",
    "81.97",
    zDDV("81.97")
  ).returnData();

  storitve[1] = new Storitev(
    racun,
    "DODATNI KM",
    "44",
    "38.72",
    zDDV("38.72")
  ).returnData();
  cenestoritev = ceneStoritev(storitve);

  cene_skupaj_brezDDV = ceneSkupajbrezDDV(freshCene);

  // console.log("Cena celega računa brez DDV: " + cene_skupaj_brezDDV);
  razlika_Skupaj = razlikaDDV(cene_skupaj_brezDDV);
  //DEBUG
  // console.log("Razlika DDV celega računa: " + razlika_Skupaj);
  cena_skupaj_zDDV = zDDV(cene_skupaj_brezDDV);
  //Render header and partner

  renderHeader(doc, racun, partner, finalY);
  renderOurCompany(
    doc,
    companyName,
    companyAddress,
    companyPostalCode,
    companyCity,
    companyVAT,
    companyIBAN,
    companySWIFT,
    companyMaticnast,
    companyPhone,
    racun,
    finalY
  );
  renderTables(
    racun,
    storitve,
    doc,
    cene_skupaj_brezDDV,
    razlika_Skupaj,
    cena_skupaj_zDDV,
    finalY
  );
  renderFooter(doc, companyMaticnast);
  renderPaymentData(
    doc,
    racun,
    finalY,
    createdBy,
    companyIBAN,
    companyBankname,
    companySWIFT
  );
  // const a = chekDirExists(path.join(__dirname, racun.st_racuna));

  let Pdf64 = await saveFile(doc, racun);
  let signedPdf64 = await saveSignedFile(doc, racun, sign);
  // console.log(Pdf64);
  // console.log(signedPdf64);
  return { signedPdf64, Pdf64 };
};
const renderPaymentData = (
  doc,
  racun,
  finalY,
  createdBy,
  companyIBAN,
  companyBankname,
  companySWIFT
) => {
  doc.setFontSize(10);
  if (racun.st_racuna < 10) {
    doc.text(
      `Sklic za številko: SI00 000${racun.st_racuna}-2022, koda namena: GDSV`,
      15,
      this.finalY + 12
    );
  } else if (racun.st_racuna < 100) {
    doc.text(
      `Sklic za številko: SI00 00${racun.st_racuna}-2022, koda namena: GDSV`,
      15,
      finalY + 12
    );
  } else if (racun.st_racuna >= 100) {
    doc.text(
      `Sklic za številko: SI00 0${racun.st_racuna}-2022, koda namena: GDSV`,
      15,
      finalY + 12
    );
  } else if (racun.st_racuna >= 1000) {
    doc.text(
      `Sklic za številko: SI00 ${racun.st_racuna}-2022, koda namena: GDSV`,
      15,
      finalY + 12
    );
  } else {
    console.log("Številka računa je prevelika");
  }
  doc.text(`Sestavil: ${createdBy}`, 15, finalY + 15);
  doc.text(
    `Placilo na TRR ${companyIBAN} ${companyBankname}, SWIFT: ${companySWIFT}`,
    15,
    finalY + 20
  );
  doc.text("Žig:", 140, finalY + 30);
  doc.setFontSize(9);
  finalY = finalY + 30;
};

const renderPartner = (doc, partner) => {
  doc.text(partner.partner_name, 15, 65);
  doc.text(partner.partner_address, 15, 70);
  doc.text(`${partner.partner_zip} ${partner.partner_city}`, 15, 75);

  doc.text("ID za DDV kupca: " + partner.partner_vat_id, 15, 95);
};

const renderHeader = (doc, racun, partner) => {
  doc.setFontSize(9).setFont("DejaVu", "normal");
  doc.text("Datum izdaje: Boštanj, " + racun.datum_racuna, 15, 23);
  doc.text("Datum opr. storitve: " + racun.datum_opravljene_storitve, 15, 27);
  doc.text("Rok plačila: " + racun.datum_placila_racuna, 15, 31);
  renderPartner(doc, partner);
};
const renderTables = (racun, storitve, doc, skupaj, ddvrazlika, zddvskupaj) => {
  doc.autoTable({
    styles: {
      lineColor: [0, 0, 0],
      lineWidth: 0.1,
      tableWidth: "wrap",
      cellPadding: 0.7,
      fontSize: 8,
      font: "DejaVu",
    },
    startY: finalY + 90,

    head: [["Opis", "Količina", "Cena", "DDV", "Znesek"]],
    body: storitve,
    theme: "plain",
    columnStyles: { text: { cellWidth: "auto" } },
  });

  finalY = doc.lastAutoTable.finalY;
  ///////////////////////////SKUPAJ , DDV , ZA PLAČILO
  doc.text("Skupaj: " + skupaj + racun.currency, 165, finalY + 3);
  doc.line(164, finalY + 4, 190, finalY + 4, "F");
  doc.text("DDV: " + ddvrazlika + racun.currency, 167, finalY + 8);
  doc.line(166, finalY + 9, 190, finalY + 9, "F");
  doc.text("Za plačilo: " + zddvskupaj + racun.currency, 160, finalY + 12);
  doc.line(159, finalY + 13, 190, finalY + 13, "F");
  //////////////////////////////////////////
  finalY = doc.lastAutoTable.finalY + 14;

  doc.autoTable({
    styles: {
      lineColor: [0, 0, 0],
      lineWidth: 0.1,
      tableWidth: "wrap",
      cellPadding: 0.7,
      fontSize: 8,
      font: "DejaVu",
    },
    startY: finalY + 10,
    head: [["Davčna stopnja", "Osnova za DDV", "DDV", "Znesek z DDV"]],
    body: [
      [
        "DDV " + racun.ddv_percentage,
        skupaj + racun.currency,
        ddvrazlika + racun.currency,
        zddvskupaj + racun.currency,
      ],
    ],
    theme: "plain",
  });
  finalY = doc.lastAutoTable.finalY;
};

// const chekDirExists = (path, racun) => {
//   if (fs.existsSync(path, racun.st_racuna)) {
//     console.log("Directory exists!");
//   } else {
//     console.log("Directory not found.");
//   }
// };

const saveFile = async (doc, racun) => {
  //const fileName = `racun ${racun.st_racuna}.pdf`;
  let Pdf64 = doc.output("dataurlstring");

  return Pdf64;
};
const saveSignedFile = async (doc, racun, sign) => {
  //const signedFileName = `racun ${racun.st_racuna} žig.pdf`;
  doc.addImage(sign, "JPEG", 148, finalY + 25, 35, 15);
  // doc.save(signedFileName);
  let signedPdf64 = doc.output("dataurlstring");
  return signedPdf64;
};
const renderOurCompany = (
  doc,
  companyName,
  companyAddress,
  companyPostalCode,
  companyCity,
  companyVAT,
  companyIBAN,
  companySWIFT,
  companyMaticnast,
  companyPhone,
  racun
) => {
  doc.line(131, 15, 131, 54);
  doc.setFont("DejaVu", "bold");
  doc.text(`${companyName}`, 132, 20);
  doc.setFontSize(9).setFont("DejaVu", "normal");
  doc.text(`${companyAddress}`, 132, 25);
  doc.text(`${companyPostalCode} ${companyCity}`, 132, 29);
  doc.text(`ID za DDV: ${companyVAT}`, 132, 33);
  doc.text(`IBAN št.: ${companyIBAN},`, 132, 37);
  doc.text(`SWIFT: ${companySWIFT}`, 132, 41);
  doc.text(`Matična št.: ${companyMaticnast}`, 132, 45);
  doc.text(`Tel:${companyPhone}`, 132, 49);
  doc.text(`Račun št: ${racun.st_racuna} `, 132, 53);
};
const renderFooter = (doc, companyMaticnast) => {
  doc.line(15, 276, 190, 276);
  doc.text(
    `Vpis v poslovni register pri Ajpes. Matična št: ${companyMaticnast}`,
    65,
    280
  );
};
function ceneStoritev(storitve) {
  let freshStoritve = [];

  storitve.forEach((element) => {
    freshStoritve.push(element);
  });
  //console.log(storitve);

  //take out cena iz freshStoritve at index 2 with for loop
  let freshCene = [];
  storitve.forEach((element) => {
    freshCene.push(element[2]);
  });

  return freshCene;
}
function ceneSkupajbrezDDV(cene) {
  let emptyArray = [];

  cene.forEach((element) => {
    b = parseFloat(element);
    emptyArray.push(b);
  });
  let sum = emptyArray.reduce((a, b) => a + b, 0);
  let rounded = parseFloat(sum).toFixed(2);
  return rounded;
}

function zDDV(cena) {
  let novaCena = cena * 1.22;
  let rounded = Math.round(novaCena * 100) / 100;
  return rounded.toFixed(2);
}

function razlikaDDV(cena) {
  let rounded = zDDV(cena) - cena;
  return rounded.toFixed(2);
}


function brezDDV(cena) {
  let novaCena = cena / 1.22;
  let rounded = Math.round(novaCena * 100) / 100;
  return rounded;
}

exports.generatePDF = generatePDF;
