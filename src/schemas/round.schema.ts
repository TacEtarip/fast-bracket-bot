import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';
import { MatchUp } from './matchUp.schema';

export type RoundDocument = HydratedDocument<Round>;

@Schema({ id: false })
export class Round {
  @Prop({ type: Number, required: true })
  roundNumber: number;

  @Prop({ type: Boolean, default: false })
  completed: boolean;

  @Prop({ type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'MatchUp' }] })
  matchUps: MatchUp[];
}

export const RoundSchema = SchemaFactory.createForClass(Round);
