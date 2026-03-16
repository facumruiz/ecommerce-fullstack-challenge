import { IsInt, IsString, Min, Length } from 'class-validator';

export class CreateOrderDto {
  @IsInt()
  productVariationId: number;

  @IsInt()
  @Min(1)
  quantity: number;

  @IsString()
  @Length(2, 7)
  countryCode: string;
}
