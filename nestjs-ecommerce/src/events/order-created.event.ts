export class OrderCreatedEvent {
  constructor(
    public readonly orderId: number,
    public readonly productVariationId: number,
    public readonly quantity: number,
    public readonly countryCode: string,
  ) {}
}
