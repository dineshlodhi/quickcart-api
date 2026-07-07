import { Router } from 'express';
import type { OrderController } from '../controllers/order.controller.js';

export function createOrderRouter(controller: OrderController): Router {
  const router = Router();

  router.post('/', controller.create);
  router.get('/', controller.getAll);
  router.get('/:id', controller.getById);

  return router;
}
