-- CreateTable
CREATE TABLE "User" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "username" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "Company" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "companyName" TEXT NOT NULL,
    "companyAddress" TEXT NOT NULL,
    "companyPostalCode" TEXT NOT NULL,
    "companyCity" TEXT NOT NULL,
    "companyVAT" TEXT NOT NULL,
    "companyIBAN" TEXT NOT NULL,
    "companySWIFT" TEXT NOT NULL,
    "companyBankname" TEXT NOT NULL,
    "companyMaticnast" TEXT NOT NULL,
    "companyPhone" TEXT NOT NULL,
    "createdby" TEXT NOT NULL,
    "userId" INTEGER NOT NULL,
    "sign" TEXT NOT NULL,
    CONSTRAINT "Company_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Invoice" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "datumIzdaje" TEXT NOT NULL,
    "datumStoritve" TEXT NOT NULL,
    "datumPlacila" TEXT NOT NULL,
    "stRacuna" INTEGER NOT NULL,
    "invoiceId" INTEGER NOT NULL,
    "companyName" TEXT NOT NULL,
    "companyAddress" TEXT NOT NULL,
    "companyPostalCode" TEXT NOT NULL,
    "companyCity" TEXT NOT NULL,
    "companyVAT" TEXT NOT NULL,
    "companyIBAN" TEXT NOT NULL,
    "companySWIFT" TEXT NOT NULL,
    "companyBankname" TEXT NOT NULL,
    "companyMaticnast" TEXT NOT NULL,
    "companyPhone" TEXT NOT NULL,
    "createdby" TEXT NOT NULL,
    "partnerId" INTEGER NOT NULL,
    "Pdf64" TEXT NOT NULL,
    "signedPdf64" TEXT NOT NULL,
    CONSTRAINT "Invoice_invoiceId_fkey" FOREIGN KEY ("invoiceId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Partner" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "partnerName" TEXT NOT NULL,
    "partnerAddress" TEXT NOT NULL,
    "partnerPostalCode" TEXT NOT NULL,
    "partnerCity" TEXT NOT NULL,
    "partnerVAT" TEXT NOT NULL,
    "partnerIBAN" TEXT NOT NULL,
    "partnerSWIFT" TEXT NOT NULL,
    "partnerBankname" TEXT NOT NULL,
    "partnerMaticnast" TEXT NOT NULL,
    "partnerPhone" TEXT NOT NULL,
    "companyId" INTEGER NOT NULL,
    CONSTRAINT "Partner_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
