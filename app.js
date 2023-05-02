'use strict'
const Order = require('./order')
const OrderBook = require('./orderbook')
const orderbook = new OrderBook('BTC/USD')

const buyOrder = new Order('buy', 1, 'BTC/USD', 30000)
const sellOrder1 = new Order('sell', 2, 'BTC/USD', 30000)
const sellOrder2 = new Order('sell', 2, 'BTC/USD', 29900)
orderbook.addOrder(sellOrder1)
orderbook.addOrder(sellOrder2)
const matches = orderbook.match(buyOrder)

console.log('Looking for matches for:')
console.log(buyOrder)
if (matches.length > 0) {
  console.log('Found matches:')
  console.log(matches)
} else {
  console.log('No matches found')
}
