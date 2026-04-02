import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Book } from './book.entity';
import { User } from './user.entity';

@Entity('favorites')
export class Favorite {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'user_id' })
  userId: string;

  @Column({ name: 'book_id' })
  bookId: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @ManyToOne(
    () => User,
    (u) => u.favorites,
    { onDelete: 'CASCADE' },
  )
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(
    () => Book,
    (b) => b.favorites,
    { onDelete: 'CASCADE' },
  )
  @JoinColumn({ name: 'book_id' })
  book: Book;
}
