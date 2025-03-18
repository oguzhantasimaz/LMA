import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn } from "typeorm";
import { User } from "./User";
import { Book } from "./Book";

@Entity()
export class Borrowing {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, user => user.borrowings)
  @JoinColumn()
  user: User;

  @ManyToOne(() => Book, book => book.borrowings)
  @JoinColumn()
  book: Book;

  @CreateDateColumn()
  borrowDate: Date;

  @Column({ nullable: true, type: "timestamp" })
  returnDate: Date;

  @Column({ nullable: true, type: "float" })
  rating: number;

  @Column({ default: false })
  returned: boolean;
}

