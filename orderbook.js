'use strict'

class OrderBook {
  constructor(tradingPair) {
    this.tradingPair = tradingPair
    this.buyOrders = []
    this.sellOrders = []
  }

  addOrder(order) {
    if (order.side == 'buy') {
      this.buyOrders.push(order)
    } else {
      this.sellOrders.push(order)
    }
  }
}

module.exports = OrderBook
