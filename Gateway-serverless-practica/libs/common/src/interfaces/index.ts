// Interfaces para entidades
export interface IMedico {
  id_medico: string;
  numero_licencia: string;
  institucion: string;
  ubicacion_consultorio: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface IReceta {
  id_receta: string;
  id_medico: string;
  id_paciente: string;
  fecha_emision: Date;
  diagnostico: string;
  observaciones: string;
  ubicacion_emision: string;
  estado: string;
  createdAt: Date;
  updatedAt: Date;
}

// Interface para respuestas de RabbitMQ
export interface IEventResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}
