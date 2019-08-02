module.exports = {
    'help' : function( db, cmd, args, user, message ){
        message.channel.send(
            `Use ~start to start the challenge, ~best to view your best time and ~leaderboard to view the leaderboard`
        )
    },
    // Admin Only!
    // - Used to verify command arguments and user object.
    'verify' : function( db, cmd, args, user, message ){
        if(user.id === db.config.get('botadmin')) return;
        if(args[0] === "cmd"){
            message.channel.send('Test verified, Command parse: ```' + JSON.stringify({
                cmd : cmd,
                args : args
            }, null, 2) + "```");
        }
        if(args[0] === "user"){
            message.channel.send("User document: ```" + JSON.stringify(user, null, 2) + "```");
        }
        if(args[0] === 'channels'){
            var st = db.config.get("channel.start");
            var rm = db.config.get("channel.reminder");

            db.sendToChannel(rm, "This channel is set for reminders");
            db.sendToChannel(st, "This channel is set for starting");
        }
    },
    // Admin Only!
    // - Compacts database (Optimization and performance)
    'compact' : function( db, cmd, args, user, message ){
        if(user.id === db.config.get('botadmin')) return;
        db.users.persistence.compactDatafile();
        message.channel.send("Database Compacted!");
    },
    // All Users
    // - Prints out best time.
    'best' : function( db, cmd, args, user, message ){
        if(user.challenge.best_time !== '' && user.challenge.best_time !== 0){
            // Print best time.
            message.channel.send(`Your best time is ${(user.challenge.best_time / 60000).toFixed(2)} minutes!`)
        } else {
            // No best time.
            message.channel.send(`You don't have a best time yet. You should ~start a challenge!`)
        }
    },
    // All Users
    // Start a challenge.
    'start' : function( db, cmd, args, user, message ){
        if( user.challenge.ongoing === true ){
            db.updateUser({ id : user.uid }, {
                $set : {
                    "challenge.last_check" : +new Date()
                }
            }).then(function(){
                // Challenge is already in progress
                message.channel.send("You already have an ongoing challenge. I have updated your timer.");
            }, function(err){
                // Unable to update challenge. Corrupt database?
                message.channel.send("Error loading your challenge: " + err);
            })
        } else {
            db.updateUser({ id : user.uid }, {
                $set : {
                    'challenge.start_time' : +new Date(),
                    "challenge.ongoing" : true,
                    "challenge.last_check" : +new Date()
                }
            }).then(function(){
                // Challenge successfully started.
                message.channel.send("Your challenge has started, " + user.name + ". You will be required to `~checkin` every 10 minutes. I will remind you if you forget.");
            }, function(err){
                // Failed to start challenge. Corrupt database?
                message.channel.send("Error loading your challenge. Please contact admin - " + err);
            })
        }
    },
    // All Users
    'leaderboard' : function( db, cmd, args, user, message ){
        db.users.find({ }).sort({
            'challenge.best_time' : 1
        }).limit(10).exec(function(err, docs){
            if(err){
                console.log(err);
                message.channel.send("Error loading leaderboard...");
            } else {
                var list = ['Challenge Leaderboard:\n```'];
                docs.forEach(function( item ){
                    list.push(`${ (item.challenge.best_time / 60000).toFixed(2) } minutes - ${item.name}\n`);
                });
                list.push('```');
                message.channel.send(list.join(''));
            }
        })
    },
    // All Users!
    // Check in. Change this to whatever you want.
    'checkin' : function( db, cmd, args, user, message ){
        var last_verified = user.challenge.last_check;
        if( user.challenge.ongoing === true ){
            db.updateUser({ id : user.uid }, {
                $set : {
                    "challenge.last_check" : +new Date()
                }
            }).then(function(){
                // Calculating time used in messages.
                var time_check  = db.time_between( user.challenge.last_check );
                var time_start  = db.time_between( user.challenge.start_time );
                var time_spare  = ((db.check_time - time_check.milliseconds) / 60000).toFixed(2) + " minutes";
                var time_last   = db.time_between( last_verified, user.challenge.start_time );

                if( time_check.milliseconds > db.check_time ){
                    db.updateUser({ id : user.uid }, {
                        $set : {
                            'warning' : false,
                            'challenge.ongoing' : false,
                            'challenge.best_time' : time_start.milliseconds > user.challenge.best_time ? time_last.milliseconds : user.challenge.best_time
                        }
                    }).then(function(){
                        // Check in too slow
                        message.channel.send(
                            `Sorry ${user.name}, you were ${time_check.seconds} seconds too slow. You finished the challenge after ${ time_check.minutes } minutes!\n` +
                            `Your total time (based on last check-in) is ${time_last.seconds} seconds`
                        )
                    }, function(err){
                        // Unable to fail challenge
                        message.channel.send(
                            "Error ending your challenge. Please contact admin - " + err
                        );
                    })
                } else {
                    // Check in successful
                    message.channel.send(
                        `Thanks ${user.name} for checking in! You had ${time_spare} to spare! Your timer has been reset.`
                    )
                }
            }, function(err){
                // Failed to load challenge.
                message.channel.send("Error loading your challenge. Please contact admin - " + err);
            })
        }
    }
};