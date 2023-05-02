'use strict'
const {v4: uuidv4} = require('uuid')

class Trade {
  constructor(order, matches) {
    this.id = uuidv4()
    this.order = order
    this.matches = matches
    this.status = 'pending'
    this.executed = 0
    this.remaining = order.quantity
  }
}

module.exports = Trade
