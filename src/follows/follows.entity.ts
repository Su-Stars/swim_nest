import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { Users } from "../users/users.entity";

@Entity()
export class Follows {
  @PrimaryGeneratedColumn()
  id : number;

  @ManyToOne(() => Users, (user) => user.following)
  @JoinColumn({ name: "user_id" })
  user: Users;

  @Column()
  user_id: number;

  // ✅ 팔로우 당하는 사람 (팔로우 대상)
  @ManyToOne(() => Users, (user) => user.followers)
  @JoinColumn({ name: "follow_id" })
  follow_user: Users;

  @Column()
  follow_id : number;

  @CreateDateColumn({
    type : "datetime"
  })
  created_at : Date;
}