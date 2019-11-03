const jwt = require('jsonwebtoken');
const { appSecret } = require('../config/config');
const { handleError } = require('../utils/requestHandlers')
const { isUserExists,get } = require('../services/user');
const appURI = "/api";
const skipUrls = ['/users/login', '/users/register', '/users/fbLogin'];


exports.isAuthenticated = async function (req, res, next) {
	const url = req.url.replace(appURI, "").split("?")[0];
	let token = req.headers['authorization']
	if (skipUrls.indexOf(url) != -1) return next();
	try {
		let {userId,salt} = await jwt.verify(token, appSecret);
		let user = await get(userId);
		if (!user) throw 'Invalid token,No user exists';
		if(user.salt!==salt) throw 'Invalid token,No user exists';
		req.user=user
		next();
	}
	catch (err) {
		handleError({ res, err, statusCode: 401 })
	}
} 
 
 exports.verifyToken = async function (req, res, next) {
    //here we check authentication of the user from thier token
    const bearerHeader = req.headers["authorization"];
    //console.log("bearerHeader is " + bearerHeader);
    if (typeof bearerHeader !== "undefined") {
      const bearer = bearerHeader.split(" ");
      //  console.log(bearer);
      const bearerToken = bearer[1];

      req.token = bearerToken;

      next();
    } else {
      res.sendStatus(403); //if no user token so res will be forbidden
    }
  }