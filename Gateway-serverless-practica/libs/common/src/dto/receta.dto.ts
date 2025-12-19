import { IsString, IsNotEmpty, IsOptional, IsDateString } from 'class-validator';

export class CreateRecetaDto {
  @IsString()
  @IsNotEmpty()
  id_receta: string;

  @IsString()
  @IsNotEmpty()
  id_medico: string;

  @IsString()
  @IsNotEmpty()
  id_paciente: string;

  @IsDateString()
  @IsNotEmpty()
  fecha_emision: string;

  @IsString()
  @IsNotEmpty()
  diagnostico: string;

  @IsString()
  @IsOptional()
  observaciones?: string;

  @IsString()
  @IsOptional()
  ubicacion_emision?: string;
}

export class UpdateRecetaDto {
  @IsString()
  @IsOptional()
  diagnostico?: string;

  @IsString()
  @IsOptional()
  observaciones?: string;

  @IsString()
  @IsOptional()
  ubicacion_emision?: string;
}
