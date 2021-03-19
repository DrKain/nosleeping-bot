import { bot } from '../bot';
import { ICommandPayload } from '../core';

bot.client.emit('c:register', 'debug');

bot.client.on('c:command', (data: ICommandPayload) => {
    const { cmd, message } = data;

    if (cmd !== 'debug') return;
    if (!bot.isAdmin(message.author.id)) return message.channel.send('Admin only.');

    bot.database.compact();
    message.channel.send('Database compacted');
});