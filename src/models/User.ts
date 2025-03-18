import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from "typeorm";
import { Borrowing } from "./Borrowing";

// Create Role enum to match Prisma schema
export enum Role {
  USER = "USER",
  ADMIN = "ADMIN"
}

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column({ unique: true })
  email: string;

  @Column()
  password: string;

  @Column({
    type: "enum",
    enum: Role,
    default: Role.USER
  })
  role: Role;

  @OneToMany(() => Borrowing, borrowing => borrowing.user)
  borrowings: Borrowing[];
}

