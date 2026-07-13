import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import Product from '../models/Product';
import User from '../models/User';

dotenv.config();

const PRODUCTS = [
  {
    name: 'Teddy Bear',
    description: 'Soft and cuddly plush teddy bear, perfect for kids of all ages.',
    price: 1299.00,
    listPrice: 1599.00,
    subCategory: 'Plush Animals',
    productType: 'Soft Toy',
    brand: 'ToyBox Originals',
    manufacturer: 'ToyBox Manufacturing',
    sku: 'TB-PLUSH-001',
    countryOfOrigin: 'India',
    minimumAge: 0,
    image: 'https://images.unsplash.com/photo-1559454403-b8fb88521f11?auto=format&fit=crop&q=80&w=400',
    rating: 4.8,
    stock: 50
  },
  {
    name: 'LEGO Castle',
    description: 'Build your own medieval castle with this 500-piece LEGO set.',
    price: 2499.00,
    listPrice: 2999.00,
    subCategory: 'Building Sets',
    productType: 'Construction Toy',
    brand: 'LEGO',
    manufacturer: 'The LEGO Group',
    sku: 'TB-LEGO-002',
    countryOfOrigin: 'Denmark',
    minimumAge: 72,
    image: 'https://images.unsplash.com/photo-1585366119957-e556f403e4d7?auto=format&fit=crop&q=80&w=400',
    rating: 4.9,
    stock: 20
  },
  {
    name: 'Remote Control Car',
    description: 'High-speed RC car with durable tires and long-range remote.',
    price: 3500.00,
    listPrice: 4200.00,
    subCategory: 'RC Vehicles',
    productType: 'Electronic Toy',
    brand: 'Speedster',
    manufacturer: 'RC Pro Industries',
    sku: 'TB-RC-003',
    countryOfOrigin: 'China',
    minimumAge: 96,
    image: 'https://images.unsplash.com/photo-1594787318286-3d835c1d207f?auto=format&fit=crop&q=80&w=400',
    rating: 4.5,
    stock: 15
  },
  {
    name: 'Wooden Train Set',
    description: 'Eco-friendly wooden train tracks and engine for creative play.',
    price: 1850.00,
    listPrice: 2200.00,
    subCategory: 'Wooden Toys',
    productType: 'Train Set',
    brand: 'NaturePlay',
    manufacturer: 'EcoToys Ltd',
    sku: 'TB-WOOD-004',
    countryOfOrigin: 'Germany',
    minimumAge: 36,
    image: 'https://images.unsplash.com/photo-1531608139434-1912ae0713cd?auto=format&fit=crop&q=80&w=400',
    rating: 4.7,
    stock: 30
  },
];

const seedDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/toybox');
    console.log('🌱 Connected to DB for seeding...');

    // Clear existing data
    await Product.deleteMany({});
    await User.deleteMany({});
    console.log('🗑️ Existing data cleared');

    // Seed Products
    await Product.insertMany(PRODUCTS);
    console.log('✅ Products seeded successfully');

    // Seed Admin User
    const adminHashedPassword = await bcrypt.hash('admin123', 10);
    await User.create({
      name: 'Admin User',
      email: 'admin@toybox.com',
      password: adminHashedPassword,
      role: 'admin'
    });
    console.log('👑 Admin user created (Email: admin@toybox.com, Password: admin123)');

    // Seed Test User
    const hashedPassword = await bcrypt.hash('password123', 10);
    await User.create({
      name: 'Aniket Test',
      email: 'test@example.com',
      password: hashedPassword,
      role: 'user'
    });
    console.log('👤 Test user created (Email: test@example.com, Password: password123)');

    process.exit();
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  }
};

seedDB();
