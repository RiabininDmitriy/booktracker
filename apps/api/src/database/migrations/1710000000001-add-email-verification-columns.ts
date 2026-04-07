import { type MigrationInterface, type QueryRunner } from 'typeorm';

export class AddEmailVerificationColumns1710000000001 implements MigrationInterface {
  name = 'AddEmailVerificationColumns1710000000001';

  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "pending_email" character varying(255)`);
    await queryRunner.query(
      `ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "email_verification_token" character varying(255)`,
    );
    await queryRunner.query(`ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "email_verified_at" timestamp`);
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN IF EXISTS "email_verified_at"`);
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN IF EXISTS "email_verification_token"`);
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN IF EXISTS "pending_email"`);
  }
}
