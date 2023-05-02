'use strict'
const {PeerRPCClient} = require('grenache-nodejs-http')
const debug = require('debug')('app')
debug.enabled = process.argv.includes('-d')

class Client {
  #maxRetry

  constructor(exchange) {
    this.ex = exchange
    this.rpc = this.initRPC()
    this.#maxRetry = 0
  }

  initRPC() {
    const rpc = new PeerRPCClient(this.ex.link, {})
    rpc.init()
    return rpc
  }

  peerLookup() {
    return new Promise((resolve, reject) => {
      this.ex.link.lookup('order', (err, peers) => {
        if (err) {
          reject(err)
        } else {
          this.#maxRetry = peers && peers.length ? peers.length * 2 : 0
          // TODO: optimize maxRetry to make sure we reach all peers before giving up
          // HotFix: #maxRetry = peers.length * 2
          resolve()
        }
      })
    })
  }

  async sendOrderRequest(order, retries = 0) {
    if (retries == 0) {
      debug(`Submitting order ${order.id} to the network`)
      try {
        await this.peerLookup()
      } catch (err) {
        debug(`ERROR on peer lookup: ${err}`)
        return
      }
    }

    if (retries < this.#maxRetry) {
      this.rpc.request('order', {order: order}, {timeout: 5000}, (err, res) => {
        retries++
        if (err) {
          // Network error try again
          this.sendOrderRequest(order, retries)
          debug(`ERROR on request: ${err}`)
        } else {
          if (!res.match) {
            // No match, try again
            debug('No matching orders found, retrying...')
            this.sendOrderRequest(order, retries)
          } else {
            // Match found
            debug(res)
            debug('Match found!')
          }
          debug(res)
          // TODO: if no match was found retry with another peer
        }
      })
    } else {
      debug(`No match found for ${order.id}`)
    }
  }
}

module.exports = Client
