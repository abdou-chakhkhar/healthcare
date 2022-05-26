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

        let indexName = 'brand~id';
        let brandIdIndexKey = await ctx.stub.createCompositeKey(indexName, [car.Brand, car.ID]);
        
		//  Save index entry to state. Only the key name is needed, no need to store a duplicate copy of the marble.
		//  Note - passing a 'nil' value will effectively delete the key from state, therefore we pass null character as value
		await ctx.stub.putState(brandIdIndexKey, Buffer.from('\u0000'));
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
        if (!ID) {
			throw new Error('Car ID must not be empty');
		}
        const exists = await this.CarExists(ctx, ID);
        if(!exists){
            throw new Error(`The car with this ${ID} does not exist.`);
        }

		let valAsbytes = await ctx.stub.getState(ID); 
		let jsonResp = {error: null, };
		if (!valAsbytes) {
			jsonResp.error = `Asset does not exist: ${ID}`;
			throw new Error(JSON.stringify(jsonResp));
		}
		let carJSON;
		try {
			carJSON = JSON.parse(valAsbytes.toString());
		} catch (err) {
			jsonResp = { error: null};
			jsonResp.error = `Failed to decode JSON of: ${ID}`;
			throw new Error(JSON.stringify(jsonResp));
		}
		await ctx.stub.deleteState(ID); 

        // delete the index
		let indexName = 'brand~id';
		let brandIdIndexKey = ctx.stub.createCompositeKey(indexName, [carJSON.brand, carJSON.ID]);
		if (!brandIdIndexKey) {
			throw new Error(' Failed to create the createCompositeKey');
		}
		//  Delete index entry to state.
		await ctx.stub.deleteState(brandIdIndexKey);
    }

    @Transaction(false)
    @Returns('boolean')
    public async CarExists(ctx: Context, ID: string): Promise<boolean> {
        const carBuffer = await ctx.stub.getState(ID);
        return carBuffer && carBuffer.length > 0; 
    }

    @Transaction()
    public async transferCarOwnership(ctx: Context, ID: string, newOwner: string): Promise<void> {
        let carAsBytes = await ctx.stub.getState(ID);
		if (!carAsBytes || !carAsBytes.toString()) {
			throw new Error(`Asset ${ID} does not exist`);
		}
		let carOwnershipToTransfer = {Owner: ""};
		try {
			carOwnershipToTransfer = JSON.parse(carAsBytes.toString()); //unmarshal
		} catch (err) {
			let jsonResp = { error: null };
			jsonResp.error = 'Failed to decode JSON of: ' + ID;
			throw new Error(JSON.stringify(jsonResp));
		}
		carOwnershipToTransfer.Owner = newOwner; //change the owner

		let assetJSONasBytes = Buffer.from(JSON.stringify(carOwnershipToTransfer));
		await ctx.stub.putState(ID, assetJSONasBytes); 
    }

    @Transaction()
    public async transferCarOwnershipByBrand(ctx: Context, Brand: string, newOwner: string): Promise<void> {
		// Query the brand~id index by color
		// This will execute a key range query on all keys starting with 'color'
        let brandedCarsResultsIterator = await ctx.stub.getStateByPartialCompositeKey('brand~id', [Brand]);

		// Iterate through result set and for each car found, transfer to newOwner
		let responseRange = await brandedCarsResultsIterator.next();
		while (!responseRange.done) {
			if (!responseRange || !responseRange.value || !responseRange.value.key) {
				return;
			}

			let objectType;
			let attributes;
			(
				{objectType, attributes} = await ctx.stub.splitCompositeKey(responseRange.value.key)
			);

			console.log("XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX ", objectType);
			console.log("XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX ", attributes);

			let returnedAssetName = attributes[1];

			// Now call the transfer function for the found asset.
			// Re-use the same function that is used to transfer individual cars
			await this.transferCarOwnership(ctx, returnedAssetName, newOwner);
			responseRange = await brandedCarsResultsIterator.next();
		}        

    }

    @Transaction(false)
    @Returns('string') // StateQueryIterator
    // public async GetAllCars(iterator: any, isHistory: boolean): Promise<object> {
	// 	let allResults = [];
	// 	let res = await iterator.next();
	// 	while (!res.done) {
	// 		if (res.value && res.value.value.toString()) {
	// 			let jsonRes = {TxId: null, Timestamp: null, Value: null, Key: null, Record: null, };
	// 			console.log(res.value.value.toString('utf8'));
	// 			if (isHistory && isHistory === true) {
	// 				jsonRes.TxId = res.value.tx_id;
	// 				jsonRes.Timestamp = res.value.timestamp;
	// 				try {
	// 					jsonRes.Value = JSON.parse(res.value.value.toString('utf8'));
	// 				} catch (err) {
	// 					console.log(err);
	// 					jsonRes.Value = res.value.value.toString('utf8');
	// 				}
	// 			} else {
	// 				jsonRes.Key = res.value.key;
	// 				try {
	// 					jsonRes.Record = JSON.parse(res.value.value.toString('utf8'));
	// 				} catch (err) {
	// 					console.log(err);
	// 					jsonRes.Record = res.value.value.toString('utf8');
	// 				}
	// 			}
	// 			allResults.push(jsonRes);
	// 		}
	// 		res = await iterator.next();
	// 	}
	// 	iterator.close();
	// 	return allResults;
    // }

    @Transaction(false)
    @Returns('string')
    public async GetCarsByRange(ctx: Context, startKey: string, endKey: string): Promise<string> {
        let iterator = await ctx.stub.getStateByRange(startKey, endKey);

        let allResults = [];
		let res = await iterator.next();
		while (!res.done) {
			if (res.value && res.value.value.toString()) {
				let jsonRes = { Key: null, Record: null, };
				console.log(res.value.value.toString());

					jsonRes.Key = res.value.key;
					try {
						jsonRes.Record = JSON.parse(res.value.value.toString());
					} catch (err) {
						console.log(err);
						jsonRes.Record = res.value.value.toString();
					}
				
				allResults.push(jsonRes);
			}
			res = await iterator.next();
		}
		//iterator.close();

        console.log("XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX ", allResults);

        return JSON.stringify(allResults);
    }


        // console.log("XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX ", car.length);
    // console.log("XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX ", car.toString());
}
