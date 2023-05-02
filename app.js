'use strict'
const Order = require('./order')
const OrderBook = require('./orderbook')
const orderbook = new OrderBook('BTC/USD')

const buyOrder = new Order('buy', 1, 'BTC/USD', 30000)
const sellOrder = new Order('sell', 1, 'BTC/USD', 31000)
orderbook.addOrder(buyOrder)
orderbook.addOrder(sellOrder)
console.log(orderbook)
