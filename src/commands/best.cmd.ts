import { bot } from '../bot';
import { ICommandPayload, IUser } from '../core';

bot.client.emit('c:register', 'best');

const find = (uid: string): Promise<IUser> => {
    return new Promise((resolve) => {
        bot.database.data.findOne({ uid }, (err, doc) => {
            if (err || !doc) resolve(null);
            else resolve(doc);
        });
    })
}

bot.client.on('c:command', async (data: ICommandPayload) => {
    let { cmd, args, user, message } = data;

    if (cmd !== 'best') return;

    if (!user) {
        return message.channel.send('Failed to load your user data');
    }

    if (args.length === 1) {
        const temp = await find(args[0]);
        if (temp) user = temp;
        else return message.channel.send('Failed to find a user with that ID');
    }

    if (user.challenge.best_time === 0) {
        message.channel.send(
            user.name + ' does not have a best time'
        );
    }

    if (user.challenge.best_time > 0) {
        message.channel.send(
            user.name + `'s best time is **${bot.sleepy.timestring(user.challenge.best_time)}**!`
        )
    }
});