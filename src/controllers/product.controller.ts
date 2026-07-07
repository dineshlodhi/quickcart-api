import type { Request, Response, NextFunction } from 'express';
import type { ProductService } from '../services/product.service.js';
import type { CreateProductInput, UpdateProductInput } from '../models/product.model.js';
import { successResponse } from '../utils/helpers.js';

// Controllers are thin: they parse the request, call the service, and format the response.
// No business logic belongs here — that lives in the service layer.

export class ProductController {
  // Constructor injection: the service is passed in, not instantiated here.
  constructor(private readonly productService: ProductService) {}

  // Each handler is an arrow function to preserve `this` context
  // when passed as a callback to Express routes.

  getAll = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const products = await this.productService.getAllProducts();
      res.json(successResponse(products));
    } catch (error) {
      next(error);
    }
  };

  // Typing Request<{ id: string }> tells TypeScript that req.params.id is a string.
  // Without this, Express defaults params to string | string[], causing type errors.
  getById = async (req: Request<{ id: string }>, res: Response, next: NextFunction): Promise<void> => {
    try {
      const product = await this.productService.getProductById(req.params.id);
      res.json(successResponse(product));
    } catch (error) {
      next(error);
    }
  };

  // Request body is typed as CreateProductInput — TypeScript ensures
  // only the expected fields are accessed.
  create = async (
    req: Request<object, object, CreateProductInput>,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const product = await this.productService.createProduct(req.body);
      res.status(201).json(successResponse(product, 'Product created'));
    } catch (error) {
      next(error);
    }
  };

  // Partial<Product> for the body — matches PATCH semantics.
  update = async (
    req: Request<{ id: string }, object, UpdateProductInput>,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const product = await this.productService.updateProduct(req.params.id, req.body);
      res.json(successResponse(product, 'Product updated'));
    } catch (error) {
      next(error);
    }
  };

  delete = async (req: Request<{ id: string }>, res: Response, next: NextFunction): Promise<void> => {
    try {
      await this.productService.deleteProduct(req.params.id);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  };

  search = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const query = (req.query.q as string) || '';
      const products = await this.productService.searchProducts(query);
      res.json(successResponse(products));
    } catch (error) {
      next(error);
    }
  };

  getByCategory = async (req: Request<{ category: string }>, res: Response, next: NextFunction): Promise<void> => {
    try {
      const products = await this.productService.getProductsByCategory(req.params.category);
      res.json(successResponse(products));
    } catch (error) {
      next(error);
    }
  };
}
