'use strict'
const debug = require('debug')('app')
debug.enabled = process.argv.includes('-d')

const {v4: uuidv4} = require('uuid')

const OrderBook = require('./orderbook')
const Trade = require('./trade')

class Exchange {
  constructor(pairs) {
    this.peerId = uuidv4()
    debug(`Peer id: ${this.peerId}`)

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
    debug('New order created')
    debug(order)
    if (!order.pair || !this.books[order.pair]) {
      debug(`Book not found for pair ${order.pair}`)
    } else {
      this.books[order.pair].addOrder(order)
      const matches = this.books[order.pair].match(order)
      if (matches.length > 0) {
        if (order.lock()) {
          debug(`Found matching orders for ${order.id}`)
          debug('Lock acquired, performing trade')
          const trade = new Trade(order, matches)
          debug('Trade prepared')
          debug(trade)
          this.books[order.pair].execute(trade)
          debug('Trade executed')
          debug(trade)
        } else {
          debug(
            `Order ${order.id} is already locked, cancelling to avoid a race condition`
          )
        }
      }
    }
  }
}

module.exports = Exchange
