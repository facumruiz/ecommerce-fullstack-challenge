export class InventoryLowStockEvent {
  constructor(
    public readonly productVariationId: number,
    public readonly countryCode: string,
    public readonly remainingQuantity: number,
  ) {}
}
