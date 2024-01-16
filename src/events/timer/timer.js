const Timer = require('~utils/classes/Timer');

module.exports.timer = async (bot) => {
    console.info(`⏱ Timer started`);
    const timer = new Timer();

    setInterval(async () => {
        const timers = await timer.getAll();
        timers.forEach(async (serverTimer) => {
            const guild = bot.guilds.cache.get(serverTimer.guild_id);
            const channel = guild.channels.cache.get(serverTimer.channel_id);
            const message = await channel.messages.fetch(serverTimer.message_id);

            if (!message) {
                await timer.destroy(channel.guild.id).catch((err) => {});
                return;
            }

            if (new Date(serverTimer.ends_at) <= new Date().getTime()) {
                await channel
                    .send({
                        content: serverTimer.endMessage,
                    })
                    .then(() => {
                        message
                            .edit({
                                content: global.t.trans(
                                    ['info.fun.timer.timerEnded'],
                                    channel.guild.id
                                ),
                            })
                            .catch(() => {});
                    })
                    .catch(() => {
                        message.react('❌');
                    });
                await timer.destroy(channel.guild.id).catch(() => {});
                return;
            }

            const timeLeft = new Date(serverTimer.ends_at).getTime() - new Date().getTime();
            const minutes = Math.floor((timeLeft / 1000 / 60) % 60);
            const hours = Math.floor((timeLeft / (1000 * 60 * 60)) % 24);
            const days = Math.floor(timeLeft / (1000 * 60 * 60 * 24));

            let timeLeftString;
            if (minutes <= 0 && hours <= 0 && days <= 0) {
                timeLeftString = global.t.trans(['info.fun.timer.timeLeft'], channel.guild.id);
            } else {
                timeLeftString = global.t.trans(
                    ['info.fun.timer.timeLeftTime', days, hours, minutes],
                    channel.guild.id
                );
            }

            if (timeLeftString == message.content) return;

            await message
                .edit({
                    content: `${timeLeftString}`,
                })
                .then(() => {
                    if (message.reactions.cache.size > 0 && message.reactions.cache.get('❌')) {
                        message.reactions.cache.get('❌').users.remove(bot.user.id);
                    }
                })
                .catch((err) => {
                    message.react('❌');
                });
        });

        console.info(`⏱ All timer messages updated`);
    }, timer.defaultTick);
};
