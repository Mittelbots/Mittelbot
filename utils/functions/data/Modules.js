const defaultModuleSettings = require('../../../src/assets/json/modules/modules.json');
const { GuildConfig } = require('./Config');

module.exports = class Modules {
    constructor(guild_id, bot) {
        this.guild_id = guild_id;
        this.bot = bot;
    }

    getDefaultSettings() {
        return defaultModuleSettings;
    }

    get(module) {
        return new Promise(async (resolve) => {
            const config = await GuildConfig()
                .get(this.guild_id)
                .catch(() => {});
            if (!config) return resolve(false);

            return resolve(config.disabled_modules[module]);
        });
    }

    checkEnabled(module) {
        return new Promise(async (resolve) => {
            const isAutoDisabled = defaultModuleSettings[module].autoDisabled;
            const isDisabled = await this.get(this.guild_id, module).catch(() => {});

            if (isAutoDisabled) return resolve(false);
            if (isDisabled) return resolve(false);

            return resolve(true);
        });
    }

    manageDisable(module, disable = false) {
        return new Promise(async (resolve) => {
            const config = await GuildConfig()
                .get(this.guild_id)
                .catch(() => {});
            if (!config) return resolve(false);

            const disabled_modules = config.disabled_modules;

            if (disable) {
                disabled_modules.push(module);
            } else {
                disabled_modules.splice(disabled_modules.indexOf(module), 1);
            }

            await GuildConfig()
                .update({
                    guild_id: this.guild_id,
                    value: disabled_modules,
                    valueName: 'disabled_modules',
                })
                .catch(() => {});

            return resolve(true);
        });
    }
};
