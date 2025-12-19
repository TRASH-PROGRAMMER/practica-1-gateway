import { Entity, Column, PrimaryColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('medicos')
export class Medico {
  @PrimaryColumn()
  id_medico: string;

  @Column({ unique: true })
  numero_licencia: string;

  @Column()
  institucion: string;

  @Column({ nullable: true })
  ubicacion_consultorio: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
