import { config } from 'dotenv';
import { resolve } from 'path';
import { getEnvPath } from '../../common/helper/env.helper';
import { DataSourceOptions } from 'typeorm';
import { User } from '../entities/user.entity';
import { Role } from '../entities/role.entity';
import { Product } from '../entities/product.entity';
import { Category } from '../entities/category.entity';
import { Inventory } from '../entities/inventory.entity';
import { ProductVariation } from '../entities/productVariation.entity';
import { ProductVariationPrice } from '../entities/productVariation_price.entity';
import { Color } from '../entities/color.entity';
import { Size } from '../entities/size.entity';
import { Country } from '../entities/country.entity';
import { Currency } from '../entities/currency.entity';
import { Order } from '../entities/order.entity';

const envFilePath: string = getEnvPath(
  resolve(__dirname, '../..', 'common/envs'),
);
config({ path: envFilePath });

export const dataSourceOptions: DataSourceOptions = {
  type: 'postgres',
  host: process.env.DATABASE_HOST,
  port: parseInt(process.env.DATABASE_PORT, 10),
  database: process.env.DATABASE_NAME,
  username: process.env.DATABASE_USER,
  password: process.env.DATABASE_PASSWORD,
  ssl: process.env.DATABASE_SSL === 'true' ? { rejectUnauthorized: false } : false,
  entities: [
    User, Role, Product, Category, Inventory,
    ProductVariation, ProductVariationPrice,
    Color, Size, Country, Currency, Order,
  ],
  migrations: ['dist/database/migration/history/*.js'],
  logger: 'simple-console',
  synchronize: false,
  logging: true,
};
