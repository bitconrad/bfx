'use strict'
const {v4: uuidv4} = require('uuid')

class Order {
  #lockTimeout

  constructor(side, quantity, pair, price) {
    this.id = uuidv4()
    this.side = side
    this.quantity = quantity
    this.pair = pair
    this.price = price
    this.locked = false
    this.created = Date.now()
    this.#lockTimeout = null
  }

  lock() {
    if (this.isLocked()) {
      // cannot lock an already locked order
      return false
    } else {
      this.locked = true
      // unlock after 10 seconds in case of an issue so it can be reprocessed
      this.#lockTimeout = setTimeout(() => {
        this.unlock()
      }, 10000)
      return true
    }
  }

  unlock() {
    clearTimeout(this.#lockTimeout)
    this.locked = false
  }

  isLocked() {
    return this.locked
  }
}

module.exports = Order
