'use strict'
const {PeerRPCServer} = require('grenache-nodejs-http')
const debug = require('debug')('app')
debug.enabled = process.argv.includes('-d')

class Server {
  constructor(link) {
    this.link = link
    this.rpc = this.initRPC()
    this.orderService = this.initService()

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
    debug('Remote order request received')
    debug(payload)
    // send mockup response
    const res = {
      match: false,
      matches: []
    }
    handler.reply(null, res)
  }
}

module.exports = Server
