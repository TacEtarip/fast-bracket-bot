import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';
import { Round } from './round.schema';

export type BracketDocument = HydratedDocument<Bracket>;

@Schema()
export class Bracket {
  @Prop({ type: Number, required: true })
  totalNumberOfRounds: number;

  @Prop({ type: Number, default: 0 })
  completedRounds: number;

  @Prop({ type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Round' }] })
  rounds: Round[];
}

export const BracketSchema = SchemaFactory.createForClass(Bracket);
