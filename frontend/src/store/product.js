// frontend/src/store/product.js
import { create } from 'zustand';
import { authFetch } from '../utils/authFetch';

export const useProductStore = create((set) => ({
  products: [],
  setProducts: (products) => set({ products }),

  createProduct: async (newProduct) => {
    if (!newProduct.name || !newProduct.image || !newProduct.price) {
      return { success: false, message: 'Please fill in all fields.' };
    }

    const res = await authFetch('/api/products', {
      method: 'POST',
      body: JSON.stringify(newProduct),
    });

    // If not logged in, redirect to login
    if (res.status === 401) {
      window.location.href = '/login';
      return { success: false, message: 'Please log in first.' };
    }

    const json = await res.json();
    if (!res.ok) {
      return { success: false, message: json.message || 'Server error' };
    }

    set((state) => ({ products: [...state.products, json.data] }));
    return { success: true, message: 'Product created successfully' };
  },

  fetchProducts: async () => {
    try {
      const res = await authFetch('/api/products');

      if (res.status === 401) {
        window.location.href = '/login';
        return { success: false, message: 'Please log in to view products.' };
      }

      if (!res.ok) {
        let errMessage = res.statusText;
        try {
          const errJson = await res.json();
          errMessage = errJson.message || errMessage;
        } catch {}
        throw new Error(errMessage);
      }

      const json = await res.json();
      set({ products: json.data });
      return { success: true, data: json.data };
    } catch (error) {
      console.error('fetchProducts error:', error);
      return { success: false, message: error.message };
    }
  },

  deleteProduct: async (pid) => {
    const res = await authFetch(`/api/products/${pid}`, {
      method: 'DELETE',
    });

    if (res.status === 401) {
      window.location.href = '/login';
      return { success: false, message: 'Please log in to delete products.' };
    }

    const json = await res.json();
    if (!res.ok) {
      return { success: false, message: json.message };
    }

    set((state) => ({
      products: state.products.filter((p) => p._id !== pid),
    }));
    return { success: true, message: json.message };
  },

  updateProduct: async (pid, updatedProduct) => {
    const res = await authFetch(`/api/products/${pid}`, {
      method: 'PUT',
      body: JSON.stringify(updatedProduct),
    });

    if (res.status === 401) {
      window.location.href = '/login';
      return { success: false, message: 'Please log in to update products.' };
    }

    const json = await res.json();
    if (!res.ok) {
      return { success: false, message: json.message };
    }

    set((state) => ({
      products: state.products.map((p) =>
        p._id === pid ? json.data : p
      ),
    }));
    return { success: true, message: 'Updated successfully' };
  },
}));
