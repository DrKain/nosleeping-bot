import { bot } from '../bot';
import { ICommandPayload } from '../core';
import * as config from 'config';

bot.client.emit('c:register', 'checkin');
bot.client.emit('c:register', 'start');
bot.client.emit('c:register', 'status');

bot.client.on('c:command', (data: ICommandPayload) => {
    const { cmd, args, message, user } = data;

    if (cmd === 'start') {
        if (!user) {
            return message.channel.send('Failed to load your user data');
        }

        bot.sleepy.start(user, message.author).then(response => {
            message.channel.send(response)
        }, (reason) => {
            // If the challenge is ongoing then trigger the "checkin" command
            if (reason === 'ongoing') {
                bot.client.emit('c:command', { cmd: 'checkin', args, message, user });
            }
        });
    };

    if (cmd === 'checkin') {
        if (!user) {
            return message.channel.send('Failed to load your user data');
        }

        bot.sleepy.checkin(user, message.author).then(response => {
            message.channel.send(response);
        });
    }

    if (cmd === 'status') {
        if (!user) {
            return message.channel.send('Failed to load your user data');
        }

        if (user.challenge.ongoing) {
            const start = user.challenge.start_time;
            const end = bot.database.now();
            const diff = bot.sleepy.time_between(start, end);
            const limit = config.get('seconds_between_check') as number;

            let str = `${message.author.username}, Your current challenge has been going on for ` + bot.sleepy.timestring(diff.seconds);

            if (diff.seconds > limit) str += `\nUnfortunately you missed the last warning and the challenge will end on the next update.`

            message.channel.send(str)
        } else {
            message.channel.send(`${message.author.username}, You do not have an ongoing challenge`)
        }
    }
});