import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn } from 'typeorm';

@Entity('spots')
export class Spot {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  category: string;

  @Column({ type: 'double precision' })
  lat: number;

  @Column({ type: 'double precision' })
  long: number;

  @Column({ type: 'text', nullable: true })
  address: string;

  @Column({ type: 'geography', spatialFeatureType: 'Point', srid: 4326, nullable: true })
  location: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}