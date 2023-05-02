'use strict'

class OrderBook {
  constructor(tradingPair) {
    this.tradingPair = tradingPair
    this.buyOrders = []
    this.sellOrders = []
  }

  addOrder(order) {
    if (order.side == 'buy') {
      this.addBuyOrder(order)
    } else {
      this.addSellOrder(order)
    }
  }

  addBuyOrder(order) {
    this.buyOrders.push(order)
    //sort descending since higher bids are more attractive for sellers
    this.buyOrders.sort((a, b) => b.price - a.price)
  }

  addSellOrder(order) {
    this.sellOrders.push(order)
    // sort ascending since lower asks are more attractive for buyers
    this.sellOrders.sort((a, b) => a.price - b.price)
  }

  match(order) {
    const orders = order.side == 'buy' ? this.sellOrders : this.buyOrders
    return orders.filter((o) => o.price <= order.price)
  }
}

module.exports = OrderBook
