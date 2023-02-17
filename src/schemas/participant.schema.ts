import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type ParticipantDocument = HydratedDocument<Participant>;

@Schema({ id: false })
export class Participant {
  @Prop({ type: String, required: true })
  name: string;
}

export const ParticipantSchema = SchemaFactory.createForClass(Participant);
