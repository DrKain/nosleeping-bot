import { User } from 'discord.js';
import { Database, database } from './database';
import { ISleepyHandler, IUser } from './interface';
import * as config from 'config';
import { bot } from '../bot';

export class SleepyHandler implements ISleepyHandler {
    public db: Database;

    constructor() {
        this.db = database;
    }

    public timestring = (seconds: number) => {
        const milliseconds = seconds * 1000;
        const keys = {
            year: 31557600,
            month: 2629800,
            week: 604800,
            day: 86400,
            hour: 3600,
            minute: 60,
            second: 1
        };

        let duration = Math.floor((milliseconds + 500) / 1000);
        const resp = {};
        const stamp = [];

        Object.keys(keys).forEach((key) => {
            resp[key] = Math.floor(duration / keys[key]);
            duration -= resp[key] * keys[key];
            if (resp[key] > 0) {
                stamp.push(`${resp[key]} ${resp[key] === 1 ? key : key + 's'}`);
            }
        });

        return stamp.join(', ');
    }

    public time_between(from: string, to: string) {
        const diff = new Date(to).getTime() - new Date(from).getTime();
        return {
            days: Math.floor(diff / 1000 / 60 / 60 / 24),
            hours: Math.floor(diff / 1000 / 60 / 60),
            minutes: Math.floor(diff / 1000 / 60),
            seconds: Math.floor(diff / 1000)
        };
    }

    public checkin(user: IUser, author: User) {
        return new Promise((resolve) => {
            const update_main = { warning: false, 'challenge.last_check': this.db.now() };
            const challenge = user.challenge;

            if (!user.challenge.ongoing) {
                return resolve('You do not have an ongoing challenge.');
            }

            this.db.updateUser(author, { $set: update_main }).then(() => {
                const limit = config.get('seconds_between_check') as number;
                const last_verified = challenge.last_check;
                const t_check = this.time_between(challenge.last_check, this.db.now());
                const t_start = this.time_between(challenge.start_time, this.db.now());
                const n_spare = limit - t_check.seconds;
                const t_spare = this.timestring(n_spare > 0 ? n_spare : 0);
                const t_last = this.time_between(challenge.start_time, last_verified);
                const update_end = {
                    'challenge.ongoing': false,
                    'challenge.best_time': t_start.seconds > challenge.best_time ? t_last.seconds : challenge.best_time
                };

                if (t_check.seconds > limit) {
                    return this.db.updateUser(author, { $set: update_end }).then(() => {
                        resolve(
                            `Sorry ${user.name}, you were **${t_check.seconds}** seconds too slow. You finished the challenge after **${this.timestring(t_check.seconds)}**!\n` +
                            `Your total time (based on last check-in) is: ${this.timestring(t_last.seconds)}`
                        )
                    }, (err) => {
                        console.log(err);
                        resolve('Error ending your challenge.');
                    })
                }

                if (t_check.seconds < limit) {
                    return resolve(
                        `Thanks ${user.name} for checking in! You had **${t_spare}** to spare! Your timer has been reset.`
                    )
                }
            }, (err) => {
                console.log(err);
                resolve('Error loading your challenge.');
            });
        });
    }

    public start(user: IUser, author: User) {
        return new Promise((resolve, reject) => {
            const update = { $set: { 'challenge.last_check': this.db.now() } };
            const create = {
                $set: {
                    'challenge.start_time': this.db.now(),
                    "challenge.ongoing": true,
                    "challenge.last_check": this.db.now()
                }
            };

            // If it's ongoing the command handler will trigger the checkin command.
            if (user.challenge.ongoing && user.warning) {
                return reject('ongoing');
            }

            if (user.challenge.ongoing) {
                this.db.updateUser(author, update).then(() => {
                    resolve('You already have an ongoing challenge. I have updated your timer.');
                }, (err) => {
                    console.log(err);
                    resolve('Error loading your challenge.');
                });
            }

            if (!user.challenge.ongoing) {
                this.db.updateUser(author, create).then(() => {
                    resolve(`Your challenge has started ${author.username}. I will @mention you 10 minutes before your check-in time expires.`)
                }, (err) => {
                    console.log(err);
                    resolve('Error loading your challenge. Please contact an admin');
                });
            }
        });
    }
}

export const sleepy = new SleepyHandler();
