import { Client, Message, TextChannel } from 'discord.js';
import { sleepy, ICommandPayload, IBot, database, timer } from './core';
import * as config from 'config';

const client = new Client();

client.on('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`);
    timer.start();
});

client.on('message', async (message: Message) => {
    const prefix = config.get('prefix') as string;
    // Parse the command and arguments from the message content
    if (message.content.startsWith(prefix)) {
        let cmd: any, args: any;
        args = message.content.split(' ');
        cmd = args.shift().replace(prefix, '');

        // Load the user's data from the database
        const user = await database.getUser(message.author, true);
        client.emit('c:command', { cmd, args, message, user } as ICommandPayload);
    }
});

export const bot: IBot = {
    client, sleepy, database, cmds: [],
    start: () => client.login(config.get('bot.token')),
    isAdmin: (id): boolean => (config.get('admins') as Array<string>).includes(id),
    sendToChannel: (id, message) => {
        const gid = config.get('guild') as string;
        const guild = bot.client.guilds.find('id', gid);
        const channel = guild.channels.find('id', id);
        if (!guild || !channel) return;
        (channel as TextChannel).send(message);
    }
};

client.on('c:register', (cnd: string) => bot.cmds.push(cnd));