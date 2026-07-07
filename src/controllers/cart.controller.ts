import type { Request, Response, NextFunction } from 'express';
import type { CartService } from '../services/cart.service.js';
import type { AddToCartInput, UpdateCartItemInput } from '../models/cart.model.js';
import { successResponse } from '../utils/helpers.js';

export class CartController {
  constructor(private readonly cartService: CartService) {}

  getCart = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const cart = await this.cartService.getCart();
      res.json(successResponse(cart));
    } catch (error) {
      next(error);
    }
  };

  addItem = async (
    req: Request<object, object, AddToCartInput>,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const cart = await this.cartService.addItem(req.body);
      res.status(201).json(successResponse(cart, 'Item added to cart'));
    } catch (error) {
      next(error);
    }
  };

  updateQuantity = async (
    req: Request<{ productId: string }, object, UpdateCartItemInput>,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const cart = await this.cartService.updateItemQuantity(
        req.params.productId,
        req.body
      );
      res.json(successResponse(cart, 'Cart updated'));
    } catch (error) {
      next(error);
    }
  };

  removeItem = async (
    req: Request<{ productId: string }>,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const cart = await this.cartService.removeItem(req.params.productId);
      res.json(successResponse(cart, 'Item removed from cart'));
    } catch (error) {
      next(error);
    }
  };
}
