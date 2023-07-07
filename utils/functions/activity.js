const { getLinesOfCode } = require('./getLinesOfCode/getLinesOfCode');
const { ActivityType } = require('discord.js');

const fs = require('fs');

module.exports.setActivity = async (bot, restart = false) => {
    if (restart) {
        return bot.user.setActivity({
            name: 'files to load...',
            type: ActivityType.Watching,
        });
    }

    const settings = fs.readFileSync(
        `src/assets/json/_config/activity_${
            process.env.NODE_ENV === 'production' ? 'prod' : 'dev'
        }.json`,
        'utf8'
    );
    const texts = JSON.parse(settings).texts;
    const activity = texts[Math.floor(Math.random() * texts.length)];

    if (activity.showGuildCount) {
        const guildCount = bot.guilds.cache.size;
        activity.text = activity.text.replace('{guildCount}', guildCount);
    }

    if (activity.showMemberCount) {
        const memberCount = bot.guilds.cache
            .map((guild) => guild.memberCount)
            .reduce((a, b) => a + b, 0);
        activity.text = activity.text.replace('{memberCount}', memberCount);
    }

    if (activity.showLinesOfCode) {
        const loc = await getLinesOfCode();
        activity.text = activity.text.replace('{loc}', loc);
    }

    if (activity.showVersion) {
        activity.text = activity.text.replace(
            '{version}',
            require('../../../package.json').version
        );
    }

    bot.user.setActivity({
        name: activity.text,
        type: activity.type ? ActivityType[activity.type] : ActivityType.Playing,
    });
};
