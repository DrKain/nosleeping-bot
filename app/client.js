module.exports = function(users){

    // Required packages
    var Discord     = require('discord.js');
    var client      = new Discord.Client();
    var config      = require('config');
    var command     = require('./commands');

    // Create a user!
    var createUser = function( author ){
        return new Promise(function(resolve){
            users.insert({
                uid     : author.id,
                banned  : false,
                name    : author.username,
                avatar  : author.avatar,
                challenge : {
                    completed       : 0,
                    start_time      : +new Date(),
                    best_time       : "",
                    last_check      : +new Date(),
                    ongoing         : false,
                    verification    : ""
                }
            }, function(err, doc){
                if(err) throw Error(err);
                else resolve( doc );
            })
        })
    };

    // Fetch a user using author = [ id : userid }
    var getUser = function( author, create = true ){
        return new Promise(function(resolve){
            users.findOne({ 'uid' : author.id }, function(err, doc){
                if(err) throw Error(err);
                if(doc) resolve(doc);
                else if(create === true) createUser( author ).then(resolve);
                else resolve(null);
            })
        })
    };

    // Updating user document data
    var updateUser = function( author, data ){
        return new Promise(function(resolve, reject){
            users.update({ 'uid' : author.id }, data, { upsert : false }, function(err, n){
                if(err) reject(err);
                if(n === 0) reject("No documents updated");
                else resolve(n);
            })
        })
    };

    // Information to pass to commands.js
    var _db_ = {
        users       : users,
        updateUser  : updateUser,
        getUser     : getUser,
        config      : config,
        check_time  : config.get('time_between_check'),
        time_between: function( then, now = +new Date()){
            var btw = now - then;
            return {
                milliseconds    : btw,
                seconds         : ~~(btw / 1000),
                minutes         : ~~(btw / 60000)
            }
        }
    };

    client.on('ready', function( ){
        console.log(`Connected as ${client.user.tag}`);
        console.log(`Invite using : https://discordapp.com/api/oauth2/authorize?client_id=${ config.get('botcid') }&scope=bot&permissions=337984`)
    });

    client.on('message', function( message ){
        // Ignore myself
        if(message.author.id === config.get('botcid')) return;
        // is it a command for me?
        if(message.content[0] === config.get('prefix')){
            var cmd, args;
            try{ // parse command and arguments
                args = message.content.split(' ');
                cmd = args.shift().replace(config.get('prefix'), '');
            } catch(e){
                console.warn(e);
            }

            // Verify command was assigned
            if(!cmd) return;

            // Ignore banned users
            if(user.banned) return;

            // Verify command exists, Load user from database, Execute command
            if(command[cmd]){
                getUser( message.author ).then(function( user ){
                    command[cmd]( _db_, cmd, args, user, message );
                })
            }

        }
    });

    // Log in using bot token from /config/default.json
    client.login(config.get('bottoken'));

};