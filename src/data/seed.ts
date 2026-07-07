import { v4 as uuidv4 } from 'uuid';
import type { Product } from '../models/product.model.js';
import { productStore } from './store.js';

// Seed data provides realistic starting state for development.
// Each product satisfies the Product interface — TypeScript verifies
// every field is present and correctly typed at compile time.
const seedProducts: Product[] = [
  {
    id: uuidv4(),
    name: 'Organic Bananas',
    description: 'Fresh organic bananas, bunch of 6',
    category: 'fruits',
    price: 45,
    stock: 100,
    imageUrl: 'https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e',
    isAvailable: true,
  },
  {
    id: uuidv4(),
    name: 'Amul Toned Milk',
    description: '500ml toned milk packet',
    category: 'dairy',
    price: 27,
    stock: 200,
    imageUrl: 'https://images.unsplash.com/photo-1563636619-e9143da7973b',
    isAvailable: true,
  },
  {
    id: uuidv4(),
    name: 'Fresh Spinach',
    description: '250g pack of baby spinach',
    category: 'vegetables',
    price: 35,
    stock: 80,
    imageUrl: 'https://images.unsplash.com/photo-1576045057995-568f588f82fb',
    isAvailable: true,
  },
  {
    id: uuidv4(),
    name: 'Lay\'s Classic Chips',
    description: 'Classic salted potato chips, 52g',
    category: 'snacks',
    price: 20,
    stock: 150,
    imageUrl: 'https://images.unsplash.com/photo-1566478989037-eec170784d0b',
    isAvailable: true,
  },
  {
    id: uuidv4(),
    name: 'Coca-Cola 300ml',
    description: 'Chilled Coca-Cola bottle',
    category: 'beverages',
    price: 40,
    stock: 120,
    imageUrl: 'https://images.unsplash.com/photo-1554866585-cd94860890b7',
    isAvailable: true,
  },
  {
    id: uuidv4(),
    name: 'Vim Dishwash Liquid',
    description: '500ml lemon fresh dishwash gel',
    category: 'household',
    price: 99,
    stock: 60,
    imageUrl: 'https://images.unsplash.com/photo-1585421514284-efb74c2b69ba',
    isAvailable: false,
  },
];

export function seedDatabase(): void {
  for (const product of seedProducts) {
    productStore[product.id] = product;
  }
  console.log(`🌱 Seeded ${seedProducts.length} products`);
}
