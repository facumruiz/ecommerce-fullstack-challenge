import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Inventory } from '../../../database/entities/inventory.entity';

@Injectable()
export class InventoryService {
  constructor(
    @InjectRepository(Inventory)
    private readonly inventoryRepo: Repository<Inventory>,
  ) {}

  async getStock(productVariationId: number, countryCode: string) {
    const record = await this.inventoryRepo.findOne({
      where: { productVariationId, countryCode },
    });
    if (!record) throw new NotFoundException('Inventory record not found');
    return record;
  }

  async initStock(productVariationId: number, countryCode: string, quantity: number) {
    const existing = await this.inventoryRepo.findOne({
      where: { productVariationId, countryCode },
    });
    if (existing) return existing;

    const record = this.inventoryRepo.create({ productVariationId, countryCode, quantity });
    return this.inventoryRepo.save(record);
  }

  async decreaseStock(productVariationId: number, countryCode: string, quantity: number): Promise<Inventory> {
    const record = await this.inventoryRepo.findOne({
      where: { productVariationId, countryCode },
    });
    if (!record) throw new NotFoundException('Inventory record not found');
    if (record.quantity < quantity) throw new Error('Insufficient stock');

    await this.inventoryRepo.update(
      { productVariationId, countryCode },
      { quantity: () => `quantity - ${quantity}` },
    );

    return this.inventoryRepo.findOne({ where: { productVariationId, countryCode } });
  }

  async getAllStock() {
    return this.inventoryRepo.find();
  }
}
