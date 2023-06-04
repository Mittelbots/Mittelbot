const { EmbedBuilder } = require('discord.js');
const Imgur = require('~utils/classes/Imgur');
const { imgurConfig } = require('../_config/utils/imgur');
const {
    isValidDiscordAttachmentsLink,
} = require('~utils/functions/validate/isValidDiscordAttachmentsLink');

module.exports.run = async ({ main_interaction, bot }) => {
    const image = main_interaction.options.getString('image');
    const title = main_interaction.options.getString('title');
    const description = main_interaction.options.getString('description');

    const isValidLink = isValidDiscordAttachmentsLink(image);
    if (!isValidLink) {
        return main_interaction.reply({
            embeds: [
                new EmbedBuilder()
                    .setDescription(
                        global.t.trans(['error.utils.imgur.noValidLink'], main_interaction.guild.id)
                    )
                    .setColor(global.t.trans(['general.colors.error'])),
            ],
            ephemeral: true,
        });
    }

    const imgur = new Imgur();
    await imgur
        .uploadImage(image, title, description)
        .then((link) => {
            main_interaction.reply({
                embeds: [
                    new EmbedBuilder()
                        .setDescription(
                            global.t.trans(['info.utils.imgur', link], main_interaction.guild.id)
                        )
                        .setImage(link)
                        .setColor(global.t.trans(['general.colors.success'])),
                ],
                ephemeral: true,
            });
        })
        .catch((err) => {
            main_interaction.reply({
                embeds: [
                    new EmbedBuilder()
                        .setDescription(err.toString())
                        .setColor(global.t.trans(['general.colors.error'])),
                ],
                ephemeral: true,
            });
        });
};

module.exports.data = imgurConfig;
