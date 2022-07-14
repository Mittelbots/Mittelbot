const {
    getAutomodbyGuild
} = require("../functions/data/automod");
const {
    getModTime
} = require("../functions/getModTime");
const {
    banUser
} = require("../functions/moderations/banUser");
const { kickUser } = require("../functions/moderations/kickUser");
const {
    muteUser
} = require("../functions/moderations/muteUser");

var spamCheck = [];
var userAction = [];

module.exports.antiSpam = async (message, bot) => {
    const setting = await getAutomodbyGuild(message.guild.id)
    if (!setting || setting.length === 0) return;

    const antispamsetting = JSON.parse(setting).antispam;

    if (!antispamsetting.enabled) return;

    const userToSearch = {
        guild_id: message.guild.id,
        user_id: message.author.id,
    }

    var user;

    if (spamCheck.length > 0) {

        //? CHECK IF USER EXISTS
        for (let i in spamCheck) {
            if (spamCheck[i].user_id === userToSearch.user_id && spamCheck[i].guild_id === userToSearch.guild_id) {
                user = spamCheck[i];
            }
        }

        //? IF USER EXISTS
        if (user) {

            const first_message = user.first_message;

            const current_time = new Date().getTime();
            var message_count = Number(user.message_count) + 1;
            user.messages.push(message);

            const diff = first_message - current_time;
            const secondsBetween = Math.abs(diff / 1000);

            if (message_count > 6 || (message_count > 3 && secondsBetween < 4)) {

                if (secondsBetween < 4) {

                    user.first_message = current_time;
                    
                    if (antispamsetting.action && userAction.filter(u => u.user_id === user.user_id && u.guild_id === user.guild_id).length === 0) {
                        const obj = {
                            guild_id: message.guild.id,
                            user_id: message.author.id,
                            action: ""
                        }
                        switch (antispamsetting.action) {
                            case "kick":
                                obj.action = "kick";
                                kickUser({
                                    user: message.author,
                                    mod: message.guild.me,
                                    guild: message.guild,
                                    reason: "Spamming too many letters in a short time",
                                    bot: bot
                                })
                                break;
                            case "ban":
                                obj.action = "ban";
                                banUser({
                                    user: message.author,
                                    mod: message.guild.me,
                                    guild: message.guild,
                                    reason: "Spamming too many letters in a short time.",
                                    bot,
                                    isAuto: true,
                                    time: "5d",
                                    dbtime: getModTime("5d")
                                })
                                break;

                            case "mute":
                                obj.action = "mute";
                                muteUser({
                                    user: message.author,
                                    mod: message.guild.me,
                                    bot,
                                    guild: message.guild,
                                    reason: "Spamming too many letters in a short time.",
                                    time: "5d",
                                    dbtime: getModTime("5d")
                                })
                                break;

                            case "delete":
                                message.channel.messages.fetch({
                                    limit: 100
                                }).then(messages => {
                                    messages = messages.filter(m => m.createdTimestamp < first_message && m.author.id === message.author.id);
                                    message.channel.bulkDelete(messages).catch(err => {});
                                }).catch(err => {})
                                break;
                        }
                        userAction.push(obj);
                    }


                    for (let i in user.messages) {
                        delete user.messages[i];
                        user.messages = user.messages.filter(Boolean);
                    }
                    message_count = 0;
                    return true;
                }

            }

            //? UPDATE SPAMCHECK
            for (let i in spamCheck) {
                if (spamCheck[i].user_id === userToSearch.user_id && spamCheck[i].guild_id === userToSearch.guild_id) {
                    spamCheck[i].last_message = current_time
                    spamCheck[i].message_count = message_count;
                    spamCheck[i].messages.push(message)
                }
            }

            return;
        } else {
            addUser();
        }
    } else {
        addUser();
    }


    function addUser() {
        //? INSERT USER TO SPAMCHECK
        const obj = {
            guild_id: message.guild.id,
            user_id: message.author.id,
            first_message: new Date().getTime(),
            last_message: new Date().getTime(),
            messages: [message],
            message_count: 1
        }
        spamCheck.push(obj);
    }

    setTimeout(() => {
        userAction = userAction.filter(u => u.guild_id !== message.guild.id && u.user_id !== message.author.id);
        for (let i in spamCheck) {
            if (spamCheck[i].user_id === userToSearch.user_id && spamCheck[i].guild_id === userToSearch.guild_id) {
                delete spamCheck[i];
                spamCheck = spamCheck.filter(Boolean);
            }
        }
    }, 30000);

}