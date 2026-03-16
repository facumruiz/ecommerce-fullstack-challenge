import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { OrderService } from '../services/order.service';
import { CreateOrderDto } from '../dto/create-order.dto';
import { AuthGuard } from '../../auth/guards/auth.guard';
import { CurrentUser } from '../../auth/guards/user.decorator';

@Controller('orders')
@UseGuards(AuthGuard)
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @Post()
  create(@Body() dto: CreateOrderDto, @CurrentUser('id') userId: number) {
    return this.orderService.createOrder(dto, userId);
  }

  @Get()
  getMyOrders(@CurrentUser('id') userId: number) {
    return this.orderService.getOrders(userId);
  }
}
