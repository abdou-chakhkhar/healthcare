'use strict';
const log4js = require('log4js');
const logger = log4js.getLogger('Hopital-sample');
const bodyParser = require('body-parser');
const http = require('http');
const util = require('util');
const express = require('express');
const app = express();
const expressJWT = require('express-jwt');
const jwt = require('jsonwebtoken');
const bearerToken = require('express-bearer-token');
const cors = require('cors');
const constants = require('./config/constants.json');

const host = process.env.HOST || constants.host;
const port = process.env.PORT || constants.port;

const helper = require('./app/helper');
const invoke = require('./app/invoke');
const qscc = require('./qscc');
const query = require('./app/query');

app.options('*', cors());
app.use(cors());
app.use(bodyParser.urlencoded({
    extended: false
}));

// set secret variable
app.set('secret', 'thisismysecret');
app.use(expressJWT({
    secret: 'thisismysecret', algorithms: ['HS256'] // setting the signing algorithm as "HMAC SHA256"
}).unless({
    path: ['/users', '/users/login', '/register', '/validateUser', '/createUser']
}));
app.use(bearerToken());
logger.level = 'debug';

app.use((req, res, next) => {
    
})

