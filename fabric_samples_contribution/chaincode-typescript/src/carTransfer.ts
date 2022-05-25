/*
 * SPDX-License-Identifier: Apache-2.0
 */

import {Context, Contract, Info, Returns, Transaction} from 'fabric-contract-api';
import {Car} from './car';

@Info({title: 'CarTransfer', description: 'Smart contract for tracking cars state'})
export class CarTransferContract extends Contract {

    @Transaction()
    public async InitLedger(ctx: Context): Promise<void> {
        const cars: Car[] = [
            {
                ID: "000000",
                Model: "2012",
                Owner: "Abdou",
                Engine: "Diesel",
                Brand: "BMW"
            },
            {
                ID: "000001",
                Model: "2015",
                Owner: "Nadia",
                Engine: "Essence",
                Brand: "Mercedes"
            },
            {
                ID: "000003",
                Model: "2011",
                Owner: "Salim",
                Engine: "Electric",
                Brand: "Tesla"
            },

        ];

        for (const car of cars) {
            car.docType = 'car';
            await ctx.stub.putState(car.ID, Buffer.from(JSON.stringify(car)));
            console.info(`Car ${car.ID} initialized`);
        }
    }

    @Transaction()
    public async registerCar(ctx: Context, ID: string, Model: string, Owner: string, Engine: string, Brand: string): Promise<string> {
        const exists = await this.CarExists(ctx, ID);
        if(exists){
            throw new Error(`This car is already registered in the ledger.`)
        }
        const car = {
            ID, Model, Owner, Engine, Brand
        }
        await ctx.stub.putState(ID, Buffer.from(JSON.stringify(car)));

        return JSON.stringify(car);
    }

    @Transaction(false)
    public async getCar(ctx: Context, ID: string): Promise<string> {
        const carBuffer = await ctx.stub.getState(ID);
        if(!carBuffer || carBuffer.length === 0){
            throw new Error(`The car ${ID} does not exist in the ledger.`)
        }
        return carBuffer.toString();
    }

    @Transaction()
    public async updateCar(ctx: Context, ID: string, Model: string, Owner: string, Engine: string, Brand: string): Promise<string> {
        const exists = await this.CarExists(ctx, ID);
        if(!exists){
            throw new Error(`The car with this ${ID} does not exist.`);
        }
        const updatedCar = {
            ID, Model, Owner, Engine, Brand 
        }
        await ctx.stub.putState(ID, Buffer.from(JSON.stringify(updatedCar)));
        return JSON.stringify(updatedCar);
    }

    @Transaction()
    public async deleteCar(ctx: Context, ID: string): Promise<void> {
        const exists = await this.CarExists(ctx, ID);
        if(!exists){
            throw new Error(`The car with this ${ID} does not exist.`);
        }
        await ctx.stub.deleteState(ID);
    }

    @Transaction(false)
    @Returns('boolean')
    public async CarExists(ctx: Context, ID: string): Promise<boolean> {
        const carBuffer = await ctx.stub.getState(ID);
        return carBuffer && carBuffer.length > 0; 
    }

    @Transaction()
    public async transferCarOwnership(ctx: Context, ID: string, newOwner: string): Promise<void> {
        const carString = await this.getCar(ctx, ID);
        const car = JSON.parse(carString);
        car.Owner = newOwner; // you cna check if they are different
        await ctx.stub.putState(ID, Buffer.from(JSON.stringify(car)));
    }

    @Transaction(false)
    @Returns('string')
    public async GetAllCars(ctx: Context): Promise<string> {
        const allResults = [];
        // range query with empty string for startKey and endKey does an open-ended query of all assets in the chaincode namespace.
        const iterator = await ctx.stub.getStateByRange('', '');
        let result = await iterator.next();
        while (!result.done) {
            const strValue = Buffer.from(result.value.value.toString()).toString('utf8');
            let record;
            try {
                record = JSON.parse(strValue);
            } catch (err) {
                console.log(err);
                record = strValue;
            }
            allResults.push({Key: result.value.key, Record: record});
            result = await iterator.next();
        }
        return JSON.stringify(allResults);
    }

        // console.log("XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX ", car.length);
    // console.log("XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX ", car.toString());
}
