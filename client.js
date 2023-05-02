'use strict'
const {PeerRPCClient} = require('grenache-nodejs-http')
const debug = require('debug')('app')
debug.enabled = process.argv.includes('-d')

class Client {
  constructor(link) {
    this.link = link
    this.rpc = this.initRPC(link)
  }

  initRPC(link) {
    const rpc = new PeerRPCClient(link, {})
    rpc.init()
    return rpc
  }

  sendOrderRequest(order) {
    this.rpc.request('order', {order: order}, {timeout: 5000}, (err, res) => {
      if (err) {
        // Network error
        // TODO: try again
        debug(`ERROR on request: ${err}`)
      } else {
        // TODO: look for a match and return it
        debug(res)
      }
    })
  }
}

module.exports = Client
