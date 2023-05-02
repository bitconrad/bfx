'use strict'
const OrderBook = require('./orderbook')
const Trade = require('./trade')

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

  newOrder(order) {
    console.log('New order created')
    console.log(order)
    if (!order.pair || !this.books[order.pair]) {
      console.log(`Book not found for pair ${order.pair}`)
    } else {
      this.books[order.pair].addOrder(order)
      const matches = this.books[order.pair].match(order)
      if (matches.length > 0) {
        if (order.lock()) {
          console.log(`Found matching orders for ${order.id}`)
          console.log('Lock acquired, performing trade')
          const trade = new Trade(order, matches)
          console.log('Trade prepared')
          console.log(trade)
          this.books[order.pair].execute(trade)
          console.log('Trade executed')
          console.log(trade)
        } else {
          console.log(
            `Order ${order.id} is already locked, cancelling to avoid a race condition`
          )
        }
      }
    }
  }
}

module.exports = Exchange
