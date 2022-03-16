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

        // check to see if we've already enrolled the admin user.
        let adminIdentity = await wallet.get(configObj.config.appAdmin);
        if(!adminIdentity){
            console.log(`An identity for the admin user "admin" does not exist in the wallet`);
            // let response = {
            //     success: true,
            //     message: 'Admin user doesnt exists',
            // };
            // return response;
            await enrollAdmin(orgMSPID, configObj.ccp);
            adminIdentity = await wallet.get('admin');
            console.log("Admin Enrolled Successfully");
        }

        const connectOptions = {
            wallet, identity: configObj.config.appAdmin, discovery: configObj.config.gatewayDiscovery
        };

        // Create a new gateway for connecting to our peer node.
        const gateway = new Gateway();
        await gateway.connect(configObj.ccp, connectOptions);

        // Get the CA client object from the gateway for interacting with the CA.
        // const caURL = await getCaUrl(orgMSPID, configObj.ccp);
        const caName = await getCAName(orgMSPID);
        const caURL = configObj.ccp.certificateAuthorities[caName].url;

        const ca = new FabricCAServices(caURL);

        // build a user object for authenticating with the CA
        const provider = wallet.getProviderRegistry().getProvider(adminIdentity.type);
        const adminUser = await provider.getUserContext(adminIdentity, 'admin');

        // Register the user, enroll the user, and import the new identity into the wallet.
        const secret = await ca.register({ enrollmentID: email, role: 'client' }, adminUser);
        const enrollment = await ca.enroll({ enrollmentID: email, enrollmentSecret: secret });
        const x509Identity = await createIdentity(enrollment, orgMSPID);
        await wallet.put(email, x509Identity);

        console.log(`Successfully registered and enrolled admin user ${email} and imported it into wallet`);

        let response = {
            success: true,
            message: email + ' enrolled Successfully',
        };
        return response;

    } catch (error) {
        //console.log(error);
        return error.message;
    }

}

const getCAName = async (org) => {};

const createIdentity = async (enrollment, orgMSPID) => {};

