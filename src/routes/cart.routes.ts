import { Router } from 'express';
import type { CartController } from '../controllers/cart.controller.js';

export function createCartRouter(controller: CartController): Router {
  const router = Router();

  router.get('/', controller.getCart);
  router.post('/items', controller.addItem);
  router.patch('/items/:productId', controller.updateQuantity);
  router.delete('/items/:productId', controller.removeItem);

  return router;
}
