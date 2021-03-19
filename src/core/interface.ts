import { Client, Message, Guild } from "discord.js";
import { Database } from './database';
import * as Nedb from "nedb";
import { SleepyHandler } from "./sleepyhandler";

export interface ISleepyHandler {
    db: Database;
}

export interface ICommandPayload {
    cmd: string;
    args: string[];
    message: Message;
    user: IUser;
}

export interface IBot {
    client: Client;
    sleepy: SleepyHandler;
    database: Database;
    cmds: string[];
    start: () => any;
    isAdmin: (id: string) => boolean;
    sendToChannel: (id: string, message: string) => any;
}

export interface IUser {
    _id: string;
    uid: string;
    banned: boolean;
    name: string;
    avatar: string;
    warning: boolean;
    challenge: IChallenge;
}

export interface IChallenge {
    completed: number;
    start_time: string;
    best_time: number;
    last_check: string;
    ongoing: boolean;
    verification: string;
}

export interface IDatabase {
    data: Nedb;
    file: string;
    last_loaded: string;
}