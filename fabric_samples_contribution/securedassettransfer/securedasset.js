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

const { createHash, subtle } = require('crypto');
const sha256 = require('js-sha256');

const assetState = {
    typeAssetForSale: 'S',
    typeAssetBid: 'B',
    typeAssetSaleReceipt: 'SR',
    typeAssetBuyReceipt: "BR"
};


class PrivateAssetTransfer extends Contract {

    // CreateAsset creates an asset and sets it as owned by the client's org
    async CreateAsset(ctx, assetID, publicDescription) {
    
        // Get the new asset from transient map
        const transientMap = await ctx.stub.getTransient();

        // Asset properties are private, therefore they get passed in transient field, instead of func args
        const immutablePropertiesJSON = transientMap.get("asset_properties");
        if (!immutablePropertiesJSON) {
            throw new Error('The asset was not found in the transient map input.');
        }

        let assetInput = JSON.parse(immutablePropertiesJSON);

        // Get client org id and verify it matches peer org id.
        // In this scenario, client is only authorized to read/write private data from its own peer.
        const clientOrgID = await this.getClientOrgID(ctx, true);

        const asset = {
            ObjectType: "asset",
            ID: assetID,
            OwnerOrg: clientOrgID,
            publicDescription: publicDescription
        }

        await ctx.stub.putState(asset.ID, Buffer.from(stringify(sortKeysRecursive(asset))))
            
        // Set the endorsement policy such that an owner org peer is required to endorse future updates
        await this.setAssetStateBasedEndorsement(ctx, asset.ID, clientOrgID);
        

        // Persist private immutable asset properties to owner's private data collection
        const collection = this.buildCollectionName(clientOrgID);
        await ctx.stub.putPrivateData(collection, asset.ID, Buffer.from(stringify(sortKeysRecursive(assetInput))));

    }

    // ReadAsset returns the public asset data
    async ReadAsset(ctx, assetID){
        // Since only public data is accessed in this function, no access control is required
        const assetJSON = await ctx.stub.getState(assetID);
        const asset = assetJSON.toString();

        //No Asset found, return empty response
        if (!asset) {
            throw new Error(`${assetID} does not exist in collection.`);
        }

        return asset;
    }

    // GetAssetPrivateProperties returns the immutable asset properties from owner's private data collection
    async GetAssetPrivateProperties(ctx, assetID){
        // In this scenario, client is only authorized to read/write private data from its own peer.
        const collection = await this.getClientImplicitCollectionName(ctx);

        const immutablePropertiesJSON = await ctx.stub.getPrivateData(collection, assetID);

        if (!immutablePropertiesJSON) {
            throw new Error(`asset private details does not exist in client org's collection: ${assetID}`);
        }

        return immutablePropertiesJSON.toString();
    }

    // ChangePublicDescription updates the assets public description. Only the current owner can update the public description
    async ChangePublicDescription(ctx, assetID, newDescription){
	    // No need to check client org id matches peer org id, rely on the asset ownership check instead.
        const clientOrgID = await this.getClientOrgID(ctx, false);

        const assetJSON = await this.ReadAsset(ctx, assetID);
        const asset = JSON.parse(assetJSON);
        console.log("hhhh", asset);

	    // Auth check to ensure that client's org actually owns the asset
        if(clientOrgID != asset.OwnerOrg){
            throw Error(`A client from ${clientOrgID} cannot update the description of a asset owned by ${asset.OwnerOrg}.`)
        }

        asset.publicDescription = newDescription;

        console.log("hhhh", asset);
        console.log("KKKKKKK", assetJSON);
        console.log("llllllll", Buffer.from(JSON.stringify(sortKeysRecursive(asset))));

        // it doesnt work and i dont know why
        await ctx.stub.putState(assetID, Buffer.from(JSON.stringify(sortKeysRecursive(asset))));


    }

    // AgreeToSell adds seller's asking price to seller's implicit private data collection
    async AgreeToSell(ctx, assetID){
        // No need to check client org id matches peer org id, rely on the asset ownership check instead.
        const clientOrgID = await this.getClientOrgID(ctx, false);

        const assetJSON = await this.ReadAsset(ctx, assetID);
        const asset = JSON.parse(assetJSON);

        // Verify that this clientOrgId actually owns the asset.
        if(clientOrgID != asset.OwnerOrg){
            throw Error(`A client from ${clientOrgID} cannot update the description of a asset owned by ${asset.OwnerOrg}.`)
        }

        return await this.agreeToPrice(ctx, assetID, assetState.typeAssetForSale)

    }

    // agreeToPrice adds a bid or ask price to caller's implicit private data collection
    async agreeToPrice(ctx, assetID, priceType) {
    
        // Get client org id and verify it matches peer org id.
        // In this scenario, client is only authorized to read/write private data from its own peer.
        const clientOrgID = await this.getClientOrgID(ctx, true);

        // Get the new asset from transient map
        const transientMap = await ctx.stub.getTransient();

        // Asset price must be retrieved from the transient field as they are private
        const price = transientMap.get("asset_price");
        if (!price) {
            throw new Error('The asset_price was not found in the transient map input.');
        }

        // Persist private immutable asset properties to owner's private data collection
        const collection = this.buildCollectionName(clientOrgID);

        // Persist the agreed to price in a collection sub-namespace based on priceType key prefix,
        // to avoid collisions between private asset properties, sell price, and buy price
        let assetPriceKey = await ctx.stub.createCompositeKey(priceType, [assetID]);

        // The Price hash will be verified later, therefore always pass and persist price bytes as is,
        // so that there is no risk of nondeterministic marshaling.
        await ctx.stub.putPrivateData(collection, assetPriceKey, Buffer.from(stringify(sortKeysRecursive(price))));

    }

