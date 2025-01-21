import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { Users } from "../users/users.entity";
import { Pools } from "../pools/pools.entity";

@Entity("bookmarks")
export class Bookmarks {
  @PrimaryGeneratedColumn()
  id : number;

  @ManyToOne(() => Users, (users) => users.bookmarks, {
    onDelete : "CASCADE"
  })
  @JoinColumn({
    name : "user_id"
  })
  users : Users;

  @ManyToOne(() => Pools, (pools) => pools.bookmarks, {
    onDelete : "CASCADE"
  })
  @JoinColumn({
    name : "pool_id"
  })
  pools : Pools;

  @CreateDateColumn({
    default : () => "CURRENT_TIMESTAMP"
  })
  created_at : Date;
}