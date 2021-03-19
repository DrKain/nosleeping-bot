import { bot } from '../bot';
import { ICommandPayload } from '../core';
import * as config from 'config';

bot.client.emit('c:register', 'verify');

bot.client.on('c:command', (data: ICommandPayload) => {
    const { cmd, args, message, user } = data;

    if (cmd !== 'verify') return;
    if (!bot.isAdmin(message.author.id)) return message.channel.send('Admin only.');

    if (args.length === 0) {
        message.channel.send('Expected argument: cmd, user');
    }

    if (args[0] === 'cmd') {
        message.channel.send(
            '```json\n' + JSON.stringify({ cmd, args }, null, 2) + '\n```'
        )
    }

    if (args[0] === 'user') {
        message.channel.send(
            '```json\n' + JSON.stringify(user, null, 2) + '\n```'
        )
    }

    if (args[0] === 'channels') {
        const id_s = config.get('channel.start') as string;
        const id_r = config.get('channel.reminder') as string;

        if (id_s === id_r) {
            bot.sendToChannel(id_s, 'This channel is used for starting the challenge and reminders');
        } else {
            bot.sendToChannel(id_s, 'This channel is used to start the challenge');
            bot.sendToChannel(id_r, 'This channel is used to for reminders');
        }
    }
});