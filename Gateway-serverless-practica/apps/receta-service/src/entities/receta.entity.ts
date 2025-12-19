import { Entity, Column, PrimaryColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('recetas')
export class Receta {
  @PrimaryColumn()
  id_receta: string;

  @Column()
  id_medico: string;

  @Column()
  id_paciente: string;

  @Column({ type: 'timestamp' })
  fecha_emision: Date;

  @Column()
  diagnostico: string;

  @Column({ nullable: true, type: 'text' })
  observaciones: string;

  @Column({ nullable: true })
  ubicacion_emision: string;

  @Column({ default: 'PENDIENTE' })
  estado: string; // PENDIENTE, VALIDADA, RECHAZADA, EMITIDA

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
