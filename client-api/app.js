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
    logger.debug('New req for %s', req.originalUrl);
    if (req.originalUrl.indexOf('/users') >= 0 || req.originalUrl.indexOf('/users/login') >= 0 || req.originalUrl.indexOf('/createUser') >= 0 || req.originalUrl.indexOf('/validateUser') >= 0 || req.originalUrl.indexOf('/users') >= 0 ){
        return next();
    }
    let token = req.token;
    jwt.verify(token, app.get('secret'), (err, decoded) => {
        if(err) {
            console.log(`Error ============:${err}`);
            res.send({
                success: false,
                message: 'Failed to authenticate token. Make sure to include the token returned from /users call in the authorization header as a Bearer token'
            });
            res.json({ success: false, message: message });
            return;
        } else {
            req.useremail = decode.email;
            req.orgname = decoded.mspid;
            logger.debug(util.format('Decoded from JWT token: username - %s, hospitalname - %s', decoded.email, decoded.mspid));
            return next();
        }
    })
})

let server = http.createServer(app).listen(port, () => { console.log(`Server started on ${port}`) });
logger.info('*********************** SERVER STARTED *********************');
logger.info('*********************** http://%s:%s *******************', host, port);
server.timeout = 240000;

function getErrorMessage(field){

}

// Register a new user to the healthcare fabric network
app.post('/createUser', async ( res, res ) => {
    let { emailid, password, lastName, mspid, hospital_affiliation } = req.body;

    logger.debug('End point: /createUser');
    logger.debug('Email id:' + emailid);
    logger.debug('Mps id:' + mspid);

    let token = jwt.sign({
        exp: Math.floor(Date.now() / 1080) + parseInt(constants.jwt_expiretime),
        email: emailid,
        mspid: mspid
    }, app.get('secret'));

    let response = await helper.CreateUser(emailid, password, mspid);

    if(response && typeof response !== 'string'){
        logger.debug('Successfully registered the username %s', emailid);
        response.token = token;
        res.json(response);
    } else {
        logger.debug('Failed to register the username %s', emailid);
        res.json({ success: false, message: response });
    }

});

// Register and enroll user
app.post('/users', async (req, res) => {});

// Register and enroll user
app.post('/register', async (req, res) => {});

// validate a user
app.post('/validateUser', async (req, res) => {});

// login and get jwt
app.post('/users/login', async (req, res) => {});
