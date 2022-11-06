const { giveAllRoles } = require('../utils/functions/roles/giveAllRoles');
const { errorhandler } = require('../utils/functions/errorhandler/errorhandler');
const { MemberInfo } = require('../utils/functions/data/MemberInfo');
const { sendWelcomeMessage } = require('../utils/functions/data/welcomechannel');
const { GuildConfig } = require('../utils/functions/data/Config');
const { Infractions } = require('../utils/functions/data/Infractions');
const { Joinroles } = require('../utils/functions/data/Joinroles');

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
        user_id: member.user.id,
    });

    if (memberInfo.length === 0) {
        await MemberInfo.add({
            guild_id: member.guild.id,
            user_id: member.user.id,
            user_joined: new Date().getTime(),
            member_roles: [],
        });
    }

    if (memberInfo.user_joined == null) {
        await MemberInfo.update({
            guild_id: member.guild.id,
            user_id: member.user.id,
            user_joined: new Date().getTime(),
        });
    }

    const userInfractions =
        (
            await Infractions.getOpen({
                user_id: member.user.id,
                guild_id: member.guild.id,
            })
        ).filter((inf) => inf.mute) || [];

    if (userInfractions.length !== 0) {
        member.roles
            .add([member.guild.roles.cache.find((r) => r.name === 'Muted')])
            .catch((err) => {});
    } else {
        const user_roles = JSON.parse(memberInfo.member_roles);
        if (!user_roles) return;

        const indexOfMuteRole = user_roles.indexOf(
            member.guild.roles.cache.find((r) => r.name === 'Muted').id
        );

        let newUserRoles = user_roles;
        if (user_roles && indexOfMuteRole !== -1) {
            await newUserRoles.filter(
                (r) => r !== member.guild.roles.cache.find((r) => r.name === 'Muted').id
            );
        }

        setTimeout(async () => {
            if (newUserRoles) await giveAllRoles(member.id, member.guild, newUserRoles);
        }, 2000);

        const joinroles = await Joinroles.get({
            guild_id: member.guild.id,
        });
        if (joinroles.length === 0) return;

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
