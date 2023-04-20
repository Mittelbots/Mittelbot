const { passwordConfig } = require('../_config/utils/password');
const { EmbedBuilder } = require('discord.js');

module.exports.run = async ({ main_interaction, bot }) => {
    await main_interaction.deferReply({ ephemeral: true }).catch((err) => {});

    const options = {
        defaultLength: 16,
        minLength: 8,
        maxLength: 64,
    };

    const length = main_interaction.options.getInteger('length') || options.defaultLength;

    if (length < 8 || length > 64) {
        await main_interaction
            .followUp({
                embeds: [
                    new EmbedBuilder()
                        .setDescription(
                            global.t.trans(
                                [
                                    'error.utils.password.notValidLength',
                                    options.minLength,
                                    options.maxLength,
                                ],
                                main_interaction.guild.id
                            )
                        )
                        .setColor(global.t.trans(['general.colors.error'])),
                ],
                ephemeral: true,
            })
            .catch((err) => {});
        return;
    }

    const password = (maxLength) => {
        let result = '';
        const characters =
            'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+~|}{[]:;?><,./-=';
        const charactersLength = characters.length;
        for (let i = 0; i < maxLength; i++) {
            result += characters.charAt(Math.floor(Math.random() * charactersLength));
        }
        return result;
    };

    const generatedPassword = password(length);

    await main_interaction
        .followUp({
            content: `\`${generatedPassword}\``,
            embeds: [
                new EmbedBuilder()
                    .setDescription(
                        global.t.trans(
                            ['success.utils.password.generated', generatedPassword],
                            main_interaction.guild.id
                        )
                    )
                    .addFields(
                        global.t.trans(
                            ['info.utils.password.removeBackticks'],
                            main_interaction.guild.id
                        )
                    )
                    .setColor(global.t.trans(['general.colors.success'])),
            ],
            ephemeral: true,
        })
        .catch(() => {});
};

module.exports.data = passwordConfig;
