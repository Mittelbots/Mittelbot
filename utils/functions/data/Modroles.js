const { ButtonBuilder, ButtonStyle } = require('discord.js');
const { GuildConfig } = require('./Config');

class Modroles {
    constructor() {}

    get(guild_id) {
        return new Promise(async (resolve, reject) => {
            const guildConfig = await GuildConfig.get(guild_id);
            resolve(JSON.parse(guildConfig.modroles));
        });
    }

    update({ guild_id, role_id, isAdmin, isMod, isHelper }) {
        return new Promise(async (resolve, reject) => {
            const modroles = await this.get(guild_id);

            const obj = {
                role: role_id,
                isAdmin,
                isMod,
                isHelper,
            };

            const index = modroles.findIndex((x) => x.role === role_id);

            if (index !== -1) {
                modroles[index] = obj;
            } else {
                modroles.push(obj);
            }

            return await GuildConfig.update({
                guild_id,
                value: modroles,
                valueName: 'modroles',
            })
                .then(async (res) => {
                    resolve(
                        `✅ ${role_id} has been updated to ${
                            isAdmin ? 'Admin' : isMod ? 'Moderator' : 'Helper'
                        }.`
                    );
                })
                .catch((err) => {
                    reject(`❌ There was an error updating the mod roles.`);
                });
        });
    }

    generateButtons() {
        const isAdmin = 'isAdmin';
        const isAdminLabel = 'Admin';

        const isMod = 'isMod';
        const isModLabel = 'Moderator';

        const isHelper = 'isHelper';
        const isHelperLabel = 'Helper';

        const isRemove = 'isRemove';
        const isRemoveLabel = 'Remove';

        const adminButton = new ButtonBuilder()
            .setCustomId(isAdmin)
            .setLabel(isAdminLabel)
            .setStyle(ButtonStyle.Primary);

        const modButton = new ButtonBuilder()
            .setCustomId(isMod)
            .setLabel(isModLabel)
            .setStyle(ButtonStyle.Primary);

        const helperButton = new ButtonBuilder()
            .setCustomId(isHelper)
            .setLabel(isHelperLabel)
            .setStyle(ButtonStyle.Primary);

        const removeButton = new ButtonBuilder()
            .setCustomId(isRemove)
            .setLabel(isRemoveLabel)
            .setStyle(ButtonStyle.Danger);

        return {
            isAdmin: adminButton,
            isMod: modButton,
            isHelper: helperButton,
            isRemove: removeButton,
        };
    }
}

module.exports.Modroles = new Modroles();
