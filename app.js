'use strict'
const Exchange = require('./exchange')
const Order = require('./order')

const pairs = ['BTC/USD', 'ETH/USD', 'ETH/BTC']
const bfx = new Exchange(pairs)

const generateRandomOrder = () => {
  const price = Math.floor(Math.random() * 1000)
  const amount = 1 + Math.floor(Math.random() * 1000)
  const side = Math.random() > 0.5 ? 'buy' : 'sell'
  const order = new Order(side, amount, 'BTC/USD', price)
  bfx.newOrder(order)
}
// Create a new random order every 5 seconds
setInterval(generateRandomOrder, 5000)
