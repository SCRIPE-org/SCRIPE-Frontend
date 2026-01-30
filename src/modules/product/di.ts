import { getCoreContainer } from '@/core/di';
import { ProductRepository } from './src/data/repositories/ProductRepository';

// Initialize Module Container
// In a real app, this might be a class or a more complex setup
// For now, we manually wire dependencies

const { notificationService } = getCoreContainer();

const productRepository = new ProductRepository(notificationService);

export const productContainer = {
      productRepository
};

export function getProductContainer() {
      return productContainer;
}
