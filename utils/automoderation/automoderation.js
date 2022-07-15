const {
    isOnWhitelist
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

module.exports.antiSpam = async (setting, message, bot) => {
    if (!setting || setting.length === 0) return false;

    const isWhitelist = isOnWhitelist({
        setting,
        user_roles: message.member.roles.cache
    })
    if(isWhitelist) return false;

    const antispamsetting = JSON.parse(setting).antispam;

    if (!antispamsetting.enabled) return false;

    const userToSearch = {
        guild_id: message.guild.id,
        user_id: message.author.id,
    }

    var user;
    var isSpam = false;

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
                    return isSpam = true;
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
            try {
                if (spamCheck[i].user_id === userToSearch.user_id && spamCheck[i].guild_id === userToSearch.guild_id) {
                    delete spamCheck[i];
                    spamCheck = spamCheck.filter(Boolean);
                }
            }catch(err) {}
        }
    }, 30000);

    return isSpam;

}


module.exports.antiInvite = async (setting, message, bot) => {
    if (!setting || setting.length === 0) return false;
    const isWhitelist = isOnWhitelist({
        setting,
        user_roles: message.member.roles.cache
    })
    if(isWhitelist) return false;

    const antiinvitesetting = JSON.parse(setting).antiinvite;
    if (!antiinvitesetting.enabled) return false;

    let inviteRegex = /(https?:\/\/)?(www\.)?(discord\.(gg|io|me|li)|discordapp\.com\/invite)\/.+[a-zA-Z0-9]/;
    
    const isInvite = (message.content.match(inviteRegex)) ? true : false;

    if(isInvite) {
        if (antiinvitesetting.action) {
            switch (antiinvitesetting.action) {
                case "kick":
                    kickUser({
                        user: message.author,
                        mod: message.guild.me,
                        guild: message.guild,
                        reason: "[AUTO MOD] Sent a discord invite link",
                        bot: bot
                    })
                    break;
                case "ban":
                    banUser({
                        user: message.author,
                        mod: message.guild.me,
                        guild: message.guild,
                        reason: "[AUTO MOD] Sent a discord invite link",
                        bot,
                        isAuto: true,
                        time: "5d",
                        dbtime: getModTime("5d")
                    })
                    break;

                case "mute":
                    muteUser({
                        user: message.author,
                        mod: message.guild.me,
                        bot,
                        guild: message.guild,
                        reason: "[AUTO MOD] Sent a discord invite link",
                        time: "5d",
                        dbtime: getModTime("5d")
                    })
                    break;

                case "delete":
                    message.delete({
                        reason: "[AUTO MOD] Sent a discord invite link"
                    }).catch(err => {})
                    break;
            }
        }
        return isInvite;
    }else {
        return isInvite;
    }
}