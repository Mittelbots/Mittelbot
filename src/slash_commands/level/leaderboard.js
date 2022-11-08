<<<<<<< HEAD
const { SlashCommandBuilder } = require('discord.js');
const { EmbedBuilder } = require('discord.js');
const { Levelsystem } = require('../../../utils/functions/data/levelsystemAPI');
module.exports.run = async ({ main_interaction, bot }) => {
=======
const { SlashCommandBuilder } = require("discord.js");
const { EmbedBuilder } = require("discord.js");
const { getRank } = require("../../../utils/functions/levelsystem/levelsystemAPI");
module.exports.run = async ({main_interaction, bot}) => {

>>>>>>> 3f3ba2cc101956b6e3b46b465fe39e90b376562f
    await main_interaction.deferReply({
        ephemeral: true
    })

<<<<<<< HEAD
    const leaderboard = await Levelsystem.getRank({
        guild_id: main_interaction.guild.id,
=======
    const leaderboard = await getRank({
        guild_id: main_interaction.guild.id
>>>>>>> 3f3ba2cc101956b6e3b46b465fe39e90b376562f
    });
    
    const guild = bot.guilds.cache.get(main_interaction.guild.id)
    const lb_embed = new EmbedBuilder()
        .setTitle(`Top 10 members of ${guild.name}'s leaderboard.`)
        .setColor('04ff00') //GREEN
        .setTimestamp()

    var isInTopTen = false;
    var userRank;
    var userXP;
    var userLevel;

    if(leaderboard.length === 0) {
        return main_interaction.followUp({
            content: '❌ There\'s no one who is ranked. Write your first messages first.'
        }).catch(err => {})
    }
    2;
    for (let i in leaderboard) {
<<<<<<< HEAD
        console.log(leaderboard[i]);
        if (leaderboard[i][0] === main_interaction.user.id) {
            if (i <= 10) {
=======
        if(leaderboard[i][0] === main_interaction.user.id) {
            if(i <= 10) {
>>>>>>> 3f3ba2cc101956b6e3b46b465fe39e90b376562f
                isInTopTen = true;
            }
            userRank = Number(i) + 1;
            userXP = leaderboard[i][1];
            userLevel = Number(leaderboard[i][2]) + 1
        }
        if(i >= 10) continue;
        lb_embed.addFields([
            {name: `Rank: ${Number(i) + 1}`, value: `<@${leaderboard[i][0]}>\n**XP:** \`${leaderboard[i][1]}\` - **Level:** \`${Number(leaderboard[i][2])}\` - **Messages:** \`${leaderboard[i][3]}\` `}
        ])
    }

    if(!isInTopTen) {
        lb_embed.addFields([
            {name: `Your current rank: ${userRank}`, value: `XP: ${userXP}  Level: ${userLevel}`}
        ])
    }

    return main_interaction.followUp({
        embeds: [lb_embed]
    }).catch(err => {})
}

module.exports.data = new SlashCommandBuilder()
	.setName('leaderboard')
	.setDescription('See the guild Leaderboard.')