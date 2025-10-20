import { Schema, model, Types } from 'mongoose';

// --- Interfaces ---
export interface IParticipanteEvento {
  _id: Types.ObjectId;
  usuario: Types.ObjectId;                 // referencia al Usuario
  role?: 'guest' | 'organizer' | 'speaker'; // rol dentro del evento
  nombreSnapshot?: string;                  // nombre guardado al momento del registro
  emailSnapshot?: string;                   // email guardado al momento del registro
}

export interface IEvento {
  _id: Types.ObjectId;
  name: string;
  schedule: string;
  address?: string;
  participantes: IParticipanteEvento[];     // lista de participantes del evento
}

// --- Esquemas ---
const participanteEventoSchema = new Schema<IParticipanteEvento>({
  usuario: { type: Schema.Types.ObjectId, ref: 'Usuario', required: true },
  role: { type: String, enum: ['guest', 'organizer', 'speaker'], default: 'guest' },
  nombreSnapshot: { type: String },
  emailSnapshot: { type: String }
}, { _id: true });

const eventoSchema = new Schema<IEvento>({
  name: { type: String, required: true },
  schedule: { type: String, required: true },
  address: { type: String },
  participantes: { type: [participanteEventoSchema], default: [] }
}, { timestamps: false, versionKey: false });

// --- Exportación ---
export const Evento = model<IEvento>('Evento', eventoSchema);
export default Evento;
