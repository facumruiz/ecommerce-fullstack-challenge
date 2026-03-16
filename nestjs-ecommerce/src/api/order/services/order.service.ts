import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Order } from '../../../database/entities/order.entity';
import { CreateOrderDto } from '../dto/create-order.dto';
import { OrderCreatedEvent } from '../../../events/order-created.event';

@Injectable()
export class OrderService {
  constructor(
    @InjectRepository(Order)
    private readonly orderRepo: Repository<Order>,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async createOrder(dto: CreateOrderDto, userId: number): Promise<Order> {
    const order = this.orderRepo.create({ ...dto, userId });
    const saved = await this.orderRepo.save(order);

    this.eventEmitter.emit(
      'order.created',
      new OrderCreatedEvent(saved.id, saved.productVariationId, saved.quantity, saved.countryCode),
    );

    return saved;
  }

  async getOrders(userId: number) {
    return this.orderRepo.find({ where: { userId } });
  }
}
