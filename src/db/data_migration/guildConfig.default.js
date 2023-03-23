const guildConfig = require("../Models/tables/guildConfig.model")

(async () => {
    await guildConfig
        .findAll()
        .then(async (guilds) => {
            guilds.forEach(async (guild) => {
                const { modules } = guild

                if (!modules) {
                    const newModules = {
                        enabled: [],
                        disabled: [],
                    }
                    await guildConfig.update({
                        modules: newModules,
                    }, {
                        where: {
                            guild_id: guild.guild_id,
                        },
                    })
                }
            })
        })
        .catch((err) => {})
})();