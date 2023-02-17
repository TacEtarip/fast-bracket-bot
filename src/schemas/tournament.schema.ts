import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';
import { TournamentState } from 'src/enums/tournament-state.enum';
import { Participant } from './participant.schema';

export type TournamentDocument = HydratedDocument<Tournament>;

@Schema({ timestamps: true })
export class Tournament {
  @Prop({ type: String, required: true })
  userId: string;

  @Prop({ type: String, required: true })
  channelId: string;

  @Prop({ type: String, required: true })
  createdMessageId: string;

  @Prop({ type: Number, default: 0, enum: TournamentState })
  state: number;

  @Prop({
    type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Participant' }],
    default: [],
  })
  participants?: Participant[];

  @Prop({ type: String, required: false })
  bracket?: string;
}

export const TournamentSchema = SchemaFactory.createForClass(Tournament);
