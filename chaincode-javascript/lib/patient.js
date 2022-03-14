/*
 * Copyright IBM Corp. All Rights Reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

'use strict';

// Deterministic JSON.stringify()
const stringify  = require('json-stringify-deterministic');
const sortKeysRecursive  = require('sort-keys-recursive');
const { Contract } = require('fabric-contract-api');

class Patient extends Contract {

    async InitLedger(ctx) {
        const patients = [
            {
                FirstName: 'Eric',
                LastName: 'Rolat',
                ID: '653298875',
                idType: 'Ollop',
                DOB: '12/05/1995',
                BloodType: 'A+',
                Donor: false,
                Mobile: '0612356958',
                Address: '12 Round Table Drive NY, OH 45256'
            },
            {
                FirstName: 'Jason',
                LastName: 'Roberson',
                ID: '123456875',
                IdType: 'Aadhar',
                DOB: '12/05/1998',
                BloodType: 'O+',
                Donor: true,
                Mobile: '0612356958',
                Address: '12 Round Table Drive NY, OH 45256'
            }
        ];

        for (const patient of patients) {
            patient.docType = 'patient';
            // example of how to write to world state deterministically
            // use convetion of alphabetic order
            // we insert data in alphabetic order using 'json-stringify-deterministic' and 'sort-keys-recursive'
            // when retrieving data, in any lang, the order of data will be the same and consequently also the corresonding hash
            await ctx.stub.putState(patient.ID, Buffer.from(stringify(sortKeysRecursive(patient))));
            console.info(`Patient ${pateint.ID} initialized`);
        }
    }

    async createUser(ctx, args) {
        console.log(args);
        args = JSON.parse(args);

        const user = {
            email: args.email,
            confirmPass: args.confirmPass,
            lastName: args.lastName,
            mspid: args.mspid
        }

        const buffer = await ctx.stub.putState(user.email, Buffer.from(JSON.stringify(user)));
        let response = `Successfully created user account for ${user.email}. Use your email and
        and password to log in to the healthcare network above.`;

        return response;
    }

    async AddPatient(ctx, ID, IdType, FirstName, LastName, DOB, BloodType, Donor, Mobile, Address){
        
        const exists = await this.AssetExists(ctx, ID);

        if(exists){
            throw new Error(`The patient ${id} already exists`);
        }

        const patient = {
            ID,
            IdType,
            FirstName,
            LastName,
            DOB,
            BloodType,
            Donor,
            Mobile,
            Address
        };

        const buffer = await ctx.stub.putState(ID, Buffer.from(JSON.stringify(pateint)));
        console.info(`Successfully added patient having ID:${ID}`);
        //return buffer
        return JSON.stringify(patient)

    }

    async ReadPatient(){}

    async UpdatePatient(){}

    async DeletePatient(){}

    async TransferPatient(){}

    async GetAllPatient(ctx){
        const allResults = [];
        // range query with empty string for startKey and endKey does an open-ended query of all 
        // patients in the chaincode namespaces
        const iterator = await ctx.stub.getStateByRange('', '');
        let result = await iterator.next()
        while(!result.done){
            const strValue = Buffer.from(result.value.value.toString()).toString('utf8');
            let record;

            try {
                record = JSON.parse(strValue)
            } catch (err) {
                console.log(err);
                record = strValue;
            }

            allResults.push({ Key: result.value.key, Record: record });
            result = await iterator.next();
        }

        return JSON.stringify(allResults);
        
    }

    async AddDrug(){}

    async AddReport(ctx, args){

        args = JSON.parse(args);
        
        const reportPublic = {
            patientId: args.patientId,
            reportNumber: args.reportNumber,
            reportName: args.reportName,
            date: new Date().toISOString().slice(0, 10)
        }

        const reportPrivate = {
            introduction: args.introduction,
            procedure: args.result,
            imageHash: args.imageHash
        };

        await ctx.stub.putPrivateData('collectionReport', args.patientId, Buffer.from(JSON.stringify(reportPublic)));
        await ctx.stub.putPrivateData('collectionReportPrivateDetails', args.patientId, Buffer.from(JSON.stringify(reportPrivate)));

    }

    async ReadReportPublic(){}

    async ReadReportPublic(){}

    async ReadReportPrivate(){}

    async ReadDrugPrivate(){}

    async ReadDrugPublic(){}

    async RemoveAsset(){}

    async ChangeDrugOwner(){}

    async AssetExists(ctx, id){
        const assetJSON = await ctx.stub.getState(id);
        return assetJSON && assetJSON.length > 0;
    }

    async ReadAsset(){}

    async queryAll(){}

}

module.exports = Patient;
