export interface User {
  id: string;
  name: string;
  email: string;
  address?: {
    street: string;
    city: string;
    state: string;
    zip: string;
    country: string;
  };
  role: 'user' | 'admin';
}

export interface Product {
  id: string;
  _id?: string;
  name: string;
  brand: string;
  price: number;
  category: string;
  image: string;
  images?: string[];
  description: string;
  rating?: number;
  stock: number;
  numReviews?: number;
}

export interface Banner {
  id: string;
  _id?: string;
  image: string;
  title: string;
  subtitle: string;
  link?: string;
  color?: string;
  icon?: string;
}

export interface OrderItem {
  name: string;
  quantity: number;
  image: string;
  price: number;
  product: string;
}

export interface Order {
  _id: string;
  user: User;
  orderItems: OrderItem[];
  shippingAddress: {
    address: string;
    city: string;
    postalCode: string;
    country: string;
  };
  paymentMethod: string;
  totalPrice: number;
  isDelivered: boolean;
  createdAt: string;
}
