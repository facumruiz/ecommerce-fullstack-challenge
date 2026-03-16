import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { Order } from '../../database/entities/order.entity';
import { OrderService } from './services/order.service';
import { OrderController } from './controllers/order.controller';
import { UserModule } from '../user/user.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Order]),
    JwtModule,
    UserModule,
  ],
  controllers: [OrderController],
  providers: [OrderService],
})
export class OrderModule {}
