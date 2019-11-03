const gravatar = require("gravatar");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const {appSecret} = require("../../config/config");

const passport = require("passport");

const nodemailer = require("nodemailer");

//const { ensureAuthenticated, isAdmin } = require("../../config/auth"); //this middleware check only login user can access routes

//const { ensureAuthenticated, verifyToken } = require("../../config/auth"); //this middleware check only login user can access routes
// Load Input Validation
const validateRegisterInput = require("../../validation/register"); 
const validateLoginInput = require("../../validation/login");
 
const { handleResponse, handleError } = require('../../utils/requestHandlers');
const { save, get,isUserExists } = require('../../services/user');

const generateJwtToken = async user => await jwt.sign(user, appSecret, {expiresIn: "24h"});

 
exports.test = async (req,res, next) => {
    try { 
        let testdata = {msg: "Users Test Works" }
        handleResponse({ res, data: testdata })
    }
    catch (err) {
        handleError({ res, err });
    }
}
 
exports.authorizedUsertest = async (req, res) => {
  try{
    jwt.verify(req.token, appSecret, (err, authData) => {
      //jwt.verify check user has authenticate token or not that he was get after successfully login and if he has authenticate token then he pass this middleware [HERE WE CHECK AUTHENTICATION]
      if (err) {
        //user token is invalid
       // res.sendStatus(403);
       console.log("You are not authenticate user so cannot Access This API : "+err);
       throw "You are not authenticate user so cannot Access This API : "+err 

      } else {
        
        if (authData.isAdmin == true) {
          //[HERE WE CHECK ONLY AUTHORIZE USER CAN ACCESS THIS API]
         // res.json({ msg: "Authorized test Works", authData }); //here for testing purpose we just return in terms of response loggedin user data you can do whatever you want to do with authenticate and authorize api
          handleResponse({ res, data: "User is Admin where he can access Authorized API" });
        } else {
         // res.sendStatus(403); //if user is authenticate successful but user is not authorize person so response will send forbidden//no access of this API
      
          console.log("You Have No Authority To Access This API : "+err);
          throw "You Have No Authority To Access This API : "+err 
 
          }
      }
    })
  }catch(err){
    handleError({ res, err })
  }

} 

exports.login = async (req, res, next) => {
    try {
        const { errors, isValid } = validateLoginInput(req.body); //here we pulled out errors and isValid from validateRegisterInput() this function where re.body include everything that sent to its routes in this case name,email,mobile and password

        // Check Validation
        if (!isValid) {
            //if isValid is not empty its mean errors object has got some errors so in this case it will redirect to the register
           // return res.status(400).json(errors);
           if (errors.email){ 
               throw errors.email 
            }else{
                throw errors.password 
            }
        }
        //if (!req.body.email) throw 'Please provide a valid email';
        let user = await get(req.body.email, 'email');   //get user by email or id     
        if (!user) throw 'No user exists in system with this email, Please provide a registerd email.'
        //if (!await user.verifyPassword(req.body.password)) throw 'wrong password provided'
         // Check Password
    bcrypt.compare(req.body.password, user.password).then(async isMatch => {
        if (isMatch) {
          // res.json({ msg: "Success" });
  
          // User Matched
  
          // const tokenObj = {
          //   id: user.id,
          //   isAdmin: user.isAdmin,
          //   name: user.name,
          //   gender: user.gender,
          //   avatar: user.avatar,
          //   email: user.email
          // }; // Create JWT Payload
 
          let tokenObj = {
            userId: user._id,
            name:user.name,
            isAdmin: user.isAdmin,
            salt: user.salt
           } // Create JWT Payload
      
           tokenObj.accessToken =  await generateJwtToken(tokenObj); //generateJwtToken return token and we will save in tokenObj.accessToken
           
           user.password = null;
           handleResponse({ res, data: tokenObj.accessToken });
        } else {
          return res.status(400).json({ password: "Password incorrect" });
        }
      });

       
    }
    catch (err) {
        handleError({ res, err });
    }
}


exports.register = async (req, res, next) => {
    try {
        const { errors, isValid } = validateRegisterInput(req.body); //here we pulled out errors and isValid from validateRegisterInput() this function where re.body include everything that sent to its routes in this case name,email,mobile and password

        // Check Validation
        if (!isValid) {
            //if isValid is not empty its mean errors object has got some errors so in this case it will redirect to the register
            return res.status(400).json(errors);
        }

        let isUserExist = await isUserExists(req.body.email,"email")

        if(isUserExist){
            console.log("user email is already registered !!")
            return res.status(400).json({msg:"user email is already registered !!"})
        }else{
         console.log("user email is unique ")

         const avatar = gravatar.url(req.body.email, {
            s: "200", // Size
            r: "pg", // Rating
            d: "mm" // Default
          });
    
          const newUser =  {
            name: req.body.name,
            email: req.body.email, 
            profilePic:avatar,
            password: req.body.password
          };
    
          bcrypt.genSalt(10, (err, salt) => {
            bcrypt.hash(newUser.password, salt, (err, hash) => {
              if (err) throw err;
              newUser.password = hash; //set password to hash password
              newUser.salt = salt;

             (async function saveUser(){
                let user = await save(newUser);
                let tokenObj = {
                    userId: user._id,
                    isAdmin: user.isAdmin,
                    salt: user.salt
                }
                user.password = null; //for sending res we set password to null just for security reason
                // user.token = await generateJwtToken(tokenObj);
                handleResponse({ res, data: tokenObj })
              })()
               
            });
          });

        }

      
    }
    catch (err) {
        handleError({ res, err });
    }
}
  
exports.getUserByIdorEmail = async (req, res) => {
    try {
        let user = await get(req.body._id); 
        handleResponse({ res, data: user });
    } catch (err) {
        handleError({ res, err })
    }
}
 
exports.getUserByToken = async (req, res) => {
  try { 
    jwt.verify(req.token, appSecret, (err, authData) => {
      //jwt.verify check user has authenticate token or not that he was get after successfully login and if he has authenticate token then he pass this middleware [HERE WE CHECK AUTHENTICATION]
      if (err) {
          //user token is invalid
       // res.sendStatus(403);
       console.log("You are not authenticate user so cannot Access This API : "+err);
       throw "You are not authenticate user so cannot Access This API : "+err 

        } else {
          //authData has our user jwt payload inside name,userId,token details exp etc
          (async function getCurrentUser(){
            let userData = await get(authData.userId)
            userData.password=null
            handleResponse({ res, data: userData });
          })()
         
      }
    })
  } catch (err) {
      handleError({ res, err })
  }
}