'use strict';

const { Contract } = require('fabric-contract-api')

class AssetTransfer extends Contract {

    async initLedger(ctx) {

        const Job = {
            Title: "jobtitle",
            StartDate: "01.01.2010",
            EndDate: "01.01.2011"

        };

        const Education = {
            Title: "University of CSVs",
            StartDate: "01.01.2005",
            EndDate: "31.12.2009",
            Grade: 3.0,
        };

        const CV = {
            FirstName: 'Mark',
            LastName: 'Red',
            PreviousJobs: [Job],
            Education: [Education],
        };

        const Application = {
            ID: 'applicant1',
            status: 'received Application',
            Jobtitle: 'Designer',
            CV: CV
        };

        // example of how to write to world state deterministically
        await ctx.stub.putState(Application.ID, Buffer.from(JSON.stringify(Application)));
    }


    // CreateAsset issues a new asset to the world state with given details.
    async createAsset(ctx, id, firstname, lastname, appliedjob, jobtitle, jobstart, jobend, educationtitle, educationstart, educationend, grade) {
        const exists = await this.assetExists(ctx, id);
        if (exists) {
            throw new Error(`The asset ${id} already exists`);
        }

        const Job = {
            Title: jobtitle,
            StartDate: jobstart,
            EndDate: jobend

        };

        const Education = {
            Title: educationtitle,
            StartDate: educationstart,
            EndDate: educationend,
            Grade: grade,
        };

        const CV = {
            FirstName: firstname,
            LastName: lastname,
            PreviousJobs: [Job],
            Education: [Education],


        };

        const Application = {
            ID: id,
            status: 'received Application',
            Jobtitle: appliedjob,
            CV: CV
        };

        const assetBuffer = Buffer.from(JSON.stringify(Application));
        ctx.stub.setEvent('CreateAsset', assetBuffer);

        await ctx.stub.putState(id, assetBuffer);
        return JSON.stringify(Application);
    }



    // UpdateAsset updates an existing asset in the world state with provided parameters.
    async updateAsset(ctx, id, appliedjob) {
        const exists = await this.assetExists(ctx, id);
        if (!exists) {
            throw new Error(`The asset ${id} does not exist`);
        }
        const rawAsset = await ctx.stub.getState(id);
        const Application = JSON.parse(rawAsset.toString());
        Application.CV.Jobtitle = appliedjob;
        const assetBuffer = Buffer.from(JSON.stringify(Application));
        ctx.stub.setEvent('UpdateAsset', assetBuffer);
        return ctx.stub.putState(id, assetBuffer);
    }

    // DeleteAsset deletes an given asset from the world state.
    async deleteAsset(ctx, id) {
        const exists = await this.assetExists(ctx, id);
        if (!exists) {
            throw new Error(`The asset ${id} does not exist`);
        }
        const asset = await ctx.stub.getState(id);
        const assetBuffer = Buffer.from(JSON.stringify(asset));
        ctx.stub.setEvent('DeleteAsset', assetBuffer);
        return ctx.stub.deleteState(id);
    }

    // AssetExists returns true when asset with given ID exists in world state.
    async assetExists(ctx, id) {
        const assetJSON = await ctx.stub.getState(id);
        return assetJSON && assetJSON.length > 0;
    }

    // TransferAsset updates the owner field of asset with given id in the world state.
    async transferAsset(ctx, id, newOwner) {
        const rawAsset = await ctx.stub.getState(id);
        const asset = JSON.parse(rawAsset.toString());
        const oldOwner = asset.status;
        asset.Owner = newOwner;

        //Missing Asset Transfer
        const assetBuffer = Buffer.from(JSON.stringify(asset));

        ctx.stub.setEvent('TransferAsset', assetBuffer);
        ctx.stub.putState(id, assetBuffer);
        return oldOwner;
    }

    //Not tested
    // TransferAsset updates the owner field of asset with given id in the world state.
    async acceptreject(ctx, id, accept) {
        const rawAsset = await ctx.stub.getState(id);
        const asset = JSON.parse(rawAsset.toString());
        asset.status = "accept";
        if (accept == 0) {
            asset.status = "reject";
        }
        //Missing Asset Transfer
        const assetBuffer = Buffer.from(JSON.stringify(asset));

        ctx.stub.setEvent('Accept/Reject', assetBuffer);
        ctx.stub.putState(id, assetBuffer);
        //return oldOwner;
    }

    // WORKS
    // GetAllAssets returns all assets found in the world states
    async getAllAssets(ctx) {
        const allResults = [];
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

module.exports = AssetTransfer

