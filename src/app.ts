import express from 'express';

// ── Middleware ─────────────────────────────────────
import { requestLogger } from './middleware/request-logger.js';
import { notFoundHandler } from './middleware/not-found.js';
import { globalErrorHandler } from './middleware/error-handler.js';

// ── Repositories ──────────────────────────────────
import { ProductRepository } from './repositories/product.repository.js';
import { OrderRepository } from './repositories/order.repository.js';

// ── Services ──────────────────────────────────────
import { ProductService } from './services/product.service.js';
import { CartService } from './services/cart.service.js';
import { OrderService } from './services/order.service.js';

// ── Controllers ───────────────────────────────────
import { ProductController } from './controllers/product.controller.js';
import { CartController } from './controllers/cart.controller.js';
import { OrderController } from './controllers/order.controller.js';

// ── Routes ────────────────────────────────────────
import { createProductRouter } from './routes/product.routes.js';
import { createCartRouter } from './routes/cart.routes.js';
import { createOrderRouter } from './routes/order.routes.js';

// ── Helpers ───────────────────────────────────────
import { successResponse } from './utils/helpers.js';
import config from './config/index.js';

import fs from 'fs';
import path from 'path';

// Read package.json to get the version
const pkgPath = path.join(process.cwd(), 'package.json');
const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf-8'));

// ────────────────────────────────────────────────────
// Composition Root
// ────────────────────────────────────────────────────
// All dependencies are wired together here in one place.
// This is manual dependency injection — simple and explicit.

export function createApp(): express.Application {
  const app = express();

  // ── Global Middleware ───────────────────────────
  app.use(express.json());
  app.use(requestLogger);

  // ── Dependency Wiring ──────────────────────────
  const productRepo = new ProductRepository();
  const orderRepo = new OrderRepository();

  const productService = new ProductService(productRepo);
  const cartService = new CartService(productRepo);
  const orderService = new OrderService(orderRepo, productRepo, cartService);

  const productController = new ProductController(productService);
  const cartController = new CartController(cartService);
  const orderController = new OrderController(orderService);

  // ── Health Endpoint ─────────────────────────────
  // In production, cloud platforms ping this endpoint to verify the app is alive.
  // Returning version and environment helps verify successful deployments.
  app.get('/health', (_req: express.Request, res: express.Response) => {
    res.json(successResponse({
      status: 'healthy',
      appName: config.appName,
      version: pkg.version,
      uptime: process.uptime(),
      environment: config.env,
      timestamp: new Date().toISOString(),
      processId: process.pid,
    }));
  });

  // ── API Routes ──────────────────────────────────
  app.use('/products', createProductRouter(productController));
  app.use('/cart', createCartRouter(cartController));
  app.use('/orders', createOrderRouter(orderController));

  // ── Error Handling (must be registered last) ────
  app.use(notFoundHandler);
  app.use(globalErrorHandler);

  return app;
}
