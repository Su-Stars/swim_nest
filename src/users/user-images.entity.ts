import { Column, Entity, JoinColumn, OneToOne, PrimaryGeneratedColumn } from "typeorm";
import { Images } from "../images/images.entity";
import { Users } from "./users.entity";

@Entity()
export class UserImages {
  @PrimaryGeneratedColumn()
  id : number;

  @OneToOne(() => Users, (users) => users.userImage, {
    onDelete : "CASCADE"
  })
  @JoinColumn({name : "user_id"})
  user : Users;

  @Column()
  user_id : number;

  @OneToOne(() => Images, (image) => image.userImage, {
    onDelete : "CASCADE"
  })
  @JoinColumn({name : "image_id"})
  image : Images;

  @Column()
  image_id : number;
}