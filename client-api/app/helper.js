'use strict';

let { Gateway, Wallets, DefaultEvenHandlerStrategies, X509WalletMixin } = require('fabric-network');
const path = require('path');
const FabricCAServices = require('fabric-ca-client');
const fs = require('fs');

const util = require('util');

let ccpPath;
let configPath;

const getConnProfile = async (mspid) => {};

const ConnectToNetwork = async (channelName) => {};

const CreateUser = async (email, password, orgMSPID) => {
    if(!email || !password || !orgMSPID){
        throw Error('Error! Please fill the registration form');
    }

    try {
        let configObj = await getConnProfile(orgMSPID);
        const walletPath = await getWalletLocation(orgMSPID);
        const wallet = await Wallets.newFileSystemWallet(walletPath);

        // Check to see if we've already enrolled the user.
        const userIdentity = await wallet.get(email);
        if (userIdentity){
            console.log(`An identity for the user ${email} already exists in the wallet`);
            let response = {
                success: true,
                message: email + ' already exists!',
            };
            return response;
        }
    } catch (error) {
        
    }
}