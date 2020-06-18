const express = require('express');
const expressLayouts = require('express-ejs-layouts');
const mongoose = require('mongoose');
const flash = require('connect-flash');
const session = require('express-session');
const passport = require('passport');


var http = require('http');
var https = require('https');

const app = express();

//PASSPORT CONFIG
require('./config/passport')(passport);

//DB config
const db = require('./config/keys').MongoURI;

//Connect to MongoDB
mongoose.connect(db, { useNewUrlParser : true, useUnifiedTopology: true})
.then(() => console.log('Connected to MongoDb..'))
.catch(err => console.log(err)); 

//EJS
app.use(expressLayouts);
app.set('view engine', 'ejs');

//BODY PARSER
app.use(express.urlencoded({ extended : false }));

// EXPRESS SESSION
app.use(
    session({
      secret: 'secret',
      resave: true,
      saveUninitialized: true
    })
  );

// PASSPORT MIDDLEWARE
app.use(passport.initialize());
app.use(passport.session());

//CONNECT FLASH
app.use(flash());

//GLOBAL VARS
app.use((req,res,next) => {
    res.locals.success_msg = req.flash('success_msg');
    res.locals.error_msg = req.flash('error_msg');
    res.locals.error = req.flash('error');
    next();
});



//ROUTES
app.use('/', require('./routes/index'));
app.use('/users', require('./routes/users'));

const port = process.env.port || 3000;

app.listen(port, console.log(`Connected correctly to the server on port ${port}...`));