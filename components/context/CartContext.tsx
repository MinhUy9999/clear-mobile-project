import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import axios from 'axios';

// ------------  Định nghĩa kiểu dữ liệu -------------
export interface Product {
  _id: string;
  title: string;
  brand?: string;
  price: number;
  category?: string;
  color?: string;
  thumb?: string;
  quantity?: number;
  sold?: number;
  totalRatings?: number;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

// Kiểu dữ liệu cho context
interface CartContextProps {
  cart: CartItem[];
  fetchCartFromServer: () => Promise<void>;
  addToCart: (product: Product, quantity?: number) => Promise<void>;
  removeFromCart: (productId: string) => Promise<void>;
  updateCartItem: (productId: string, newQuantity: number) => Promise<void>;
  clearCart: () => Promise<void>;
}

// Tạo context
const CartContext = createContext<CartContextProps | undefined>(undefined);

// Custom hook
export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}

// -----------------------------------------------

/**
 * Provider bọc quanh App để chia sẻ state giỏ hàng
 * Giả sử backend có các endpoint:
 * GET    /api/cart       => Lấy giỏ hàng
 * POST   /api/cart       => Thêm item
 * PATCH  /api/cart       => Cập nhật số lượng
 * DELETE /api/cart/:id   => Xóa 1 item
 * DELETE /api/cart       => Clear toàn bộ
 */
// ...existing code...
export const CartProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Lấy giỏ hàng từ server
  const fetchCartFromServer = async () => {
    try {
      const response = await axios.get('/user/cart');
      // Giả sử response.data = { success: boolean, cart: CartItem[] }
      if (response.data?.success) {
        setCart(response.data.cart || []);
        setError(null); // Clear any previous errors
      }
    } catch (error) {
      // console.error('Error fetching cart from server:', error);
      setError('Error fetching cart from server. Please try again later.');
    }
  };
// ...existing code...

  // Thêm sản phẩm vào giỏ
  const addToCart = async (product: Product, quantity = 1) => {
    try {
      // Gọi API thêm item
      await axios.post('/api/cart', { productId: product._id, quantity });

      // Sau khi thêm thành công, fetch lại giỏ
      await fetchCartFromServer();
    } catch (error) {
      console.error('Error adding to cart:', error);
    }
  };

  // Xóa 1 item khỏi giỏ
  const removeFromCart = async (productId: string) => {
    try {
      // Giả sử API xóa item là: DELETE /api/cart/:id
      await axios.delete(`/api/cart/${productId}`);
      // fetch lại giỏ
      await fetchCartFromServer();
    } catch (error) {
      console.error('Error removing from cart:', error);
    }
  };

  // Cập nhật số lượng 1 item trong giỏ
  const updateCartItem = async (productId: string, newQuantity: number) => {
    try {
      // Giả sử API PATCH /api/cart => { productId, quantity }
      await axios.patch('/api/cart', {
        productId,
        quantity: newQuantity,
      });
      // fetch lại giỏ
      await fetchCartFromServer();
    } catch (error) {
      console.error('Error updating cart item:', error);
    }
  };

  // Clear toàn bộ giỏ
  const clearCart = async () => {
    try {
      await axios.delete('/api/cart'); 
      setCart([]); // Xóa local
    } catch (error) {
      console.error('Error clearing cart:', error);
    }
  };

  // Lấy giỏ hàng khi vào app (nếu muốn)
  useEffect(() => {
    fetchCartFromServer();
  }, []);

  // Trả về context
  return (
    <CartContext.Provider
      value={{
        cart,
        fetchCartFromServer,
        addToCart,
        removeFromCart,
        updateCartItem,
        clearCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};
