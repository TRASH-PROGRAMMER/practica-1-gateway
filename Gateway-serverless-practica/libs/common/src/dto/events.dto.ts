import { IsString, IsNotEmpty, IsObject } from 'class-validator';

// Evento: Validación de médico solicitada
export class ValidarMedicoEventDto {
  @IsString()
  @IsNotEmpty()
  idempotencyKey: string;

  @IsString()
  @IsNotEmpty()
  id_medico: string;

  @IsString()
  @IsNotEmpty()
  id_receta: string;

  @IsObject()
  recetaData: any;
}

// Evento: Médico validado
export class MedicoValidadoEventDto {
  @IsString()
  @IsNotEmpty()
  idempotencyKey: string;

  @IsString()
  @IsNotEmpty()
  id_medico: string;

  @IsString()
  @IsNotEmpty()
  id_receta: string;

  @IsString()
  @IsNotEmpty()
  status: 'VALIDADO' | 'RECHAZADO';

  @IsString()
  @IsNotEmpty()
  mensaje: string;
}
