import * as config from 'config';
import { User } from 'discord.js';
import { IUser } from './interface';
import { bot } from '../bot';

class Timer {
    public interval = 10;
    private limit = 1e9;
    private remind = 60;

    constructor() {
        this.limit = config.get('seconds_between_check') as number;
        this.remind = config.get('seconds_to_remind') as number;
    }

    public start() {
        console.log('Started internal timer');
        this.tick();
    }

    // Don't bother to stop the challenge when they fail
    // Instead the challenge will fail when they attempt to check in late
    // The best time is based on the last successful checkin
    private warnUser(user: IUser) {
        return new Promise((resolve) => {
            const update = { $set: { warning: true } };
            bot.database.updateUser({ id: user.uid } as User, update).then(() => {
                const reminder = config.get('channel.reminder') as string;
                bot.sendToChannel(reminder,
                    `<@${user.uid}> you have less than 1 minute before your time runs out!`
                )
                resolve(true);
            }, (err) => {
                console.log(err);
                resolve(false);
            })
        })
    }

    private tick() {
        const query = { 'challenge.ongoing': true, warning: false };
        bot.database.data.find(query, async (err: any, docs: IUser[]) => {

            for (let user of docs) {
                const time_check = bot.sleepy.time_between(user.challenge.last_check, bot.database.now());
                const time_string = bot.sleepy.timestring(time_check.seconds);
                if (time_check.seconds >= (this.limit - this.remind)) {
                    console.log(`${user.name} has not checked in for ${time_string}`);
                    await this.warnUser(user);
                }
            }

            setTimeout(() => this.tick(), 10000);
        });
    }

}

export const timer = new Timer();
