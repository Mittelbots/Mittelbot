const { EmbedBuilder } = require('discord.js');
const MemberInfo = require('~utils/classes/MemberInfo');
const { delay } = require('~utils/functions/delay');

module.exports = class Afk {
    constructor() {}

    handle(main_interaction) {
        const reason = main_interaction.fields.fields.get('afk_reason').value || 'No reason given.';
        let date = new Date();
        date = date.setHours(date.getHours() - 1);

        const obj = {
            user_id: main_interaction.user.id,
            reason: reason,
            time: Math.floor(date / 1000) + 3600,
            guild_id: main_interaction.guild.id,
        };

        this.set(main_interaction.user.id, main_interaction.guild.id, obj);

        return main_interaction
            .reply({
                embeds: [
                    new EmbedBuilder().setDescription(
                        global.t.trans(['success.utils.afk.set', reason], main_interaction.guild.id)
                    ),
                ],
                ephemeral: true,
            })
            .catch(() => {});
    }

    isAfk(user_id, guild_id) {
        return new Promise(async (resolve, reject) => {
            const member = await new MemberInfo().get({ guild_id, user_id });

            const isAfk = member.afk || {};
            if (Object.keys(isAfk).length === 0 && isAfk.constructor === Object) {
                return resolve(false);
            }
            resolve(isAfk);
        });
    }

    remove(user_id, guild_id) {
        return new Promise(async (resolve, reject) => {
            await new MemberInfo()
                .updateAfk({ guild_id, user_id, afk: {} })
                .then((res) => {
                    resolve(true);
                })
                .catch((err) => {
                    reject(err);
                });
        });
    }

    set(user_id, guild_id, afk) {
        return new Promise(async (resolve, reject) => {
            await new MemberInfo()
                .updateAfk({ guild_id, user_id, afk })
                .then((res) => {
                    resolve(true);
                })
                .catch((err) => {
                    reject(err);
                });
        });
    }

    check({ message }) {
        return new Promise(async (resolve) => {
            const mentions = message.mentions.users;
            const author = message.author;

            const isAuthorAfk = await this.isAfk(author.id, message.guild.id);
            if (isAuthorAfk) {
                this.remove(author.id, message.guild.id);
                message
                    .reply({
                        embeds: [
                            new EmbedBuilder()
                                .setDescription(
                                    global.t.trans(
                                        [
                                            'info.utils.afk.noLongerAfk',
                                            isAuthorAfk.reason,
                                            isAuthorAfk.time,
                                        ],
                                        message.guild.id
                                    )
                                )
                                .setColor(global.t.trans(['general.colors.success'])),
                        ],
                    })
                    .then(async (msg) => {
                        await delay(8000);
                        msg.delete().catch((err) => {});
                    })
                    .catch((err) => {});
                return resolve(false);
            }

            let isAFK = false;

            if (mentions.size === 0) return resolve(isAFK);

            mentions.map(async (user) => {
                if (user.id === author.id) return;
                const isUserAFK = await this.isAfk(user.id, message.guild.id);
                if (isUserAFK) {
                    return (isAFK = isUserAFK);
                }
            });

            return resolve(isAFK);
        });
    }
};
