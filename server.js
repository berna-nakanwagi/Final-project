//dependencies
const express = require('express');
const path = require("path");
const mongoose = require("mongoose");
const passport = require('passport');
const expressSession = require("express-session")({
  secret:"privacy",
  resave:false,
  saveUninitialized:false  
})
const flash = require("connect-flash");
require("dotenv").config();//without it database willnot work

//import user registration model
const Registration = require("./models/Registration")

//import routes
const authRoutes = require('./routes/authRoutes');
const indexRoutes = require('./routes/indexRoutes');
const stockRoutes = require('./routes/stockRoutes');
const salesRoutes = require('./routes/salesRoutes');

//instantiations
const app = express();
const port = 3000

//configurations
app.set('view engine', 'pug');//setting up pug as a view engine
app.set('views', path.join(__dirname, 'views'));//specifying the views directory

//setting up database connections
mongoose.connect(process.env.MONGO_URI);
mongoose.connection
  .once("open",() => {
    console.log("mongoose connection open");
  })
  .on("error",(error) => {
    console.error(`connection error:${error.message}`);
  });

//middleware

// 1. Express session (must be before flash and passport)
app.use(expressSession);

// 2. Passport initialization
app.use(passport.initialize());
app.use(passport.session());

// 3. Flash messages
app.use(flash());

// 4. Body parser and static files
app.use(express.urlencoded({extended: false}));
app.use(express.static(path.join(__dirname,'public')));
app.use('/public/images/uploads', express.static(__dirname + '/public/images/uploads'));

// 5. Global variables for views (after session and flash)
app.use((req, res, next) => {
  res.locals.currentUser = req.user; // Passport user
  res.locals.success_msg = req.flash('success_msg');
  res.locals.error_msg = req.flash('error_msg');
  next();
});

//passport configuration
passport.use(Registration.createStrategy());
passport.serializeUser(Registration.serializeUser());
passport.deserializeUser(Registration.deserializeUser());

//use imported routes
app.use('/', authRoutes);
app.use('/', indexRoutes);
app.use('/', stockRoutes);
app.use('/', salesRoutes);

//handling non existing routes (last route)
app.use((req, res) => {
  res.status(404).send('Oops! Route not found.');
});

app.listen(port, () => console.log(`listening on port ${port}`));