    // VerifyAssetProperties  Allows a buyer to validate the properties of
    // an asset against the owner's implicit private data collection
    async VerifyAssetProperties(ctx, assetID) {
    
        // Get the new asset from transient map
        const transientMap = await ctx.stub.getTransient();

        // Asset properties are private, therefore they get passed in transient field, instead of func args
        const immutablePropertiesJSON = transientMap.get("asset_properties");
        if (!immutablePropertiesJSON) {
            throw new Error('The asset was not found in the transient map input.');
        }

        console.log("YYYYYYYYYYYYYYyimmutablePropertiesJSON", immutablePropertiesJSON.toString());


        const assetTest = JSON.parse(immutablePropertiesJSON.toString())

        console.log("OOOOOOOOOOOOOOOOOooyimmutablePropertiesJSON", Buffer.from(stringify(sortKeysRecursive(assetTest))));
        console.log("MMMMMMMMMMMMMMMMMMMMMMyimmutablePropertiesJSON", stringify(sortKeysRecursive(assetTest)));

        const assetJSON = await this.ReadAsset(ctx, assetID);
        const asset = JSON.parse(assetJSON);

        const collectionOwner = this.buildCollectionName(asset.OwnerOrg);

        const immutablePropertiesOnChainHash = await ctx.stub.getPrivateDataHash(collectionOwner, assetID);
        
        if (!immutablePropertiesOnChainHash) {
            throw Error(`asset private properties hash does not exist: ${assetID}.`)
        }
        console.log("PPPPPPPPPPPPPPPPPimmutablePropertiesOnChainHash", immutablePropertiesOnChainHash.toString());

        const calculatedPropertiesHash = sha256(stringify(sortKeysRecursive(assetTest)));

        console.log("xxxxxxxxxxxxcalculatedPropertiesHash", Buffer.from(calculatedPropertiesHash));
        console.log("xxxxxxxxxxxxcalculatedPropertiesHash", calculatedPropertiesHash);
        console.log("xxxxxxxxxxxxcalculatedPropertiesHash", calculatedPropertiesHash.toString());


    }

    // AgreeToBuy adds buyer's bid price to buyer's implicit private data collection
    async AgreeToBuy(ctx, assetID){
        this.agreeToPrice(ctx, assetID, assetState.typeAssetBid)
    }

    // GetAssetSalesPrice returns the sales price
    async GetAssetSalesPrice(ctx, assetID){
        this.getAssetPrice(ctx, assetID, assetState.typeAssetBid);
    }

    async getAssetPrice(ctx, assetID, priceType){
        const collection = await this.getClientImplicitCollectionName(ctx);
        let assetPriceKey = await ctx.stub.createCompositeKey(priceType, [assetID]);
        const price = await ctx.stub.getPrivateData(collection, assetPriceKey);
        console.log("_______________________________", price);
        console.log("_______________________________", price.toString());
        return price;
    }


    async hash(string) {
        const utf8 = new TextEncoder().encode(string);
        const hashBuffer = await subtle.digest('SHA-256', utf8);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        const hashHex = hashArray
          .map((bytes) => bytes.toString(16).padStart(2, '0'))
          .join('');
        return hashHex;
    }

    buildCollectionName(clientOrgID){
        return `_implicit_org_${clientOrgID}`;
    }

    async getClientImplicitCollectionName(ctx){
        const clientOrgID = await this.getClientOrgID(ctx, true);
        await this.verifyClientOrgMatchesPeerOrg(ctx, clientOrgID);
        return this.buildCollectionName(clientOrgID);
    }

    // setAssetStateBasedEndorsement adds an endorsement policy to a asset so that only a peer from an owning org
    // can update or transfer the asset.
    async setAssetStateBasedEndorsement(ctx, assetID, orgToEndorse){
        await ctx.stub.setStateValidationParameter(assetID, Buffer.from(`OR('${orgToEndorse}.client','${orgToEndorse}.admin','${orgToEndorse}.member'`));
    }


    // getClientOrgID gets the client org ID.
    // The client org ID can optionally be verified against the peer org ID, to ensure that a client
    // from another org doesn't attempt to read or write private data from this peer.
    // The only exception in this scenario is for TransferAsset, since the current owner
    // needs to get an endorsement from the buyer's peer.
    async getClientOrgID(ctx, verifyOrg){

        const clientOrgID = await ctx.clientIdentity.getMSPID();

        if (!clientOrgID && clientOrgID === '') {
            throw new Error("Failed getting the client's orgID.");
        }

        if (verifyOrg) {
            await this.verifyClientOrgMatchesPeerOrg(ctx, clientOrgID);
        }

        return clientOrgID;
    }

    // verifyClientOrgMatchesPeerOrg is an internal function used verify client org id and matches peer org id.
    async verifyClientOrgMatchesPeerOrg(ctx, clientOrgID){

        const peerOrgID = await ctx.stub.getMspID();
        if (!peerOrgID && peerOrgID === '') {
            throw new Error("Failed getting the peer's MSPID.");
        }

        if (clientOrgID !== peerOrgID) {
            throw new Error(`Client from org ${clientOrgID} is not authorized to read or write private data from an org ${peerOrgID} peer.`);
        }
    }





}

module.exports = PrivateAssetTransfer;
