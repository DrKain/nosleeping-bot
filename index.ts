import * as config from 'config';
import { bot } from './src/bot';
import { readdir } from 'fs';

// Make sure the config file is filled
if (config.get('bot.token') === '') {
    console.log('[Error] Missing bot.token in config file');
    process.exit(0);
}

// Load all commands
const CMD_DIR = `${__dirname}/src/commands/`;
readdir(CMD_DIR, (err, files) => files.forEach(file => require(`${CMD_DIR}${file}`)));

// Start the bot
bot.start();