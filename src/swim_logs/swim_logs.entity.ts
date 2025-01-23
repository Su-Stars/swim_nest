import { Column, CreateDateColumn, Entity, Index, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { Users } from "../users/users.entity";

@Entity("swim_logs")
@Index(["user_id", "swim_date"])
export class SwimLogs {
  @PrimaryGeneratedColumn()
  id : number;

  @ManyToOne(() => Users, (users) => users.swimLogs, {
    onDelete : "CASCADE"
  })
  @JoinColumn({ name : "user_id" })
  users : Users

  @Column()
  user_id : number;

  @Column({
    type : "datetime"
  })
  swim_date : Date;

  @Column({
    nullable : true
  })
  start_time : string;

  @Column({
    nullable : true
  })
  end_time : string;

  @Column({
    default : "자유형"
  })
  swim_category : string;

  @Column({
    nullable : true
  })
  lane_length : number;

  @Column()
  swim_length : number;

  @Column({
    type : "text",
    nullable : true,
  })
  note : string;

  @CreateDateColumn({
    default : () => "CURRENT_TIMESTAMP"
  })
  created_at : Date
}