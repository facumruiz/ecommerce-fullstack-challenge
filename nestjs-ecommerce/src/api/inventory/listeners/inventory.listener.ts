import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { InventoryService } from '../services/inventory.service';
import { InventorySseService } from '../services/inventory-sse.service';
import { OrderCreatedEvent } from '../../../events/order-created.event';
import { InventoryLowStockEvent } from '../../../events/inventory-low-stock.event';

const LOW_STOCK_THRESHOLD = 5;

@Injectable()
export class InventoryListener {
  private readonly logger = new Logger(InventoryListener.name);

  constructor(
    private readonly inventoryService: InventoryService,
    private readonly eventEmitter: EventEmitter2,
    private readonly sseService: InventorySseService,
  ) {}

  @OnEvent('order.created', { async: true })
  async handleOrderCreated(event: OrderCreatedEvent) {
    this.logger.log(`[order.created] orderId=${event.orderId} variationId=${event.productVariationId} qty=${event.quantity}`);

    const updated = await this.inventoryService.decreaseStock(
      event.productVariationId,
      event.countryCode,
      event.quantity,
    );

    this.logger.log(`Stock updated: variationId=${updated.productVariationId} remaining=${updated.quantity}`);

    this.sseService.emit({
      type: 'stock.updated',
      data: {
        productVariationId: updated.productVariationId,
        countryCode: updated.countryCode,
        quantity: updated.quantity,
      },
    });

    if (updated.quantity < LOW_STOCK_THRESHOLD) {
      this.eventEmitter.emit(
        'inventory.low_stock',
        new InventoryLowStockEvent(updated.productVariationId, updated.countryCode, updated.quantity),
      );
    }
  }

  @OnEvent('inventory.low_stock')
  handleLowStock(event: InventoryLowStockEvent) {
    this.logger.warn(`⚠️  LOW STOCK: variationId=${event.productVariationId} country=${event.countryCode} remaining=${event.remainingQuantity}`);

    this.sseService.emit({
      type: 'inventory.low_stock',
      data: {
        productVariationId: event.productVariationId,
        countryCode: event.countryCode,
        remainingQuantity: event.remainingQuantity,
      },
    });
  }
}
