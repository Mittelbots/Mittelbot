const Timer = require('../../../utils/functions/data/Timer');

module.exports.timer = async (bot) => {
    console.log(`⏱ Timer started`);
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
                                content: `**Timer ended!**`,
                            })
                            .catch((err) => {});
                    })
                    .catch((err) => {
                        message.react('❌');
                    });
                await timer.destroy(channel.guild.id).catch((err) => {});
                return;
            }

            const timeLeft = new Date(serverTimer.ends_at).getTime() - new Date().getTime();
            const minutes = Math.floor((timeLeft / 1000 / 60) % 60);
            const hours = Math.floor((timeLeft / (1000 * 60 * 60)) % 24);
            const days = Math.floor(timeLeft / (1000 * 60 * 60 * 24));

            let timeLeftString;
            if (minutes <= 0 || hours <= 0 || days <= 0) {
                timeLeftString = `**Time left:** Only a few seconds!`;
            } else {
                timeLeftString = `**Time left:** ${days}Day(s) ${hours}Hour(s) ${minutes}Minute(s)`;
            }

            if (timeLeftString == message.content) return;

            await message
                .edit({
                    content: `${timeLeftString}`,
                })
                .catch((err) => {
                    message.react('❌');
                });
        });

        console.log(`⏱ All timer messages updated`);
    }, timer.defaultTick);
};
