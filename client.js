'use strict'
const {PeerRPCClient} = require('grenache-nodejs-http')
const debug = require('debug')('app')
debug.enabled = process.argv.includes('-d')

class Client {
  constructor(link) {
    this.link = link
    this.rpc = this.initRPC(link)
    this.maxRetry = 10 // TODO: make this dynamic based on peer count
  }

  initRPC(link) {
    const rpc = new PeerRPCClient(link, {})
    rpc.init()
    return rpc
  }

  sendOrderRequest(order, retries = 0) {
    if (retries < this.maxRetry) {
      this.rpc.request('order', {order: order}, {timeout: 5000}, (err, res) => {
        retries++
        if (err) {
          // Network error
          // TODO: try again
          this.sendOrderRequest(order, retries)
          debug(`ERROR on request: ${err}`)
        } else {
          // TODO: look for a match and return it
          debug(res)
        }
      })
    } else {
      debug(`No match found for ${order.id}`)
    }
  }
}

module.exports = Client
