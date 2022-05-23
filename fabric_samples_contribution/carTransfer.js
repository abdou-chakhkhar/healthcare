'use strict';

const { Contract } = require('fabric-contract-api');
const AssetTransfer = require('../../chaincode-javascript/lib/assetTransfer');

class CarTransfer extends Contract {

    // async InitLedger(ctx){
    //     const cars = [
    //         {
    //             ID: "000000",
    //             Model: "2012",
    //             Owner: "Abdou",
    //             Engine: "Diesel",
    //             Brand: "BMW"
    //         },
    //         {
    //             ID: "000001",
    //             Model: "2015",
    //             Owner: "Nadia",
    //             Engine: "Essence",
    //             Brand: "Mercedes"
    //         },
    //         {
    //             ID: "000003",
    //             Model: "2011",
    //             Owner: "Salim",
    //             Engine: "Electric",
    //             Brand: "Tesla"
    //         }
    //     ];
    //     for(const car of cars){
    //         car.docType = 'car';
    //         await ctx.stub.putState(car.ID, Buffer.from(JSON.stringify(car)));
    //         console.info(`Car ${car.ID} was created to the blockchain.`)
    //     }
    // }

    async getCar(ctx, ID){
        const carBuffer = await ctx.stub.getState(ID);
        if(!carBuffer || carBuffer.length === 0){
            throw new Error(`The car ${ID} does not exist in the ledger.`)
        }
        return carBuffer.toString();
    }

    async registerCar(ctx, ID, Model, Owner, Engine, Brand){
        const exists = await this.CarExists(ctx, ID);
        if(exists){
            throw new Error(`This car is already registered in the ledger.`)
        }
        const car = {
            ID, Model, Owner, Engine, Brand
        }
        await ctx.stub.putState(ID ,Buffer.from(JSON.stringify(car)));
        return JSON.stringify(car);
    }

    async CarExists(ctx, id){
        const carBuffer = await ctx.stub.getState(id);
        return carBuffer && carBuffer.length !== 0; 
    }


    // console.log("XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX ", car.length);
    // console.log("XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX ", car.toString());
}

module.exports = CarTransfer;