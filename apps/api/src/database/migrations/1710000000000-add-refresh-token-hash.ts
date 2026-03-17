import { type MigrationInterface, type QueryRunner } from 'typeorm';

export class AddRefreshTokenHash1710000000000 implements MigrationInterface {
  name = 'AddRefreshTokenHash1710000000000';

  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "refresh_token_hash" character varying(255)`,
    );
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "users" DROP COLUMN IF EXISTS "refresh_token_hash"`,
    );
  }
}
