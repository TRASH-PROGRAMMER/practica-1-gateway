import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class CreateMedicoDto {
  @IsString()
  @IsNotEmpty()
  id_medico: string;

  @IsString()
  @IsNotEmpty()
  numero_licencia: string;

  @IsString()
  @IsNotEmpty()
  institucion: string;

  @IsString()
  @IsOptional()
  ubicacion_consultorio?: string;
}

export class UpdateMedicoDto {
  @IsString()
  @IsOptional()
  numero_licencia?: string;

  @IsString()
  @IsOptional()
  institucion?: string;

  @IsString()
  @IsOptional()
  ubicacion_consultorio?: string;
}
