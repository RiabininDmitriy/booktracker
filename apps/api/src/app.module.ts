import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import * as Joi from 'joi';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { BooksModule } from './books/books.module';
import {
  Book,
  Favorite,
  Rating,
  ReadingStatus,
  Review,
  User,
} from './entities';
import { FavoritesModule } from './favorites/favorites.module';
import { HealthController } from './health/health.controller';
import { ReadingStatusesModule } from './reading-statuses/reading-statuses.module';
import { RatingsModule } from './ratings/ratings.module';
import { ReviewsModule } from './reviews/reviews.module';
import { UsersModule } from './users/users.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: Joi.object({
        NODE_ENV: Joi.string()
          .valid('development', 'production')
          .default('development'),
        PORT: Joi.number().default(3001),
        DATABASE_URL: Joi.string().required(),
        JWT_SECRET: Joi.string().required(),
      }),
    }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      url: process.env.DATABASE_URL,
      autoLoadEntities: true,
      synchronize: false,
    }),
    TypeOrmModule.forFeature([
      User,
      Book,
      ReadingStatus,
      Review,
      Rating,
      Favorite,
    ]),
    UsersModule,
    AuthModule,
    BooksModule,
    ReadingStatusesModule,
    ReviewsModule,
    RatingsModule,
    FavoritesModule,
  ],
  controllers: [AppController, HealthController],
  providers: [AppService],
})
export class AppModule {}
