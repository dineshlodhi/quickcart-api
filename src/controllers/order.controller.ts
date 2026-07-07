import type { Request, Response, NextFunction } from 'express';
import type { OrderService } from '../services/order.service.js';
import { successResponse } from '../utils/helpers.js';

export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  create = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const order = await this.orderService.createOrder();
      res.status(201).json(successResponse(order, 'Order placed successfully'));
    } catch (error) {
      next(error);
    }
  };

  getAll = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const orders = await this.orderService.getAllOrders();
      res.json(successResponse(orders));
    } catch (error) {
      next(error);
    }
  };

  getById = async (req: Request<{ id: string }>, res: Response, next: NextFunction): Promise<void> => {
    try {
      const order = await this.orderService.getOrderById(req.params.id);
      res.json(successResponse(order));
    } catch (error) {
      next(error);
    }
  };
}
