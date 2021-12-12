const { GuildMember, MessageEmbed } = require("discord.js")

module.exports = {
    name: 'guildMemberAdd',
    /**
     * 
     * @param {GuildMember} member 
     */
    execute(member)  {
       console.log(member)
    }
}