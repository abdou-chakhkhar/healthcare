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
app.post('/validateUser', async (req, res) => {
    let { email, org } = req.body;
    logger.debug('End point : /validateUser');
    logger.debug('Email id : ' + email);
    logger.debug('Org : ' + org);

    if(!email){
        res.json(getErrorMessage('\'email\''));
        return;
    }

    try {
        let token = jwt.sign({
            exp: Math.floor(Date.now() / 1000) + parseInt(constants.jwt_expiretime),
            email,
            mspid: org
        }, app.get('secret'));

        let isUserRegistered = await helper.isUserRegistered(email, org);

        if(isUserRegistered){
            let res_msg = {
                success: true,
                token,
                message: 'Registered user'
            };
            res.json(res_msg);
        } else {
            let res_msg = {
                success: false,
                token: '',
                message: `User with Emailid ${email} is not registered, Please register first.`
            };
            res.json(res_msg);
        }
    } catch (error) {
        console.log(error);
    }

});

// login and get jwt
app.post('/users/login', async (req, res) => {});

// Register Patient
app.post('/patients/register', async (req, res) => {});

// Invoke transaction on chaincode on target peers
app.post('/channels/:channelName/chaincodes/:chaincodeName', async (req, res) => {
    try {
        logger.debug('===================== INVOKE ON CHAINCODE =====================');
        let peers = req.body.peers;
        let chaincodeName = req.params.chaincodeName;
        let channelName = req.params.channelName;
        let fcn = req.body.fcn;
        let args = req.body.args;
        let transient = req.body.transient;
        let orgName = req.orgname;
        let userEmail = req.useremail;

        logger.debug('Transient data is ;' + transient);
        logger.debug('channelName : ' + channelName);
        logger.debug('chaincodeName : ' + chaincodeName);
        logger.debug('fcn : ' + fcn);
        logger.debug('args : ' + args);
        logger.debug('org : ' + orgName);

        if(!chaincodeName) {
            res.json(getErrorMessage('\'chaincodeName\''));
            return;
        }
        if(!channelName){
            res.json(getErrorMessage('\'channelName\''));
            return;
        }
        if(!fcn){
            res.json(getErrorMessage('\'fcn\''));
            return;
        }
        if(!args){
            res.json(getErrorMessage('\'args\''));
            return;
        }

        let message = await invoke.invokeTransaction(channelName, chaincodeName, fcn, args, userEmail, orgName, transient);
        console.log('message result is : ' + message.message);
        if(message.message.startsWith('Successfully ')){
            const response_payload = {
                success: true,
                result: message,
                errorData: null
            };
            res.send(response_payload);
        } else {
            const response_payload = {
                success: false,
                result: null,
                errorData: message
            };
            res.send(response_payload);
        }

    } catch (error) {
        const response_payload = {
            success: false,
            result: null,
            error: error.name,
            errorData: error.message
        };
        res.send(response_payload);
    }
});

app.get('/channels/:channelName/chaincodes/:chaincodeName', async (req, res) => {
    try {
        logger.debug('===================== INVOKE ON CHAINCODE =====================');
        let channelName = req.params.channelName;
        let chaincodeName = req.params.chaincodeName;
        console.log(`chaincode name is :${chaincodeName}` );
        let args = req.query.args;
        let fcn = req.query.fcn;
        let peer = req.query.peer;

        args = args.replace(/'/g, '""');
        logger.debug(args);


        logger.debug('channelName : ' + channelName);
        logger.debug('chaincodeName : ' + chaincodeName);
        logger.debug('fcn : ' + fcn);
        logger.debug('args : ' + args);

        if(!chaincodeName){
            res.json(getErrorMessage('\'chaincodeName\''));
            return;
        }

        if(!channelName){
            res.json(getErrorMessage('\'channelName\''));
            return;
        }


    } catch (error) {
        
    }
});

app.post('/qscc/channels/:channelName/chaincodes/:chaincodeName', async (req, res) => {});