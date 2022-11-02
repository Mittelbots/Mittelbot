const { SlashCommandBuilder } = require('discord.js');
const { hasPermission } = require('../../../utils/functions/hasPermissions');
const config = require('../../../src/assets/json/_config/config.json');
const { EmbedBuilder, SelectMenuBuilder, ActionRowBuilder } = require('discord.js');
const {
    gernerateApplyId,
    getFormById,
    getFormByGuild,
} = require('../../../utils/functions/data/apply_form');

module.exports.run = async ({ main_interaction, bot }) => {
    const hasPermissions = await hasPermission({
        guild_id: main_interaction.guild.id,
        adminOnly: true,
        modOnly: false,
        user: main_interaction.member,
        bot,
    });

    if (!hasPermissions) {
        return main_interaction
            .reply({
                content: `${config.errormessages.nopermission}`,
                ephemeral: true,
            })
            .catch((err) => {});
    }

    var applyid = main_interaction.options.getNumber('applyid');

    var apply = {};

    if (!applyid) {
        applyid = gernerateApplyId(main_interaction.guild.id);

        const all_applys = await getFormByGuild({
            guild_id: main_interaction.guild.id,
        });

        if (all_applys && all_applys.length >= 5) {
            return main_interaction
                .reply({
                    content: `You can only have 5 apply forms.`,
                    ephemeral: true,
                })
                .catch((err) => {});
        }
    } else {
        apply = await getFormById({
            guild_id: main_interaction.guild.id,
            apply_id: applyid,
        });
        if (!apply.apply)
            return main_interaction
                .reply({
                    content: `This apply form does not exist.`,
                    ephemeral: true,
                })
                .catch((err) => {});
        apply = apply.apply;
    }

    const newEmbed = new EmbedBuilder()
        .setTitle(apply.title || 'Add new application form')
        .setDescription(
            apply.description ||
                `You can change this Embed by selecting the options in the Dropdown Menu. \n Be sure to select a category where all application channels will be created in. \n If you don't want to create a form anymore, just ignore the message or delete it.`
        )
        .setColor(apply.color || '#0099ff')
        .setImage(
            apply.image || 'https://mlea-studies.org/wp-content/uploads/2019/08/application.jpg'
        )
        .setFooter({
            text: apply.footer || 'This is the footer',
        });

    if (apply.field1) {
        newEmbed.addFields([{ name: apply.field1.name, value: apply.field1.value }]);
    } else {
        newEmbed.addFields([
            {
                name: 'Titel, Description, Channel, Category (Name of Field 1)',
                value: 'All these four fields are required to let everything works perfectly. (Value of Field 1)',
            },
        ]);
    }

    if (apply.field2) {
        newEmbed.addFields([{ name: apply.field2.name, value: apply.field2.value }]);
    } else {
        newEmbed.addFields([
            {
                name: 'Each time you edit the Embed the form will be disabled until you save it again. (Name of Field 2)',
                value: 'But, each change will be edited into the new message automatically (Value of Field 2)',
            },
        ]);
    }

    const menu = new SelectMenuBuilder()
        .setCustomId('manage_apply')
        .setPlaceholder('Choose the options');

    menu.addOptions([
        {
            value: `title_${applyid}`,
            label: '## Titel ## Title of the embed REQUIRED',
        },
    ]);

    menu.addOptions([
        {
            value: `description_${applyid}`,
            label: '## Description ## Description of the embed REQUIRED',
        },
    ]);

    menu.addOptions([
        {
            value: `field1_${applyid}`,
            label: '## Field 1 ## Add something to the first Field',
        },
    ]);
    menu.addOptions([
        {
            value: `field2_${applyid}`,
            label: '## Field 2 ## Add something to the second Field',
        },
    ]);

    menu.addOptions([
        {
            value: `image_${applyid}`,
            label: '## Image ## Set an image for the embed [LINK ONLY + .jpg/.png]',
        },
    ]);

    menu.addOptions([
        {
            value: `footer_${applyid}`,
            label: '## Footer ## Set a footer for the embed',
        },
    ]);

    menu.addOptions([
        {
            value: `color_${applyid}`,
            label: '## Color ## Set the color for your embed (#FFFFF)',
        },
    ]);

    menu.addOptions([
        {
            value: `channel_${applyid}`,
            label: '## Channel ## Set the channel for the application form REQUIRED',
        },
    ]);

    menu.addOptions([
        {
            value: `category_${applyid}`,
            label: '## Category ID ## Set the category where the channels will be created in. REQUIRED',
        },
    ]);

    menu.addOptions([
        {
            value: `applylink_${applyid}`,
            label: '## Apply Link ## If you want to, set the link for an external application form',
        },
    ]);

    menu.addOptions([
        {
            value: `save_${applyid}`,
            label: '## Save ## Save the current embed and activate it.',
        },
    ]);

    main_interaction
        .reply({
            content: `Formid: ${applyid}`,
            embeds: [newEmbed],
            components: [
                new ActionRowBuilder({
                    components: [menu],
                }),
            ],
        })
        .catch((err) => {});
};

module.exports.data = new SlashCommandBuilder()
    .setName('apply')
    .setDescription('Generate a new Applicationform or edit an existing one')
    .addNumberOption((option) =>
        option
            .setName('applyid')
            .setDescription(
                'If you have already an application form, you can pass the id to it here'
            )
            .setRequired(false)
    );
