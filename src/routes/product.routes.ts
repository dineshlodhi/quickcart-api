import { Router } from 'express';
import type { ProductController } from '../controllers/product.controller.js';

// Routes define URL-to-handler mappings. No business logic here.
// The controller is injected as a parameter, keeping routes decoupled.

export function createProductRouter(controller: ProductController): Router {
  const router = Router();

  router.get('/search', controller.search);
  router.get('/category/:category', controller.getByCategory);
  router.get('/', controller.getAll);
  router.get('/:id', controller.getById);
  router.post('/', controller.create);
  router.patch('/:id', controller.update);
  router.delete('/:id', controller.delete);

  return router;
}
