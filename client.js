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
          //debug(`ERROR on request: ${err}`)
        } else if (!res.match) {
          // No match, try again
          debug('No matching orders found, retrying...')
          this.sendOrderRequest(order, retries)
        } else if (
          res.trade &&
          res.trade.peerId &&
          res.trade.peerId != this.ex.peerId
        ) {
          // A different peer has a matching order
          try {
            // lock order to avoid race condition
            if (order.lock()) {
              // Send trade request
              debug('Match found, performing trade...')
              this.sendTradeRequest(order, res.trade)
            }
          } catch (err) {
            debug(err)
          }
        }
      })
    } else {
      debug(`No match found for ${order.id}`)
    }
  }

  sendTradeRequest(order, trade) {
    this.rpc.request(
      'peer_' + trade.peerId,
      trade.id,
      {timeout: 5000},
      (err, res) => {
        if (err) {
          // Network error
          // TODO: check with the peer if the order was executed or not
          //       and then update remaining quantity and unlock
          order.unlock()
          debug(err)
        } else {
          // Order executed update remaining quantity and unlock
          debug(`Order ${order.id} is ${trade.status}`)
          debug(trade)
          order.quantity = trade.remaining
          order.unlock()
          debug(res)
        }
      }
    )
  }
}

module.exports = Client
