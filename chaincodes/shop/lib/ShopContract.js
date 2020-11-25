'use strict'

const { Contract } = require('fabric-contract-api')

class ShopContract extends Contract {

	// Creates the initial stock with 5 products with ID, Type, Quantity and Price. 
	// Each product of the stock is published in the ledger state.
	async initLedger(ctx) {
		const stock = [
            {
                ID: 'product1',
                Type: 'Shoes',
                Quantity: 20,
                Price: 150
            },
            {
                ID: 'product2',
                Type: 'T-shirt',
                Quantity: 15,
                Price: 40
            },
            {
                ID: 'product3',
                Type: 'Jeans',
                Quantity: 10,
                Price: 60
            },
            {
                ID: 'product4',
                Type: 'Hat',
                Quantity: 5,
                Price: 25
            },
            {
                ID: 'product5',
                Type: 'Gloves',
                Quantity: 0,
                Price: 10
            }
        ]

        for (const product of stock) {
            await ctx.stub.putState(product.ID, Buffer.from(JSON.stringify(product)))
            console.info(`Product ${product.ID} initialized`)
        }
    }
	
	// Creates a product and adds it to the ledger state
	async addProduct(ctx, id, type, quantity, price) {
		const product = {
                ID: id,
                Type: type,
                Quantity: quantity,
                Price: price,
        }
		ctx.stub.putState(id, Buffer.from(JSON.stringify(product)))
        return JSON.stringify(product)
	}
	
	// If the product is available the user will buy it, updating it in the shopâ€™s stock.
	async buyProduct(ctx, id, quantity) {
        let productToBuy = await ctx.stub.getState(id)

		// Checks if the amount required by the customer is available in the stock
		if(!(productToBuy.Quantity - quantity >= 0)) {
			throw new Error(`The product ${id} is not available`)
        }
        
        productToBuy.Quantity -= quantity

        return ctx.stub.putState(id, Buffer.from(JSON.stringify(productToBuy)))
    }
	
	// The user will return back the acquired product, updating the stock adding the refunded quantity
	async refundProduct(ctx, id, quantity) {
        let productToBuy = await ctx.stub.getState(id)
        
        productToBuy.Quantity += quantity 

        return ctx.stub.putState(id, Buffer.from(JSON.stringify(productToBuy)))
    }
}

module.exports = ShopContract