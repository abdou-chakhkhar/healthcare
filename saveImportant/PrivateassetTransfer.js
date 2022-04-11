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

const assetCollection = "assetCollection"

class AssetTransfer extends Contract {


    async CreateAsset(ctx,) {
        const transientMap = await ctx.stub.getTransient()

        if (!transientMap) {
            throw new Error(`error getting transient`);
        }


        console.log("XXXXXXXXXXX - transientMap to debug", transientMap);
        const transientAssetJSON = transientMap.get("asset_properties");
        console.log("XXXXXXXXXXX - transientAssetJSON to debug", transientAssetJSON.toString());


        if (!transientAssetJSON) {
            throw new Error(`asset not found in the transient map input`);
        }

        let assetInput = JSON.parse(transientAssetJSON);

        console.log("XXXXXXXXXXXAA - assetInput to debug", assetInput);

        if (!assetInput.objectType && assetInput.objectType === "") {
            throw new Error(`objectType field must be a non-empty string`);
        }

        if (!assetInput.assetID && assetInput.assetID === "") {
            throw new Error(`assetID field must be a non-empty string`);
        }

        if (!assetInput.color && assetInput.color === "") {
            throw new Error(`color field must be a non-empty string`);
        }

        if (!assetInput.size && assetInput.size <= "") {
            throw new Error(`size field must be a positive integer`);
        }

        if (!assetInput.appraisedValue && assetInput.appraisedValue <= "") {
            throw new Error(`appraisedValue field must be a positive integer`);
        }

	    // Check if asset already exists
        const assetAsBytes = await ctx.stub.getPrivateData(assetCollection, assetInput.assetID);


        console.log("YYYYYYYYYYYYYY- assetAsBytes to debug", assetAsBytes);

        if (assetAsBytes != '') {
            throw new Error(`this asset already exists`);
        }

        const ClientID = await ctx.clientIdentity.getMSPID();

        console.log("YYYYYYYYYYYYYY- ClientID to debug", typeof ClientID);

        if (!ClientID && ClientID == '') {
            throw new Error(`Failed to read clientID`);
        }

        const peerMSPID = await ctx.stub.getMspID();

        console.log("ZZZZZZZZZZZZZZZZ- peerMSPID to debug", peerMSPID);

        if (ClientID !== peerMSPID) {
            throw new Error(`client from org %v is not authorized to read or write private data from an org %v peer`);
        }

        const asset = {
            objectType: assetInput.objectType,
            Color: assetInput.color,
            assetID: assetInput.assetID,
            Size: assetInput.size,
            Owner: ClientID
        };

        const test = await ctx.stub.putPrivateData(assetCollection, assetInput.assetID, Buffer.from(stringify(sortKeysRecursive(asset))))

        console.log("PPPPPPPPPPPPPPPPP- test to debug", test);

        const assetPrivateDetails = {
            ID:             assetInput.assetID,
            AppraisedValue: assetInput.appraisedValue,
        }

        const orgCollection = ClientID + "PrivateCollection";

        const testt = await ctx.stub.putPrivateData(orgCollection, assetInput.assetID, Buffer.from(stringify(sortKeysRecursive(assetPrivateDetails))))

        console.log("OOOOOOOOOOOOOOOOOOO- test to debug", testt);


        // const exists = await this.AssetExists(ctx, id);
        // if (exists) {
        //     throw new Error(`The asset ${id} already exists`);
        // }

        // const asset = {
        //     ID: id,
        //     Color: color,
        //     Size: size,
        //     Owner: owner,
        //     AppraisedValue: appraisedValue,
        // };
        // //we insert data in alphabetic order using 'json-stringify-deterministic' and 'sort-keys-recursive'
        // await ctx.stub.putState(id, Buffer.from(stringify(sortKeysRecursive(asset))));
        // return JSON.stringify(asset);
    }

    // ReadAsset returns the asset stored in the world state with given id.
    async ReadAsset(ctx, id) {
        const assetJSON = await ctx.stub.getState(id); // get the asset from chaincode state
        if (!assetJSON || assetJSON.length === 0) {
            throw new Error(`The asset ${id} does not exist`);
        }
        return assetJSON.toString();
    }

    // UpdateAsset updates an existing asset in the world state with provided parameters.
    async UpdateAsset(ctx, id, color, size, owner, appraisedValue) {
        const exists = await this.AssetExists(ctx, id);
        if (!exists) {
            throw new Error(`The asset ${id} does not exist`);
        }

        // overwriting original asset with new asset
        const updatedAsset = {
            ID: id,
            Color: color,
            Size: size,
            Owner: owner,
            AppraisedValue: appraisedValue,
        };
        // we insert data in alphabetic order using 'json-stringify-deterministic' and 'sort-keys-recursive'
        return ctx.stub.putState(id, Buffer.from(stringify(sortKeysRecursive(updatedAsset))));
    }

    // DeleteAsset deletes an given asset from the world state.
    async DeleteAsset(ctx, id) {
        const exists = await this.AssetExists(ctx, id);
        if (!exists) {
            throw new Error(`The asset ${id} does not exist`);
        }
        return ctx.stub.deleteState(id);
    }

    // AssetExists returns true when asset with given ID exists in world state.
    async AssetExists(ctx, id) {
        const assetJSON = await ctx.stub.getState(id);
        return assetJSON && assetJSON.length > 0;
    }

    // TransferAsset updates the owner field of asset with given id in the world state.
    async TransferAsset(ctx, id, newOwner) {
        const assetString = await this.ReadAsset(ctx, id);
        const asset = JSON.parse(assetString);
        const oldOwner = asset.Owner;
        asset.Owner = newOwner;
        // we insert data in alphabetic order using 'json-stringify-deterministic' and 'sort-keys-recursive'
        await ctx.stub.putState(id, Buffer.from(stringify(sortKeysRecursive(asset))));
        return oldOwner;
    }

    // GetAllAssets returns all assets found in the world state.
    async GetAllAssets(ctx) {
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
            allResults.push(record);
            result = await iterator.next();
        }
        return JSON.stringify(allResults);
    }
}

module.exports = AssetTransfer;
