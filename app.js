'use strict'
const Exchange = require('./exchange')
const Order = require('./order')

const pairs = ['BTC/USD', 'ETH/USD', 'ETH/BTC']
const bfx = new Exchange(pairs)

const order = new Order('buy', 3, 'BTC/USD', 30000)
const sellOrder1 = new Order('sell', 2, 'BTC/USD', 30000)
const sellOrder2 = new Order('sell', 2, 'BTC/USD', 29900)

bfx.newOrder(sellOrder1)
bfx.newOrder(sellOrder2)
bfx.newOrder(order)
