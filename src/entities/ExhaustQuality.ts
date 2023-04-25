import { Entity, Column, PrimaryGeneratedColumn, BaseEntity, CreateDateColumn } from "typeorm"

@Entity()
export class ExhaustQuality extends BaseEntity {
    @PrimaryGeneratedColumn()
    id: number

    @Column({type: "float"})
    smoke: number

    @Column({type: "float"})
    lpg: number

    @Column({type: "float"})
    co: number

    @CreateDateColumn()
    created_at: Date
}