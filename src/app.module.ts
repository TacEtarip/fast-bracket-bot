import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { AppController } from './app.controller';
import { DiscordService } from './discord/discord.service';
import { MongoService } from './mongo/mongo.service';
import { Bracket, BracketSchema } from './schemas/bracket.schema';
import { Tournament, TournamentSchema } from './schemas/tournament.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Tournament.name, schema: TournamentSchema },
      { name: Bracket.name, schema: BracketSchema },
    ]),
    ConfigModule.forRoot(),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        uri: configService.get<string>('MONGO_URI'),
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [AppController],
  providers: [DiscordService, MongoService],
})
export class AppModule {}
