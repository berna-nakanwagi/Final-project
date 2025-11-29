const mongoose = require('mongoose');
const passportLocalMongoose = require('passport-local-mongoose');

const registrationSchema = new mongoose.Schema({
    username: {
        type: String,
    },
    email: {
        type: String,
        trim: true,
        unique: true,
    },
    role: {
        type: String,
        required: true,
    }
});
registrationSchema.plugin(passportLocalMongoose, {
    usernameField: 'email'
});
module.exports = mongoose.model('Registration', registrationSchema);