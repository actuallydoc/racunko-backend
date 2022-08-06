const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()


const createPartner = async(req, res, next) => {
    //Get the user id from the request.body and find the user and the company
    let user;
    let partner;
    const { userid, partnerName, partnerAddress, partnerPostalCode, partnerCity, partnerVAT, partnerIBAN, partnerSWIFT, partnerBankname, partnerMaticnast, partnerPhone } = req.body

    user = await prisma.user.findUnique({
        where: {
            id: userid
        },
        include: {
            company: true
        }
    })
    if(!user){
        return res.status(400).send({"message": "User and company does not exist"})
    }
    let company = user.company[0]
    //Create the partner
    try {
        partner = await prisma.partner.create({
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
                companyId: company.id,
            }
        })
    }catch(err){
        console.log(err);
    }
    return res.status(200).send({"Partner created!": partner})
}


const getPartners = async(req, res, next) => {
    const { userid} = req.body
    let user;
    try {
        user = await prisma.user.findFirst({
            where: {
                userid: userid
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
    let partners;
    try {
        partners = await prisma.partner.findMany({
            where: {
                companyId: company.id
            }
        })
    }catch(err){
        console.log(err);
    }

    
    return res.status(200).send({"All partners for the user and company!": partners})
}



exports.createPartner = createPartner;
exports.getPartners = getPartners;