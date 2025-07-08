import { create } from "zustand";
import { getCartByUser } from "@/services/customer/shoppingCar";
import { jwtDecode } from "jwt-decode";

export const useCartStore = create((set) => ({
  cartCount: 0,
  refreshCart: async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return set({ cartCount: 0 });
      const decoded = jwtDecode(token);
      const userId = decoded.sub ? parseInt(decoded.sub, 10) : null;
      if (!userId) return set({ cartCount: 0 });
      const cartData = await getCartByUser(userId);
      const items = Array.isArray(cartData?.data) ? cartData.data : [];
      const total = items.reduce((sum, item) => sum + (Number(item.quantity) || 0), 0);
      set({ cartCount: total });
    } catch {
      set({ cartCount: 0 });
    }
  }
})); 