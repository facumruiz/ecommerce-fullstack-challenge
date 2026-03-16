import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { Inventory } from '../../database/entities/inventory.entity';
import { InventoryService } from './services/inventory.service';
import { InventoryController } from './controllers/inventory.controller';
import { InventoryListener } from './listeners/inventory.listener';
import { InventorySseService } from './services/inventory-sse.service';
import { UserModule } from '../user/user.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Inventory]),
    JwtModule,
    UserModule,
  ],
  controllers: [InventoryController],
  providers: [InventoryService, InventoryListener, InventorySseService],
  exports: [InventoryService, InventorySseService],
})
export class InventoryModule {}
