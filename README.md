### nosleeping-bot  
No sleeping bot for discord, made upon request of **BitfyPro#9215**.    
This bot allows you to start a 'no sleeping' challenge, sending you a notification every 10 minutes to check if you're awake.  
If you fail to check in you will fail the challenge. Your best time is based on your last checkin.
  
## How to install:  
From the project directory run

```
npm install
```  
  
After package installation fill in the config file `config/default.json` with your bot token.  
Finally, Run the following command:   
  
```
npm start
```    
You may need to install ts-node if you don't have it already `npm install ts-node -g`

## How to play:  
  
Run the start command to start a challenge. You can `checkin` manually or when the bot warns 60 seconds before it expires.  
All commands are preceded by the bot prefix: `~` by default. Customizable in the config
  
| Command     | Description                                         | Admin? |
|-------------|-----------------------------------------------------|--------|
| help        | Prints all commands available                       | No     |
| start       | Starts a challenge                                  | No     |
| status      | Views the status of your current challenge          | No     |
| best        | Display your best time                              | No     |
| checkin     | Check in to an active challenge                     | No     |
| leaderboard | View the top 10 challenge times                     | No     |
| debug       | Compact the database (to optimize)                  | Yes    |
| verify      | Verify bot data. Requires args: cmd, user, channels | Yes    |
  

## Screenshot:  
  
![1](https://i.imgur.com/xJVLZGy.png)  
  
## Note  
Originally created **2 Aug 2019, 12:37 am UTC**.  
Recoded from scratch **19 Mar 2021 10:04 pm**  
