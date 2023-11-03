const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const Jwt = require("jsonwebtoken");
const jwtkey = "e-comm";


const userSchema = new mongoose.Schema({
  name: String,
  email: String,
  password: String,
  cpassword: String,
  tokens:[
    {
        token:{
            type: String,
            required: true,
        }
    }
  ]
});



userSchema.pre("save", async function (next) {
  if(this.isModified("password")){
  this.password = await bcrypt.hash(this.password, 12);
  this.cpassword = await bcrypt.hash(this.cpassword, 12);
}
  next();
});

userSchema.methods.generateAuthtoken = async function(){
    try {
      let token1 = Jwt.sign({_id:this._id}, jwtkey,{
        expiresIn: "1d"
      })
      this.tokens = this.tokens.concat({token: token1})
      await this.save();
      return token1
    } catch (error) {
      console.log("token error")
    }
}

const userdb = new mongoose.model("sign", userSchema);
module.exports = userdb;
