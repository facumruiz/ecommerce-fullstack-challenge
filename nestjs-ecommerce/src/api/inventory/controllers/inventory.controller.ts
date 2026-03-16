import { Controller, Get, Param, Res, UseGuards } from '@nestjs/common';
import { Response } from 'express';
import { InventoryService } from '../services/inventory.service';
import { InventorySseService } from '../services/inventory-sse.service';
import { AuthGuard } from '../../auth/guards/auth.guard';

@Controller('inventory')
export class InventoryController {
  constructor(
    private readonly inventoryService: InventoryService,
    private readonly sseService: InventorySseService,
  ) {}

  @UseGuards(AuthGuard)
  @Get()
  getAll() {
    return this.inventoryService.getAllStock();
  }

  @UseGuards(AuthGuard)
  @Get(':variationId/:countryCode')
  getStock(
    @Param('variationId') variationId: string,
    @Param('countryCode') countryCode: string,
  ) {
    return this.inventoryService.getStock(+variationId, countryCode);
  }

  @Get('events')
  streamEvents(@Res() res: Response) {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.flushHeaders();

    const subscription = this.sseService.getEvents().subscribe((event) => {
      res.write(`data: ${JSON.stringify(event)}\n\n`);
    });

    res.on('close', () => {
      subscription.unsubscribe();
    });
  }
}
