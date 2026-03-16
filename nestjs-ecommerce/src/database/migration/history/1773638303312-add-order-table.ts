import { MigrationInterface, QueryRunner } from "typeorm";

export class AddOrderTable1773638303312 implements MigrationInterface {
    name = 'AddOrderTable1773638303312'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."order_status_enum" AS ENUM('PENDING', 'CONFIRMED', 'CANCELLED')`);
        await queryRunner.query(`CREATE TABLE "order" ("id" SERIAL NOT NULL, "userId" integer NOT NULL, "productVariationId" integer NOT NULL, "quantity" integer NOT NULL, "countryCode" character varying(7) NOT NULL, "status" "public"."order_status_enum" NOT NULL DEFAULT 'PENDING', "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_1031171c13130102495201e3e20" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "order" ADD CONSTRAINT "FK_caabe91507b3379c7ba73637b84" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "order" ADD CONSTRAINT "FK_8fd11142f0566426633a503479b" FOREIGN KEY ("productVariationId") REFERENCES "product_variation"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "order" DROP CONSTRAINT "FK_8fd11142f0566426633a503479b"`);
        await queryRunner.query(`ALTER TABLE "order" DROP CONSTRAINT "FK_caabe91507b3379c7ba73637b84"`);
        await queryRunner.query(`DROP TABLE "order"`);
        await queryRunner.query(`DROP TYPE "public"."order_status_enum"`);
    }

}
