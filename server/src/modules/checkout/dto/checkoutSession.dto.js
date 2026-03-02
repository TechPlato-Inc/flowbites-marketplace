export function toCheckoutSessionDTO(result) {
  return {
    sessionUrl: result.sessionUrl,
    orderId: result.orderId?.toString() || null,
    serviceOrderId: result.serviceOrderId?.toString() || null,
    demoMode: result.demoMode || false,
  };
}
