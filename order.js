'use strict'

class Order {
  constructor(side, quantity, pair, price) {
    this.side = side
    this.quantity = quantity
    this.pair = pair
    this.price = price
  }
}

module.exports = Order
