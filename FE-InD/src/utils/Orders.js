const ORDER_STORAGE_KEY = 'orders';

export const getOrders = () => {
  try {
    return JSON.parse(localStorage.getItem(ORDER_STORAGE_KEY) || '[]');
  } catch {
    return [];
  }
};

export const getOrderById = (orderId) => {
  return getOrders().find((order) => order.id === orderId);
};

export const saveOrder = (order) => {
  const orders = getOrders();
  const nextOrders = [order, ...orders];
  localStorage.setItem(ORDER_STORAGE_KEY, JSON.stringify(nextOrders));
  return nextOrders;
};

export const updateOrder = (orderId, patch) => {
  const orders = getOrders();
  const nextOrders = orders.map((order) =>
    order.id === orderId ? { ...order, ...patch } : order
  );
  localStorage.setItem(ORDER_STORAGE_KEY, JSON.stringify(nextOrders));
  return nextOrders;
};
