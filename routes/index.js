const express = require('express');
const router = express.Router(); 
const users =  require('./users') 
const {isAuthenticated} = require('../middlewares/authCheck') 

// router.use(isAuthenticated); 
router.use('/users',users); 

module.exports = router;
