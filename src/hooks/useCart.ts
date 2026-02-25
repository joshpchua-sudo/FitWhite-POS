import { useStore } from '../store/useStore';
import { Product, Bundle, CartItem } from '../types';
import { cartService } from '../services/cartService';

export const useCart = () => {
  const { cart, setCart, discount, discountType } = useStore();

  const addToCart = (product: Product, variantId?: number, variantName?: string) => {
    setCart((prev) => {
      const existing = prev.find(item => item.id === product.id && item.variantId === variantId && !item.isBundle);
      if (existing) {
        return prev.map(item => 
          (item.id === product.id && item.variantId === variantId && !item.isBundle) 
            ? { ...item, quantity: item.quantity + 1 } 
            : item
        );
      }
      return [...prev, { ...product, quantity: 1, variantId, variantName }];
    });
  };

  const addBundleToCart = (bundle: Bundle) => {
    setCart((prev) => {
      const existing = prev.find(item => item.id === bundle.id && item.isBundle);
      if (existing) {
        return prev.map(item => 
          (item.id === bundle.id && item.isBundle) 
            ? { ...item, quantity: item.quantity + 1 } 
            : item
        );
      }
      return [...prev, { 
        id: bundle.id, 
        name: bundle.name, 
        price: bundle.price, 
        quantity: 1, 
        isBundle: true,
        category: 'Bundle',
        stock: 999,
        unit: 'pkg'
      } as CartItem];
    });
  };

  const removeFromCart = (id: number, isBundle?: boolean, variantId?: number) => {
    setCart((prev) => prev.filter(item => !(item.id === id && item.isBundle === isBundle && item.variantId === variantId)));
  };

  const updateQuantity = (id: number, delta: number, isBundle?: boolean, variantId?: number) => {
    setCart((prev) => prev.map(item => {
      if (item.id === id && item.isBundle === isBundle && item.variantId === variantId) {
        return { ...item, quantity: Math.max(1, item.quantity + delta) };
      }
      return item;
    }));
  };

  const subtotal = cartService.calculateSubtotal(cart);
  const discountAmount = cartService.calculateDiscount(subtotal, discount, discountType);
  const total = cartService.calculateTotal(subtotal, discountAmount);

  return {
    cart,
    addToCart,
    addBundleToCart,
    removeFromCart,
    updateQuantity,
    subtotal,
    discountAmount,
    total,
    clearCart: () => setCart([])
  };
};
