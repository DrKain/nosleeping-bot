import { IDatabase, IUser } from './interface';
import { User } from 'discord.js';
import * as Datastore from 'nedb';
import * as config from 'config';

export class Database implements IDatabase {
    public data: Datastore = null;
    public last_loaded = 'never';
    public file = '';

    constructor() {
        this.file = config.get('datastore');
        this.loadFile();
    }

    private loadFile() {
        this.data = new Datastore({
            filename: this.file,
            autoload: true,
            corruptAlertThreshold: 0,
            onload: () => console.log('Database loaded')
        });
        this.last_loaded = this.now();
        // Compact the database after loading it to optimize
        this.compact();
    }

    public compact() {
        this.data.persistence.compactDatafile();
    }

    /**
     * Get the current UTC Timestamp
     * @returns UTC Timestamp
     */
    public now(): string {
        return new Date().toUTCString()
    }

    /**
     * Update a user's document with new information
     * @param user Discord User
     * @param data Data to update
     * @returns Resolve if success, Reject if failed
     */
    public updateUser(user: User, update: any) {
        return new Promise((resolve, reject) => {
            const query = { uid: user.id };
            const options = { upsert: true };
            this.data.update(query, update, options, (err: any, n: any) => {
                if (err || n === 0) reject(err || 'No documents updated');
                else resolve(true);
            })
        })
    }

    /**
     * Fetch a user's document from the database
     * @param user Discord User
     * @param createWhenMissing Create a new user when missing
     * @returns IUser
     */
    public getUser(user: User, createWhenMissing = false): Promise<IUser> {
        return new Promise((resolve) => {
            this.data.findOne({ 'uid': user.id }, (err, doc) => {
                if (err) throw Error(`${err}`);
                if (doc) return resolve(doc as IUser);
                else {
                    if (createWhenMissing) {
                        this.createUser(user).then(resolve);
                    } else {
                        resolve(null);
                    }
                }
            });
        });
    };

    /**
     * Fetch a user's document using their ID
     * @param id Discord User ID
     * @returns IUser
     */
    public async getUserFromID(id: string): Promise<IUser> {
        return await this.getUser({ id } as User, false);
    }

    /**
     * Create a new user in the database
     * @param user Discord User
     * @returns IUser
     */
    private createUser(user: User): Promise<IUser> {
        return new Promise((resolve) => {
            const data: Partial<IUser> = {
                uid: user.id,
                banned: false,
                name: user.username,
                avatar: user.avatarURL,
                warning: false,
                challenge: {
                    completed: 0,
                    start_time: this.now(),
                    last_check: this.now(),
                    best_time: 0,
                    ongoing: false,
                    verification: ''
                }
            };

            this.data.insert(data, (err, doc) => {
                if (err) throw Error(`${err}`);
                else resolve(doc as IUser);
            });
        });
    }

}

export const database = new Database();
