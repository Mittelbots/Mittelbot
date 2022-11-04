const { giveAllRoles } = require('../utils/functions/roles/giveAllRoles');
const { errorhandler } = require('../utils/functions/errorhandler/errorhandler');
const { MemberInfo } = require('../utils/functions/data/MemberInfo');
const { sendWelcomeMessage } = require('../utils/functions/data/welcomechannel');
const { GuildConfig } = require('../utils/functions/data/Config');
const { Infractions } = require('../utils/functions/data/Infractions');
const { Joinroles } = require('../utils/functions/data/joinroles');

module.exports.guildMemberAdd = async (member, bot) => {
    const config = GuildConfig.get(member.guild.id);

    try {
        disabled_modules = config.disabled_modules;

        if (disabled_modules.indexOf('welcomemessage') === -1) {
            sendWelcomeMessage({
                guild_id: member.guild.id,
                bot,
                joined_user: member,
            });
        }
    } catch (err) {}

    if (member.user.bot) return;

    const memberInfo = await MemberInfo.get({
        guild_id: member.guild.id,
        user_id: member.id,
    });
    if (memberInfo.error) return;
    else if (!memberInfo) {
        await MemberInfo.add({
            guild_id: member.guild.id,
            user_id: member.user.id,
            user_joined: new Date().getTime(),
            member_roles: '[]',
        });
    }

    if (memberInfo.user_joined == null) {
        await MemberInfo.update({
            guild_id: memberInfo.guild_id,
            user_id: memberInfo.user_id,
            user_joined: new Date().getTime(),
        });
    }

    var userInfractions = await Infractions.getOpen({
        user_id: member.user.id,
        guild_id: member.guild.id,
    });

    userInfractions = userInfractions.filter((inf) => inf.mute) || [];

    if (userInfractions.length !== 0) {
        member.roles
            .add([member.guild.roles.cache.find((r) => r.name === 'Muted')])
            .catch((err) => {});
    } else {
        let user_roles = await memberInfo.member_roles;
        if (!user_roles) return;
        user_roles = JSON.parse(user_roles);

        const indexOfMuteRole = user_roles.indexOf(
            member.guild.roles.cache.find((r) => r.name === 'Muted').id
        );
        if (user_roles !== null && indexOfMuteRole !== -1) {
            user_roles = await user_roles.filter(
                (r) => r !== member.guild.roles.cache.find((r) => r.name === 'Muted').id
            );
        }
        setTimeout(async () => {
            if (user_roles) await giveAllRoles(member.id, member.guild, user_roles);
        }, 2000);

        const joinroles = Joinroles.get({
            guild_id: member.guild.id,
        });

        if (joinroles.length == 0) return;

        for (let i in joinroles) {
            let j_role = await member.guild.roles.cache.find((r) => r.id === joinroles[i]);
            try {
                await member.roles.add(j_role).catch((err) => {});
            } catch (err) {
                return;
            }
        }
        errorhandler({
            fatal: false,
            message: `I have added the join roles to ${member.user.username} in ${member.guild.name}`,
        });
    }
};
