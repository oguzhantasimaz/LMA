import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from "typeorm";
import { Borrowing } from "./Borrowing";

@Entity()
export class Book {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @Column()
  author: string;

  @Column({ type: "text", nullable: true })
  description: string;

  @Column({ default: 0 })
  totalRatings: number;

  @Column({ default: 0 })
  ratingCount: number;

  @Column({ type: "float", default: 0 })
  averageRating: number;

  @Column({ default: true })
  available: boolean;

  @OneToMany(() => Borrowing, borrowing => borrowing.book)
  borrowings: Borrowing[];
}

