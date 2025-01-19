import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

@Entity()
export class Users {
  @PrimaryGeneratedColumn()
  id : number;

  @Column({
    unique : true,
  })
  email : string;

  @Column()
  password : string;

  @Column()
  salt : string;

  @Column()
  nickname : string;

  @Column({
    type : "text",
    nullable : true,
  })
  description : string;

  @Column({
    default : "user"
  })
  role : string;

  @CreateDateColumn({
    type : "datetime",
    default : () => "CURRENT_TIMESTAMP",
  })
  create_at : Date;

  @UpdateDateColumn({
    type : "datetime",
    default : () => "CURRENT_TIMESTAMP",
    onUpdate : "CURRENT_TIMESTAMP"
  })
  updated_at : Date;

  @Column({
    nullable : true,
  })
  refresh_token : string;

  @Column({
    type : "datetime",
    nullable : true,
  })
  expiration_date : Date;
}