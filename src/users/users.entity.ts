import { Column, CreateDateColumn, Entity, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { Bookmarks } from "../bookmarks/bookmarks.entity";
import { SwimLogs } from "../swim_logs/swim_logs.entity";

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


  // 유저를 참조하는 테이블을 위한 릴레이션
  @OneToMany(() => Bookmarks, (bookmark) => bookmark.users )
  bookmarks : Bookmarks[];

  @OneToMany(() => SwimLogs, (swimLog) => swimLog.users )
  swimLogs : SwimLogs[];
}