'use strict'
const Order = require('./order')
const OrderBook = require('./orderbook')
const Trade = require('./trade')
const orderbook = new OrderBook('BTC/USD')

const order = new Order('buy', 1, 'BTC/USD', 30000)
const sellOrder1 = new Order('sell', 2, 'BTC/USD', 30000)
const sellOrder2 = new Order('sell', 2, 'BTC/USD', 29900)
orderbook.addOrder(sellOrder1)
orderbook.addOrder(sellOrder2)
const matches = orderbook.match(order)

console.log('Looking for matches for:')
console.log(order)
if (matches.length > 0) {
  if (order.lock()) {
    console.log('Lock acquired, performing trade')
    const trade = new Trade(order, matches)
    console.log('Trade prepared')
    console.log(trade)
    orderbook.execute(trade)
    console.log('Trade executed')
    console.log(trade)
  } else {
    console.log('Order is locked, cannot trade')
  }
} else {
  console.log('No matches found')
}
