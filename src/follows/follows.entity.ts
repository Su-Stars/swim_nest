import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { Users } from "../users/users.entity";

@Entity()
export class Follows {
  @PrimaryGeneratedColumn()
  id : number;

  @ManyToOne(() => Users, (users) => users.follows)
  @JoinColumn({
    name : "user_id"
  })
  users : Users

  @Column()
  user_id : number;

  @ManyToOne(() => Users, (users) => users.follows)
  @JoinColumn({
    name : "follow_id"
  })
  follow_user_id : number;

  @Column()
  follow_id : number;

  @CreateDateColumn({
    type : "datetime"
  })
  created_at : Date;
}