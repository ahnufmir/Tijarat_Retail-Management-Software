const jwt = require('jsonwebtoken');
const prisma = require("../../db/prisma");
const throwError = require("../../utils/errorHandling");
const bcrypt = require('bcrypt');
const SECRET = process.env.SECRET;

function createTokenForUser(user){
    const payload = {
        _id : user.id,
        name : user.name,
        role : user.role
    }
    const token = jwt.sign(payload, SECRET);
    return token; 
}

const registerAdmin = async(userName, password)=>{
    const existingAdmin = await prisma.user.findFirst({
       where : {
        role : "ADMIN"
       }
    })
    const existingUser = await prisma.user.findUnique({
        where:{
            userName : userName
        }
    }
    )
    if(existingAdmin || existingUser){
        throwError("Admin or User Exists Already", 400);
    }
    const passwordHash = await bcrypt.hash(password, 15);
    const user = await prisma.user.create({
        data:{
            userName,
            passwordHash,
            role : "ADMIN"
        },
        select : {
            id : true,
            userName: true,
            role: true,
            createdAt: true,
        }
    });
    return user;
}

const userLogin = async(userName, password) =>{
    const user = await prisma.user.findUnique({
        where :{
            userName
        }
    })
    if(!user){
        throwError("User does not exist", 401);
    }
    const isPasswordCorrect = await bcrypt.compare(password, user.passwordHash);
    if(!isPasswordCorrect){
        throwError("Either user name or password is invalid", 401);
    }
    const token = createTokenForUser(user);
    return{
        token,
        user:
        {
            id : user.id,
            userName : user.userName,
            role : user.role
        }
    };
}

const getCurrentUser = async(userId)=>{
    const user = await prisma.user.findUnique({
        where:{
            id: userId
        },
        select:{
            id:true,
            userName:true,
            role: true
        }
    })
    if(!user){
        throwError("User does not exist", 401);
    }
    return user;

}
function validateToken(token){
    const payload = jwt.verify(token, SECRET);
    return payload;
}

module.exports = {
    registerAdmin,
    userLogin,
    getCurrentUser,
    validateToken
}
