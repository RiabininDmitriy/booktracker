import { DataSource } from 'typeorm';
import { Book, Favorite, Rating, ReadingStatus, Review, User } from '../entities';

export const AppDataSource = new DataSource({
  type: 'postgres',
  url: process.env.DATABASE_URL,
  entities: [User, Book, ReadingStatus, Review, Rating, Favorite],
  migrations: ['src/database/migrations/*.ts'],
  synchronize: false,
});
