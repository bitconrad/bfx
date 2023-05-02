'use strict'
const {PeerRPCServer} = require('grenache-nodejs-http')
const debug = require('debug')('app')
debug.enabled = process.argv.includes('-d')

const Trade = require('./trade')

class Server {
  constructor(exchange) {
    this.ex = exchange
    this.rpc = this.initRPC()
    this.orderService = this.initService()
    this.processedOrders = []

    setInterval(() => {
      this.ex.link.announce('order', this.orderService.port, {})
    }, 1000)

    this.orderService.on('request', this.orderHandler)
  }

  initRPC() {
    const rpc = new PeerRPCServer(this.ex.link, {timeout: 5000})
    rpc.init()
    return rpc
  }

  initService() {
    const port = 1024 + Math.floor(Math.random() * 1000)
    const service = this.rpc.transport('server')
    service.listen(port)
    return service
  }

  orderHandler = (rid, key, payload, handler) => {
    const order = payload.order
    const res = {
      match: false,
      trade: {}
    }
    // TODO: Auth check
    // TODO: check if order is valid (amount, price, etc)
    if (order && order.id && !this.processedOrders.includes(order.id)) {
      // add it to processed orders to avoid double processing
      this.processedOrders.push(order.id)
      // TODO: add TTL to processed orders
      debug('Remote order request received')
      debug(order)
      // Look for a match
      if (!this.ex.books[order.pair]) {
        debug('Book not found for pair ' + order.pair)
      } else {
        const matches = this.ex.books[order.pair].match(order)
        res.match = matches.length > 0
        if (res.match) {
          const trade = new Trade(order, matches)
          this.ex.trades.push(trade)
          res.trade = trade
        }
      }
    }
    handler.reply(null, res)
  }
}

module.exports = Server
