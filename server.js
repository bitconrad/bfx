'use strict'
const {PeerRPCServer} = require('grenache-nodejs-http')
const debug = require('debug')('app')
debug.enabled = process.argv.includes('-d')

class Server {
  constructor(link) {
    this.link = link
    this.rpc = this.initRPC()
    this.orderService = this.initService()
    this.processedOrders = []

    setInterval(() => {
      this.link.announce('order', this.orderService.port, {})
    }, 1000)

    this.orderService.on('request', this.orderHandler)
  }

  initRPC() {
    const rpc = new PeerRPCServer(this.link, {timeout: 5000})
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
      matches: []
    }
    // TODO: Auth check
    // TODO: check if order is valid (amount, price, etc)
    if (order && order.id && !this.processedOrders.includes(order.id)) {
      // add it to processed orders to avoid double processing
      this.processedOrders.push(order.id)
      debug('Remote order request received')
      debug(order)
      // TODO: look for match and return it
    }
    handler.reply(null, res)
  }
}

module.exports = Server
