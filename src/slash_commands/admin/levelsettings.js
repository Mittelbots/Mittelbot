const { SlashCommandBuilder } = require("discord.js");
const { updateConfig, updateGuildConfig, getGuildConfig } = require("../../../utils/functions/data/getConfig");
const {
    hasPermission
} = require('../../../utils/functions/hasPermissions');
const config = require('../../../src/assets/json/_config/config.json');

module.exports.run = async ({main_interaction, bot}) => {

    const hasPermissions = await hasPermission({
        guild_id: main_interaction.guild.id,
        adminOnly: true,
        modOnly: false,
        user: main_interaction.member
    });
    if (!hasPermissions) {
        return main_interaction.reply({
            content: `<@${main_interaction.user.id}> ${config.errormessages.nopermission}`,
            ephemeral: true
        }).catch(err => {});
    }

    switch (main_interaction.options.getSubcommand()) {

        case 'mode':
            const mode = main_interaction.options.getString('mode');

            const updated = await updateConfig({
                guild_id: main_interaction.guild.id,
                value: mode,
                valueName: "levelsettings"
            });

            if(updated) {
                return main_interaction.reply({
                    content: '✅ Successfully saved your level config to ' + mode,
                    ephemeral: true
                })
            }else {
                return main_interaction.reply({
                    content: '❌ Somethings went wrong while changing your level confit to ' + mode,
                    ephemeral: true
                })
            }
        
        case 'blacklistchannels':
            var channels = [];
            for(let i = 1; i <= 5; i++) {
                const channel = main_interaction.options.getChannel(`channel${i}`);
                if(channel) {
                    channels.push(channel);
                }
            }
 
            const guilConfig = await getGuildConfig({
                guild_id: main_interaction.guild.id
            });


            var levelsettings;
            if(!guilConfig.settings.levelsettings) {
                guilConfig.settings.levelsettings = {}
            }
            
            try {
                levelsettings = JSON.parse(guilConfig.settings.levelsettings);
            }catch(err) {
                levelsettings = {};
            }

            if(!levelsettings.blacklistchannels) {
                levelsettings.blacklistchannels = [];
            }


            if(main_interaction.options.getString('clear')) {

                for(let i = 0; i < channels.length; i++) {
                    const index = levelsettings.blacklistchannels.indexOf(channels[i].id);
                    if(index > -1) {
                        levelsettings.blacklistchannels.splice(index, 1);
                    }
                }

            }else {
                for(let i = 0; i < channels.length; i++) {
                    if(!levelsettings.blacklistchannels.includes(channels[i].id)) {
                        levelsettings.blacklistchannels.push(channels[i].id);
                    }
                }
            }

            updateGuildConfig({
                guild_id: main_interaction.guild.id,
                value: JSON.stringify(levelsettings),
                valueName: "levelsettings"
            }).then(() => {
                return main_interaction.reply({
                    content: '✅ Successfully saved your level config.',
                    ephemeral: true
                })
            }).catch(err => {
                return main_interaction.reply({
                    content: '❌ Somethings went wrong while saving your level config.',
                    ephemeral: true
                })
            })

    }

}

module.exports.data = new SlashCommandBuilder()
	.setName('levelsettings')
	.setDescription('Translate messages from one language to another into a given Channel.')
    .addSubcommand(command =>
        command
        .setName('mode')
        .setDescription('Select your mode for the levels. Easy, normal, hard.')
        .addStringOption(dmcau =>
            dmcau
            .setName('mode')
            .setDescription('Easy: Fast level up, normal: normal time to level up, hard: Will take some time to level up')
            .setRequired(true)
            .addChoices({
                name: 'Easy',
                value: 'easy'
            })
            .addChoices({
                name: 'Normal',
                value: 'normal'
            })
            .addChoices({
                name: 'Hard',
                value: 'hard'
            })
        )
    )
    .addSubcommand(command =>
        command
        .setName('blacklistchannels')
        .setDescription('Select up to 5 channel at once which won\'t be affected by the leveling system.')
        .addChannelOption(channel => 
            channel
            .setName('channel1')
            .setDescription('Choose the channel.')
            .setRequired(true)
        )
        .addChannelOption(channel => 
            channel
            .setName('channel2')
            .setDescription('Choose the channel.')
            .setRequired(false)
        )
        .addChannelOption(channel => 
            channel
            .setName('channel3')
            .setDescription('Choose the channel.')
            .setRequired(false)
        )
        .addChannelOption(channel => 
            channel
            .setName('channel4')
            .setDescription('Choose the channel.')
            .setRequired(false)
        )
        .addChannelOption(channel => 
            channel
            .setName('channel5')
            .setDescription('Choose the channel.')
            .setRequired(false)
        )
        .addStringOption(string =>
            string
            .setName('clear')
            .setDescription('Clear your selected channels from the levelsettings.')
            .setRequired(false)
            .addChoices({
                name: 'Clear',
                value: 'clear'
            })
        )
    )