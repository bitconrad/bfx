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
    let remaining = order.quantity
    let orders = []
    let result = []

    if (order.side == 'buy') {
      orders = this.sellOrders.filter(
        (o) => o.price <= order.price && !o.isLocked()
      )
    } else {
      orders = this.buyOrders.filter(
        (o) => o.price >= order.price && !o.isLocked()
      )
    }

    for (let i = 0; i < orders.length; i++) {
      const o = orders[i]
      if (remaining <= 0) {
        break
      }
      remaining -= o.quantity
      if (o.lock()) {
        // if lock is successful, add to matching orders
        result.push(o)
      }
    }
    return result
  }
}

module.exports = OrderBook
