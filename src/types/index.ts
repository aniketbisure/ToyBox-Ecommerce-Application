export interface Address {
  id: string;
  label?: string;
  street: string;
  city: string;
  state: string;
  zip: string;
  country: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  phoneNumbers?: string[];
  addresses?: Address[];
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
  isPaid?: boolean;
  status: 'PENDING' | 'PAID' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED' | 'REFUNDED';
  isDelivered: boolean;
  createdAt: string;
}

export interface Review {
  id: string;
  product: string;
  rating: number;
  date: string;
  comment: string;
}

export interface PaymentMethod {
  id: string;
  name: string;
  icon: string;
  last4: string;
}
