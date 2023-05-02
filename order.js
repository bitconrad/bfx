'use strict'
const {v4: uuidv4} = require('uuid')

class Order {
  constructor(side, quantity, pair, price) {
    this.id = uuidv4()
    this.side = side
    this.quantity = quantity
    this.pair = pair
    this.price = price
    this.created = Date.now()
  }
}

module.exports = Order
