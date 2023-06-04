const GuildConfig = require('~utils/classes/Config');
const guilds = require('../Models/guilds.model');

(async () => {
    const allGuilds = await guilds.findAll();

    for (let i in allGuilds) {
        const config = await new GuildConfig().get(allGuilds[i].guild_id);

        if (
            !config.modules ||
            !config.modules.enabled ||
            !config.modules.disabled ||
            config.modules == '{}'
        ) {
            const newModules = {
                enabled: [],
                disabled: [],
            };

            await new GuildConfig().update({
                guild_id: allGuilds[i].guild_id,
                value: newModules,
                valueName: 'modules',
            });

            console.info(`Updated guild ${allGuilds[i].guild_id} modules`);
        }

        if (config.tickets == null) {
            await new GuildConfig().update({
                guild_id: allGuilds[i].guild_id,
                value: [],
                valueName: 'tickets',
            });

            console.info(`Updated guild ${allGuilds[i].guild_id} tickets`);
        }
    }
})();
