const express = require("express");
const router = express.Router();
const {
 test,authorizedUsertest,register,login,getUserByIdorEmail,getUserByToken
} = require('../controllers/users/userController');

const rateLimiter = require('../middlewares/rateLimiter');
const {isAuthenticated,verifyToken} = require('../middlewares/authCheck');

// @route   GET api/users/test
// @desc    Tests users route
// @access  Public
router.get("/test",test);


// @route   GET api/users/authorizedusertest
// @desc    Tests Users route
// @access  Private

//this api route created for testing purpose only authenticate and authorized person can access this API
router.get("/authorizedusertest", verifyToken,authorizedUsertest)

router.post('/login', rateLimiter, login);

router.post('/register', register); 

router.get('/',verifyToken,getUserByToken);
 
module.exports = router;
