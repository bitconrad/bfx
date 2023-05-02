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

  updateStatus() {
    if (this.remaining == 0) {
      this.status = 'filled'
    } else if (this.executed > 0) {
      this.status = 'partially filled'
    } else {
      this.status = 'pending'
    }
  }
}

module.exports = Trade
