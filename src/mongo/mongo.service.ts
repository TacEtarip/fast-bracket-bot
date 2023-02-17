import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { TournamentState } from 'src/enums/tournament-state.enum';
import { Bracket, BracketDocument } from './../schemas/bracket.schema';
import { MatchUp } from './../schemas/matchUp.schema';
import { Participant } from './../schemas/participant.schema';
import { Round } from './../schemas/round.schema';
import { Tournament, TournamentDocument } from './../schemas/tournament.schema';

@Injectable()
export class MongoService {
  constructor(
    @InjectModel(Tournament.name)
    private tournamentModel: Model<TournamentDocument>,
    @InjectModel(Bracket.name)
    private bracketModel: Model<BracketDocument>,
  ) {}

  createNewTournament(tournament: Tournament): Promise<TournamentDocument> {
    return this.tournamentModel.create(tournament);
  }

  updateTournamentStateAndAddParticipants(
    tournamentId: string,
    newState: TournamentState,
    participants: string[],
  ): Promise<TournamentDocument> {
    const participantsToAdd = participants.map((p) => {
      return new Model<Participant>({
        name: p,
      });
    });

    return this.tournamentModel
      .findByIdAndUpdate(
        tournamentId,
        {
          state: newState,
          participants: [...participantsToAdd],
        },
        { new: true },
      )
      .exec();
  }

  getCurrentUserAndChannelTournamentByState(
    userId: string,
    channelId: string,
    inStates: TournamentState[],
  ): Promise<TournamentDocument> {
    return this.tournamentModel
      .findOne({
        userId,
        channelId,
        state: {
          $in: [...inStates],
        },
      })
      .exec();
  }

  shuffleParticipants(participants: string[]) {
    const shuffledParticipants = [...participants];

    for (let index = shuffledParticipants.length - 1; index > 0; index--) {
      const randomIndex = Math.floor(Math.random() * (index + 1));
      [shuffledParticipants[index], shuffledParticipants[randomIndex]] = [
        shuffledParticipants[randomIndex],
        shuffledParticipants[index],
      ];
    }

    return shuffledParticipants;
  }

  createNewBracket(participants: string[]) {
    const totalNumberOfRounds = Math.ceil(Math.log2(participants.length));

    const matchUps: MatchUp[] = [];

    const shuffledParticipants = this.shuffleParticipants(participants);

    for (let index = 0; index < shuffledParticipants.length; index++) {
      const matchUp = new Model<MatchUp>({
        firstParticipant: new Model<Participant>({
          name: shuffledParticipants[index],
        }),
        secondParticipant: new Model<Participant>({
          name: shuffledParticipants[index++],
        }),
        order: index - 1,
      });

      matchUps.push(matchUp);
    }

    const firstRound: Round = new Model<Round>({
      roundNumber: 1,
      matchUps,
    });

    const createdBracket = new this.bracketModel({
      totalNumberOfRounds,
      completedRounds: 0,
      rounds: [firstRound],
    });

    return createdBracket.save();
  }
}
