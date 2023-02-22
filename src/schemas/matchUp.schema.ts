import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';
import { Participant } from './participant.schema';

export type MatchUpDocument = HydratedDocument<MatchUp>;

@Schema({ id: false })
export class MatchUp {
  @Prop({ type: Number, required: true })
  order: number;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Participant' })
  firstParticipant: Participant;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Participant' })
  secondParticipant: Participant;

  @Prop({
    type: Number,
    default: -1,
    enum: [-1, 0, 1],
  })
  winner?: number;
}

export const MatchUpSchema = SchemaFactory.createForClass(MatchUp);
