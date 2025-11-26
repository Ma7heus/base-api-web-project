import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateUserTable1764129775690 implements MigrationInterface {
  name = 'CreateUserTable1764129775690';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "users" (
      "id" SERIAL NOT NULL,
      "name" character varying(100) NOT NULL,
      "login" character varying(50) NOT NULL,
      "password" character varying(255) NOT NULL,
      "email" character varying(255) NOT NULL,
      "role" character varying NOT NULL DEFAULT 'USER',
      "created_at" TIMESTAMP NOT NULL DEFAULT now(),
      "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
      CONSTRAINT "UQ_2d443082eccd5198f95f2a36e2c" UNIQUE ("login"),
      CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY ("id"))`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "users"`);
  }
}
