const express = require('express');
const expressLayouts = require('express-ejs-layouts');
const mongoose = require('mongoose');
const flash = require('connect-flash');
const session = require('express-session');
const passport = require('passport');
var http = require('http');
var https = require('https');
var fs = require('fs');

var options = {
  key : fs.readFileSync('bin/private.key'),
  cert: fs.readFileSync('bin/certificate.pem')
};

const app = express();

//secure traffic only
app.all('*', (req, res, next) => {
  if(req.secure) {   //if the request is secure than the req object will carry this flag called secure set to be true
    return next();
  }
  else {
    res.redirect(307, 'https://' + req.hostname + ':' + (port + 443) + req.url);
  }
});

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

//app.listen(port, console.log(`Connected correctly to the server on port ${port}...`));
// Create an HTTP service.
http.createServer(app).listen(port);

// Create an HTTPS service identical to the HTTP service.
https.createServer(options, app).listen(port + 443, () => {
  console.log(`Connected correctly to the port ${port+443}`);
});

