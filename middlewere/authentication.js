const user = require("../db/user");
const JWT = require('jsonwebtoken');
const jwtkey = "e-comm";


const userverify = async (req, res ,next) =>{
    try {
        console.log("middewere")
        const token = req.headers.authorization
        const verifytoken = JWT.verify(token, jwtkey);
        // console.log(verifytoken._id)
        if(!verifytoken) {throw new Error("user not found")}
        req.verifytoken = verifytoken

        next();

    } catch (error) {
        res.send("Unauthorized no token provide")
    }
}

module.exports = userverify;