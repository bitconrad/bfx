'use strict'
const debug = require('debug')('app')
debug.enabled = process.argv.includes('-d')

const {v4: uuidv4} = require('uuid')
const Link = require('grenache-nodejs-link')

const Server = require('./server')
const Client = require('./client')
const OrderBook = require('./orderbook')
const Trade = require('./trade')

class Exchange {
  constructor(pairs) {
    this.peerId = uuidv4()
    debug(`Peer id: ${this.peerId}`)

    this.books = {}
    this.initBooks(pairs)

    if (this.link = this.initLink()) {
      this.server = new Server(this)
      this.client = new Client(this)
    }
  }

  initLink() {
    const link = new Link({
      grape: 'http://127.0.0.1:30001'
    })
    link.start()
    return link
  }

  newServer(link) {
    return new Server(link)
  }

  newClient(link) {
    return new Client(link)
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
      } else {
        // no local match found check if there is a match in the network
        this.client.sendOrderRequest(order)
      }
    }
  }
}

module.exports = Exchange
