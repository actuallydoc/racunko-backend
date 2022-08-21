const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()


const createPartner = async(req, res, next) => {
    //Get the user id from the request.body and find the user and the company
    let user;
    let partner;
    const { partnerName, partnerAddress, partnerPostalCode, partnerCity, partnerVAT, partnerIBAN, partnerSWIFT, partnerBankname, partnerMaticnast, partnerPhone } = req.body

    user = await prisma.user.findUnique({
        where: {
            id: req.id
        },
        include: {
            company: true

        }
    })

    let company = user.company
    if(!user){
        return res.status(400).send({"message": "User and company does not exist"})
    }
    if (!company) {
        return res.status(400).send({"message": "Company does not exist create one!"})
    }
    //Create the partner
    try {
        partner = await prisma.partner.create({
            data: {
                userId: req.id,
                partnerName: partnerName,
                partnerAddress: partnerAddress,
                partnerPostalCode: partnerPostalCode,
                partnerCity: partnerCity,
                partnerVAT: partnerVAT,
                partnerIBAN: partnerIBAN,
                partnerSWIFT: partnerSWIFT,
                partnerBankname: partnerBankname,
                partnerMaticnast: partnerMaticnast,
                partnerPhone: partnerPhone,
                companyId: company.id,
            }
        })
    }catch(err){
        console.log(err);
    }
    return res.status(200).send({"Partner created!": partner})
}


const getPartners = async(req, res, next) => {
    let id = req.id
    let user;
    try {
        user = await prisma.user.findFirst({
            where: {
                id: id
            },
            include: {
                company: true,
            }
        })
    }catch(err){
        console.log(err);
    }
    if(!user){
        return res.status(400).send({"message": "User and company does not exist"})
    }
    let company = user.company[0]
    //Get all the partners from the company id
    if (!company) {
        return res.status(400).send({"message": "Company does not exist create one!"})
    }
    let partners;
    try {
        partners = await prisma.partner.findMany({
            where: {
                userId: id
            }
        })
        if (!partners) {
            return res.status(400).send({"message": "No partners found"})
        }
    }catch(err){
        console.log(err);
    }

    return res.status(200).send({"partners": partners})
}

const updatePartner = async(req, res, next) => {
    let partner;
    let { id, partnerName, partnerAddress, partnerPostalCode, partnerCity, partnerVAT, partnerIBAN, partnerSWIFT, partnerBankname, partnerMaticnast, partnerPhone } = req.body
    let userId = req.id
    try {
        partner = await prisma.partner.findUnique({
            where: {
                id: userId
            }
        })
    }catch(err){
        console.log(err);
    }
    try {
        partner = await prisma.partner.update({
            where: {
                id: id
            },
            include: {
                User: true,
            },
            data: {
                partnerName: partnerName,
                partnerAddress: partnerAddress,
                partnerPostalCode: partnerPostalCode,
                partnerCity: partnerCity,
                partnerVAT: partnerVAT,
                partnerIBAN: partnerIBAN,
                partnerSWIFT: partnerSWIFT,
                partnerBankname: partnerBankname,
                partnerMaticnast: partnerMaticnast,
                partnerPhone: partnerPhone,
            }
        })
    }catch(err){
        console.log(err);
    }
    return res.status(200).send({"partner": partner})
}


const removePartner = async(req, res, next) => {
    let partner;
    let userId = req.id
    let { id } = req.body

    try {
        user = await prisma.user.findUnique({
            where: {
                id: userId
            },
            include: {
                company: true,
            }
        })
    }catch(err){
        console.log(err);
    }
    if(!user){
        return res.status(400).send({"message": "User does not exist"})
    }
    try {
        partner = await prisma.partner.delete({
            where: {
                id: id,
            }
        })
    }catch(err){
        console.log(err);
    }
    return res.status(200).send({"partner": partner})
}
exports.removePartner = removePartner
exports.updatePartner = updatePartner
exports.createPartner = createPartner;
exports.getPartners = getPartners;