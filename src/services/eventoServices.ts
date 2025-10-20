import { Evento, IEvento } from '../models/evento';
import { Usuario } from '../models/usuario';

export class EventoService {
  async createEvento(data: Partial<IEvento>): Promise<IEvento> {
    const e = new Evento(data);
    return await e.save();
  }

  async getAllEventos(): Promise<IEvento[]> {
    return await Evento.find();
  }

  async getEventoById(id: string): Promise<IEvento | null> {
    return await Evento.findById(id);
  }

  // 👇 AGREGAR ESTE MÉTODO
  async updateEvento(id: string, data: Partial<IEvento>): Promise<IEvento | null> {
    return await Evento.findByIdAndUpdate(
      id,
      { $set: data },
      { new: true, runValidators: true }
    ).exec();
  }

  async deleteEventoById(id: string): Promise<IEvento | null> {
    return await Evento.findByIdAndDelete(id);
  }

  async addParticipante(
    eventoId: string,
    data: { usuario: string; role?: string; nombreSnapshot?: string; emailSnapshot?: string }
  ) {
    const evento = await Evento.findByIdAndUpdate(
      eventoId,
      { $push: { participantes: data } },
      { new: true }
    );

    if (!evento) return null;

    if (data.usuario) {
      await Usuario.updateOne({ _id: data.usuario }, { $addToSet: { eventos: evento._id } }).exec();
    }

    return await Evento.findById(eventoId)
      .populate('participantes.usuario', 'username gmail')
      .exec();
  }

  async updateParticipante(
    eventoId: string,
    participanteId: string,
    updates: { role?: string; nombreSnapshot?: string; emailSnapshot?: string }
  ) {
    const evento = await Evento.findOneAndUpdate(
      { _id: eventoId, 'participantes._id': participanteId },
      {
        $set: {
          'participantes.$.role': updates.role,
          'participantes.$.nombreSnapshot': updates.nombreSnapshot,
          'participantes.$.emailSnapshot': updates.emailSnapshot,
        },
      },
      { new: true }
    );

    if (!evento) return null;

    return await Evento.findById(eventoId)
      .populate('participantes.usuario', 'username gmail')
      .exec();
  }

  async deleteParticipante(eventoId: string, participanteId: string) {
    const prev = await Evento.findOne(
      { _id: eventoId, 'participantes._id': participanteId },
      { 'participantes.$': 1 }
    ).lean();

    const usuarioId = (prev?.participantes?.[0] as any)?.usuario;

    const evento = await Evento.findByIdAndUpdate(
      eventoId,
      { $pull: { participantes: { _id: participanteId } } },
      { new: true }
    );

    if (!evento) return null;

    if (usuarioId) {
      await Usuario.updateOne({ _id: usuarioId }, { $pull: { eventos: evento._id } }).exec();
    }

    return await Evento.findById(eventoId)
      .populate('participantes.usuario', 'username gmail')
      .exec();
  }
}