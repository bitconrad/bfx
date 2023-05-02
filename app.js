'use strict'
const Exchange = require('./exchange')
const Order = require('./order')
const Trade = require('./trade')

const pairs = ['BTC/USD', 'ETH/USD', 'ETH/BTC']
const bfx = new Exchange(pairs)

const order = new Order('buy', 1, 'BTC/USD', 30000)
const sellOrder1 = new Order('sell', 2, 'BTC/USD', 30000)
const sellOrder2 = new Order('sell', 2, 'BTC/USD', 29900)

bfx.books[order.pair].addOrder(sellOrder1)
bfx.books[order.pair].addOrder(sellOrder2)
const matches = bfx.books[order.pair].match(order)

console.log('Looking for matches for:')
console.log(order)
if (matches.length > 0) {
  if (order.lock()) {
    console.log('Lock acquired, performing trade')
    const trade = new Trade(order, matches)
    console.log('Trade prepared')
    console.log(trade)
    bfx.books[order.pair].execute(trade)
    console.log('Trade executed')
    console.log(trade)
  } else {
    console.log('Order is locked, cannot trade')
  }
} else {
  console.log('No matches found')
}
