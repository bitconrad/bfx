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
    this.tradeService = this.initService()
    this.processedOrders = []

    setInterval(() => {
      this.ex.link.announce('order', this.orderService.port, {})
      this.ex.link.announce(
        'peer_' + this.ex.peerId,
        this.tradeService.port,
        {}
      )
    }, 1000)

    this.orderService.on('request', this.orderHandler)
    this.tradeService.on('request', this.tradeHandler)
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
      this.addProcessedOrder(order.id)
      debug('Remote order request received')
      //debug(order)
      // Look for a match
      if (!this.ex.books[order.pair]) {
        debug('Book not found for pair ' + order.pair)
      } else {
        const matches = this.ex.books[order.pair].match(order)
        res.match = matches.length > 0
        if (res.match) {
          const trade = new Trade(this.ex.peerId, order, matches)
          this.ex.trades.push(trade)
          res.trade = trade
          debug(`Found a match for order ${order.id} creating trade ${trade.id}`)
          debug(res)
        }
      }
    }
    handler.reply(null, res)
  }

  tradeHandler = (rid, key, tradeId, handler) => {
    debug(`Trade request received`)
    const trade = this.ex.trades.find((trade) => trade.id == tradeId)
    if (trade && trade.order.pair) {
      this.ex.books[trade.order.pair].execute(trade)
      handler.reply(null, trade)
      debug(`Trade ${tradeId} executed`)
      debug(trade)
    } else {
      debug(`Trade ${tradeId} cancelled to prevent race condition`)
      handler.reply(null, [])
    }
  }

  addProcessedOrder(orderId) {
    this.processedOrders.push(orderId)
    // Remove from processedOrders after TTL (10 seconds) to keep the array clean
    setTimeout(() => {
      const index = this.processedOrders.indexOf(orderId)
      if (index != -1) {
        this.processedOrders.splice(index, 1)
      }
    }, 10000)
  }

}

module.exports = Server
