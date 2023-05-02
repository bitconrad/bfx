'use strict'
const {v4: uuidv4} = require('uuid')

class Order {
  constructor(side, quantity, pair, price) {
    this.id = uuidv4()
    this.side = side
    this.quantity = quantity
    this.pair = pair
    this.price = price
    this.locked = false
    this.created = Date.now()
  }

  lock() {
    if (this.isLocked()) {
      // cannot lock an already locked order
      return false
    } else {
      this.locked = true
      return true
    }
  }

  unlock() {
    this.locked = false
  }

  isLocked() {
    return this.locked
  }
}

module.exports = Order
