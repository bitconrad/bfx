'use strict'
const OrderBook = require('./orderbook')

class Exchange {
  constructor(pairs) {
    this.books = {}
    this.initBooks(pairs)
  }

  initBooks(pairs) {
    if (Array.isArray(pairs) && pairs.length > 0) {
      pairs.forEach((pair) => {
        this.books[pair] = new OrderBook(pair)
      })
    }
  }
}

module.exports = Exchange
