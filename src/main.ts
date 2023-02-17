import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DiscordService } from './discord/discord.service';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const discordService = app.get(DiscordService);
  const configService = app.get(ConfigService);
  await discordService.login(configService.get('DISCORD_BOT_TOKEN'));
  await app.listen(3000);
}
bootstrap();
