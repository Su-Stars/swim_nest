import {
  Column,
  CreateDateColumn,
  Entity, JoinColumn,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn
} from "typeorm";
import { Bookmarks } from "../bookmarks/bookmarks.entity";
import { SwimLogs } from "../swim_logs/swim_logs.entity";
import { Follows } from "../follows/follows.entity";
import { Reviews } from "../reviews/reviews.entity";
import { UserImages } from "./user-images.entity";

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

  @Column({
    type : "text",
    nullable : true
  })
  image_url : string;

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

  @OneToMany(() => Reviews, (review) => review.users)
  reviews : Reviews[];

  // 내가 팔로우한 사람들 (Following)
  @OneToMany(() => Follows, (follows) => follows.user)
  following: Follows[];

  // 나를 팔로우한 사람들 (Followers)
  @OneToMany(() => Follows, (follows) => follows.follow_user)
  followers: Follows[];

  @OneToOne(() => UserImages, (userImage) => userImage.user)
  userImage : UserImages;
}
