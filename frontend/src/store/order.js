import { create } from "zustand";
import { authFetch } from "../utils/authFetch";

export const useOrderStore = create((set) => ({
  orders: [],
  setOrders: (orders) => set({ orders }),

  fetchOrders: async () => {
    try {
      const res = await authFetch("/api/orders");
      if (!res.ok) throw new Error("Failed to fetch orders");
      const { data } = await res.json();
      set({ orders: data });
      return { success: true, data };
    } catch (error) {
      console.error("Error in fetchOrders:", error);
      return { success: false, message: error.message };
    }
  },

  createOrder: async (orderData) => {
    try {
      const res = await authFetch("/api/orders", {
        method: "POST",
        body: JSON.stringify(orderData),
      });
      if (!res.ok) {
        const { message } = await res.json();
        throw new Error(message);
      }
      const { data } = await res.json();
      set((state) => ({ orders: [...state.orders, data] }));
      return { success: true, data };
    } catch (error) {
      console.error("Error in createOrder:", error);
      return { success: false, message: error.message };
    }
  },

  // ← New cancelOrder action
  cancelOrder: async (orderId) => {
    try {
      const res = await authFetch(`/api/orders/${orderId}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        const { message } = await res.json();
        throw new Error(message);
      }
      const { message } = await res.json();
      // Remove from local state
      set((state) => ({
        orders: state.orders.filter((o) => o._id !== orderId),
      }));
      return { success: true, message };
    } catch (error) {
      console.error("Error in cancelOrder:", error);
      return { success: false, message: error.message };
    }
  },
}));
