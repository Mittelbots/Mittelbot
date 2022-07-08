const { SlashCommandBuilder } = require("@discordjs/builders");
const { MessageEmbed } = require("discord.js");
const { getRankByGuildId } = require("../../../utils/functions/levelsystem/levelsystemAPI");

module.exports.run = async ({main_interaction, bot}) => {

    const leaderboard = await getRankByGuildId({
        guild_id: main_interaction.guild.id
    });

    const guild = bot.guilds.cache.get(main_interaction.guild.id)

    const lb_embed = new MessageEmbed()
        .setTitle(`Top 10 members of ${guild.name}'s leaderboard.`)
        .setColor('GREEN')
        .setTimestamp()

    var isInTopTen = false;
    var userRank;
    var userXP;
    var userLevel;

    for (let i in leaderboard) {
        if(leaderboard[i].user_id === main_interaction.user.id) {
            isInTopTen = true;
            userRank = Number(i) + 1;
            userXP = leaderboard[i].xp;
            userLevel = Number(leaderboard[i].level_announce) + 1
        }
        if(i > 10) continue;
        lb_embed.addField(`Rank: ${Number(i) + 1}`, `<@${leaderboard[i].user_id}>\nXP: ${leaderboard[i].xp} \nLevel: ${Number(leaderboard[i].level_announce) + 1}`)
    }

    if(!isInTopTen) {
        lb_embed.addField(`Your current rank: ${userRank}`, `XP: ${userXP}\nLevel: ${userLevel}`)
    }

    return main_interaction.reply({
        embeds: [lb_embed]
    }).catch(err => {})
}

module.exports.data = new SlashCommandBuilder()
	.setName('leaderboard')
	.setDescription('See the guild Leaderboard.')