import { bot } from '../bot';
import { ICommandPayload } from '../core';
import * as config from 'config';

bot.client.on('c:command', (data: ICommandPayload) => {
    const { cmd, message } = data;

    if (cmd !== 'help') return;

    message.channel.send(
        `Prefix: ${config.get('prefix')}\n` +
        `Registered commands: ${bot.cmds.join(', ')}`
    )
});