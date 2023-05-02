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

  match(order) {
    const orders = order.side == 'buy' ? this.sellOrders : this.buyOrders
    return orders.filter((o) => o.price <= order.price)
  }
}

module.exports = OrderBook
