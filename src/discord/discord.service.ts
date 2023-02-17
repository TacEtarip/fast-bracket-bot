import { Injectable, OnModuleInit } from '@nestjs/common';
import { Client, GatewayIntentBits, Message, TextChannel } from 'discord.js';
import { TournamentState } from 'src/enums/tournament-state.enum';
import { MongoService } from 'src/mongo/mongo.service';
import { Tournament, TournamentDocument } from './../schemas/tournament.schema';

enum BotOrder {
  CreateBracket = 'create',
  StartBracket = 'start',
}

@Injectable()
export class DiscordService implements OnModuleInit {
  private client: Client;

  constructor(private mongoService: MongoService) {
    this.client = new Client({
      intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
      ],
    });
  }

  onModuleInit(): any {
    this.client.on('ready', this.handleOnReady);
    this.client.on('messageCreate', this.handleOnMessage);
  }

  handleOnReady = () => {
    console.log(`Logged in as ${this.client.user.tag}!`);
  };

  handleOnMessage = (message: Message) => {
    const messageContent = message.content.toLowerCase();
    const botOrders = messageContent.split(' ');
    if (botOrders[0] === '!ftb') {
      this.handleOrders(botOrders, message);
    }
  };

  async handleOrders(botOrders: string[], message: Message) {
    if (botOrders[1] === BotOrder.CreateBracket) {
      await this.createTournament(message);
      return;
    }
    if (botOrders[1] === BotOrder.StartBracket) {
      // this.startBracket(message);
      return;
    }
  }

  async startTournament(message: Message) {
    const tournament = await this.getTournamentToStart(message);

    if (tournament === null) return;

    const channelMessages = await this.getChannelMessages(message, tournament);

    const participants: string[] = [];

    channelMessages.forEach((channelMessage) => {
      if (this.evaluateChannelMessage(message, channelMessage)) {
        // delete lines from content
        const noExtraLinesContent = channelMessage.content.replace(
          /(\r\n|\n|\r)/gm,
          '',
        );

        participants.push(...this.getParticipants(noExtraLinesContent));
      }
    });

    if (participants.length < 2) {
      message.reply('You need at least 2 participants to start a tournament');
      return;
    }

    // const bracket = this.createTournamentBracket(participants);

    await this.mongoService.updateTournamentStateAndAddParticipants(
      tournament.id,
      TournamentState.Started,
      participants,
    );
  }

  getParticipants(message: string): string[] {
    const indexOfDash = message.indexOf('-');

    if (indexOfDash === -1) {
      return [];
    }

    const nextDashIndex = message.slice(indexOfDash + 1).indexOf('-');

    if (nextDashIndex === -1) {
      return [message.slice(indexOfDash + 1).trim()];
    }

    return [
      message.slice(indexOfDash + 1, nextDashIndex).trim(),
      ...this.getParticipants(message.slice(nextDashIndex + 1)),
    ];
  }

  async getChannelMessages(message: Message, tournament: TournamentDocument) {
    const channel = (await this.client.channels.fetch(
      message.channelId,
    )) as TextChannel;

    return channel.messages.fetch({
      after: tournament.createdMessageId,
      before: message.id,
      cache: false,
    });
  }

  evaluateChannelMessage(
    message: Message,
    channelMessage: Message,
    regexMatchString = '-+[a-zA-Z]+',
  ) {
    const regexMatch = new RegExp(regexMatchString, 'gi');

    if (
      regexMatch.test(message.content) &&
      channelMessage.author.id === message.author.id
    ) {
      return true;
    }
    return false;
  }

  async createTournament(message: Message) {
    const cancelBracketCreation = await this.cancelTournamentCreation(message);

    if (cancelBracketCreation) return;

    await this.mongoService.createNewTournament({
      userId: message.author.id,
      channelId: message.channelId,
      createdMessageId: message.id,
      state: 0,
    });

    message.reply('Give me the participants (precede them by a "-"):');
  }

  async cancelTournamentCreation(message: Message) {
    const currentTournament =
      await this.mongoService.getCurrentUserAndChannelTournamentByState(
        message.author.id,
        message.channelId,
        [TournamentState.Started, TournamentState.Created],
      );

    if (currentTournament) {
      await message.reply(
        'You already have a tournament in progress. You can cancel it with !ftb cancel',
      );
      return true;
    }

    return false;
  }

  async getTournamentToStart(message: Message) {
    const currentTournament =
      await this.mongoService.getCurrentUserAndChannelTournamentByState(
        message.author.id,
        message.channelId,
        [TournamentState.Created],
      );

    if (!currentTournament) {
      await message.reply(
        "You don't have a tournament in progress. You can create one with !ftb create",
      );
      return null;
    }

    if (currentTournament.state === TournamentState.Started) {
      await message.reply(
        'The tournament has already started. You can cancel it with !ftb cancel',
      );
    }

    return currentTournament;
  }

  async login(token: string): Promise<void> {
    await this.client.login(token);
  }
}
