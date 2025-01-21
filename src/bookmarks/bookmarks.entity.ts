import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, Unique } from "typeorm";
import { Users } from "../users/users.entity";
import { Pools } from "../pools/pools.entity";

@Entity("bookmarks")
@Unique(["users", "pools"]) // 한 번 북마크 한 수영장은 다시 추가할 수 없다. (유니크 - 고유)
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