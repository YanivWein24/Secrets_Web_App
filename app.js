//  npm i express body-parser
require('dotenv').config();
// need to require this package as early as possible, then create a hidden file called ".env"
const express = require('express');
const bodyParser = require('body-parser');
const ejs = require('ejs');
const mongoose = require('mongoose');
const encrypt = require('mongoose-encryption');

const app = express();

// console.log(process.env.SECRET)   // Fetch the secret / APIKEY ...

app.use(express.static("public"));
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({
    extended: true
}));

mongoose.connect("mongodb://localhost:27017/userDB", { useNewUrlParser: true });


const userSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
});

//? encrypt the password field:
const secret = process.env.SECRET;
// instead of writing the secret in a "string" format, we used dotenv to move it to an hidden file, and now we can
// fetch the secret from the hidden file we created and configured
userSchema.plugin(encrypt, { secret: secret, encryptedFields: ['password'] });
//* the document will be encrypted when calling "save" method, and decrypted when calling "find" method.
// the "plugin" method allows us to add extra functionality for the Schema
// if we want to encrypt more fields, we can add them after "password" inside the array.  


const User = mongoose.model('User', userSchema);

app.get('/', function (req, res) {
    res.render("home"); // refers to home.ejs
});

app.get('/login', function (req, res) {
    res.render("login");    // refers to login.ejs
});

app.get('/register', function (req, res) {
    res.render("register"); // refers to register.ejs
});

app.post("/register", function (req, res) {
    const newUser = new User({
        email: req.body.username,
        password: req.body.password
    });
    console.log(req.body.username, req.body.password);
    newUser.save(function (err) {   // the password is being *encrypted* when calling this function
        if (err) {
            console.log(err);
        } else {
            res.render("secrets")
        }
    })
});


app.post("/login", function (req, res) {
    const username = req.body.username;
    const password = req.body.password;
    User.findOne({ email: username }, function (err, foundUser) {
        // the password is being *decrypted* when calling this function
        if (err) {
            console.log(err);
        } else {
            if (foundUser) {  // if  a user is found
                if (foundUser.password === password) {
                    res.render("secrets");
                } else { res.send("Wrong Password!") };
            } else { res.send("User not found, please check the provided Email Address") }
        };
    });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, function () {
    console.log("Server started on port 3000");
});