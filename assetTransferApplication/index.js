const { Wallets, DefaultEventHandlerStrategies, Gateway } = require('fabric-network')
const path = require('path')
const fs = require('fs')
const yaml = require('js-yaml')

const networkPath = path.resolve(__dirname, '../test-network')
let connProfiles = {
    'suppliera.quotation.com': 'connection-org1.yaml',
    'supplierb.quotation.com': 'connection-org2.yaml',
    'agency.quotation.com': 'connection-org3.yaml'
}

let finalConnection = {}

class FabNetwork {

    constructor() { }


    /**
     * Method for creating a user identity related to an organization interacting with the network
     *
     * @param {String} walletIdentity | wallet identity label 
     * @param {String} organization | organization domain
     * @param {String} orgMspId | organizazion MSP ID
     */
    static async createIdentity(walletIdentity, organization, orgMspId) {
        try {
            const walletPath = path.resolve(__dirname, `./identities/${walletIdentity}/wallet`)

            //Create new wallet
            //...

            const userExists = await wallet.get(walletIdentity)
            if (userExists) {
                console.log(`WARN: An identity for the client user "${walletIdentity}" already exists in the wallet`)
            }

            //get credentials (certificate and private key) from the peer organization folder
            organization = organization.toLowerCase()
            const credPath = path.join(networkPath, `/organizations/peerOrganizations/${organization}/users/User1@${organization}`)
            const certificate = fs.readFileSync(path.join(credPath, `/msp/signcerts/User1@${organization}-cert.pem`)).toString()
            const privateKey = fs.readFileSync(path.join(credPath, '/msp/keystore/priv_sk')).toString()

            //Create the identity object
            //... 

            //Push the identity in the wallet 
            //...
        } catch (err) {
            console.log(err)
        }
    }

    /**
     * Method for creating the connection with the blockchain
     *
     * @param {*} walletIdentity | wallet identity label 
     * @param {*} organization | organization domain
     */
    static async createConnection(walletIdentity, organization) {
        try {
            const walletPath = path.resolve(__dirname, `./identities/${walletIdentity}/wallet`)
            const wallet = await Wallets.newFileSystemWallet(walletPath)

            //get the connection profile file
            const connFile = connProfiles[organization]
            const connOrgPath = path.join(networkPath, `/organizations/peerOrganizations/${organization}/${connFile}`)
            const connectionProfile = yaml.safeLoad(fs.readFileSync(connOrgPath, 'utf8'))

            //Create the connection option object
            //...

            //Save connection profile and option in a global object 
            finalConnection = { connectionProfile, connectionOptions }

        } catch (err) {
            console.log(err)
        }
    }

    /**
     * Method for sending a transaction
     * @param {String} channel 
     * @param {String} transactionName 
     * @param {Array} transactionParams 
     */
    static async submitT(channel, transactionName, transactionParams) {
        try {
            // Instantiate the gateway
            const gateway = new Gateway()

            //Connect the gateway to the network
            //...

            //Connect to the channel where the caincode is deployed
            //...

            // get the chaincode (assetTransfer) from the network
            //...

            const listener = async (event) => {
                const asset = JSON.parse(event.payload.toString())

                console.log(`-- Contract Event Received: ${event.eventName} - ${JSON.stringify(asset)}`)

                console.log(`*** Event: ${event.eventName}:${asset.ID}`)

                const eventTransaction = event.getTransactionEvent()
                console.log(`*** transaction: ${eventTransaction.transactionId} status:${eventTransaction.status}`)

                const eventBlock = eventTransaction.getBlockEvent()
                console.log(`*** block: ${eventBlock.blockNumber.toString()}`)
            }

            //Start the client side event service and register the listener
            console.log(`--> Start contract event stream to peer in Org1`)
            // ...

            // submit transaction
            let resp = null
            if (!transactionParams || transactionParams === '') {
                resp = await contract.submitTransaction(transactionName)
            }
            else {
                resp = await contract.submitTransaction(transactionName, ...transactionParams)
            }

            gateway.disconnect()
            console.log(resp.toString())
            contract.removeContractListener(listener)

            return resp

        } catch (err) {
            console.log(err)
        }
    }

}

module.exports = FabNetwork
