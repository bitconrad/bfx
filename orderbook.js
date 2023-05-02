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

  execute(trade) {
    if (
      trade.order &&
      trade.order.quantity > 0 &&
      trade.matches &&
      trade.matches.length > 0
    ) {
      for (let i = 0; i < trade.matches.length; i++) {
        // Check if the matched order is locked before executing
        if (!trade.matches[i].isLocked()) {
          continue
        }

        // If remaining quantity is greater than the matched order, execute the full matched order
        let executed = 0
        if (trade.remaining > trade.matches[i].quantity) {
          executed = trade.matches[i].quantity
        } else {
          executed = trade.remaining
        }

        // Update the remaining quantity of the orders and the trade
        trade.order.quantity -= executed
        trade.matches[i].quantity -= executed
        trade.remaining -= executed
        trade.executed += executed

        // Unlock the matched order and remove it from the order book if fully executed
        trade.matches[i].unlock()
        if (trade.remaining == 0) {
          break
        }
      }
      trade.updateStatus()
    }
  }
}

module.exports = OrderBook
