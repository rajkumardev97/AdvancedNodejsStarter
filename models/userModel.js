const mongoose = require('mongoose');
Schema = mongoose.Schema;
mongoose.Promise = Promise;
const db = require('../connections/dbMaster');  
 
// Define our user schema
const UserSchema = new mongoose.Schema({  
    name: { type: String, required: true },
    email: {
        type: String,
        unique: true,
        index: true,
        validate: [
            function (email) {
                let emailRegex = /^(([^<>()\[\]\.,;:\s@\"]+(\.[^<>()\[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i;
                return emailRegex.test(email);
            },
            'The e-mail is invalid.'
        ],
        trim: true,
        lowercase: true,
        required: true,
        set: function (v) {
            return `${v}`.toLowerCase()
        }
    },
    password: {
        type: String,
        required: true,
        minlength: 8,
        validate: /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&\*])(?=.{8,})/
    },
    gender: {
        type: String,
        default: "male",
        enum: ['male', 'female', 'others'],
        set: function (v) {
            return v.toLowerCase().trim();
        }
    },
    profilePic: {
        type: String
    }, 
    salt: {
        type: String,
        default: ""
    },  
    isAdmin: { type: Boolean, default: false },
    created: { type: Date, default: Date.now }, 
    resettoken: {
      type: String,
      required: false
    }
});


module.exports = db.model('User', UserSchema);
 
