import { PoolImages } from "../pools/pools.entity";
import {
    Column,
    CreateDateColumn,
    Entity,
    OneToMany, OneToOne,
    PrimaryGeneratedColumn
} from "typeorm";
import {UserImages} from "../users/user-images.entity"

@Entity()
export class Images {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    url: string;

    @Column({name : "file_name"})
    filename: string;

    @Column({name : "file_size"})
    size: number;

    @Column({name : "mime_type"})
    mimetype: string;

    @CreateDateColumn()
    uploaded_at: Date;

    @OneToOne(() => PoolImages, (poolImages) => poolImages.image)
    poolImage : PoolImages

    @OneToOne(() => UserImages, (userImage) => userImage.image)
    userImage : UserImages
}