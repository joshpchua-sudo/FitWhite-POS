import { CartItem } from '../types';

export const cartService = {
  calculateSubtotal(cart: CartItem[]): number {
    return cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  },

  calculateDiscount(subtotal: number, discount: number, type: 'fixed' | 'percent'): number {
    if (type === 'percent') {
      return subtotal * (discount / 100);
    }
    return discount;
  },

  calculateTotal(subtotal: number, discountAmount: number): number {
    return Math.max(0, subtotal - discountAmount);
  }
};
