/**
 * Earnings summary DTO — shapes the summary response for the creator dashboard.
 */
export function toEarningsSummaryDTO(data) {
  return {
    totalEarnings: data.totalEarnings ?? 0,
    thisMonthEarnings: data.thisMonthEarnings ?? 0,
    lastMonthEarnings: data.lastMonthEarnings ?? 0,
    totalPlatformFees: data.totalPlatformFees ?? 0,
    totalSales: data.totalSales ?? 0,
    totalWithdrawn: data.totalWithdrawn ?? 0,
    availableBalance: data.availableBalance ?? 0,
    monthlyBreakdown: (data.monthlyBreakdown || []).map(m => ({
      month: m.month,
      earnings: m.earnings ?? 0,
      orderCount: m.orderCount ?? 0,
    })),
    topTemplates: (data.topTemplates || []).map(t => ({
      templateId: t.templateId,
      title: t.title,
      earnings: t.earnings ?? 0,
      sales: t.sales ?? 0,
    })),
  };
}

/**
 * Single transaction DTO.
 */
export function toTransactionDTO(tx) {
  return {
    orderId: tx.orderId,
    orderNumber: tx.orderNumber,
    buyer: tx.buyer ?? 'Unknown',
    items: (tx.items || []).map(i => ({
      title: i.title,
      price: i.price ?? 0,
      payout: i.payout ?? 0,
    })),
    totalEarnings: tx.totalEarnings ?? 0,
    date: tx.date,
  };
}

/**
 * Transactions list DTO — wraps an array of transactions with pagination.
 */
export function toTransactionsListDTO(data) {
  return {
    transactions: (data.transactions || []).map(toTransactionDTO),
    pagination: data.pagination,
  };
}
