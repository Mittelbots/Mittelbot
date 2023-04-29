const { giveAllRoles } = require('../utils/functions/roles/giveAllRoles');
const { errorhandler } = require('../utils/functions/errorhandler/errorhandler');
const { MemberInfo } = require('../utils/functions/data/MemberInfo');
const { sendWelcomeMessage } = require('../utils/functions/data/welcomechannel');
const { GuildConfig } = require('../utils/functions/data/Config');
const { Infractions } = require('../utils/functions/data/Infractions');
const { Joinroles } = require('../utils/functions/data/Joinroles');
const Modules = require('../utils/functions/data/Modules');

module.exports.guildMemberAdd = async (member, bot) => {
    const modulesApi = new Modules(member.guild.id, bot);
    if (await modulesApi.checkEnabled(modulesApi.getDefaultSettings().welcomeUtils.name)) {
        await sendWelcomeMessage({
            guild_id: member.guild.id,
            bot,
            joined_user: member,
        }).catch((err) => {});
    }

    if (member.user.bot) return;

    const memberInfo = await MemberInfo.get({
        guild_id: member.guild.id,
        user_id: member.user.id,
    });

    if (!memberInfo) {
        await MemberInfo.add({
            guild_id: member.guild.id,
            user_id: member.user.id,
            user_joined: new Date(),
            member_roles: [],
        });
    } else {
        if (memberInfo.user_joined == null) {
            await MemberInfo.update({
                guild_id: member.guild.id,
                user_id: member.user.id,
                user_joined: new Date(),
            });
        }
    }

    const userInfractions =
        (
            await Infractions.getOpen({
                user_id: member.user.id,
                guild_id: member.guild.id,
            })
        ).filter((inf) => inf.mute) || [];

    if (userInfractions.length !== 0) {
        return member.roles
            .add([member.guild.roles.cache.find((r) => r.name === 'Muted')])
            .catch((err) => {});
    }

    if (!memberInfo) return;
    const user_roles = memberInfo.member_roles;

    if (user_roles.length > 0) {
        let indexOfMuteRole = -1;
        try {
            indexOfMuteRole = user_roles.indexOf(
                member.guild.roles.cache.find((r) => r.name === 'Muted').id
            );
        } catch (err) {
            // no mute role found
        }

        const newUserRoles = user_roles;
        if (user_roles && indexOfMuteRole !== -1) {
            await newUserRoles.filter(
                (r) => r !== member.guild.roles.cache.find((r) => r.name === 'Muted').id
            );
        }

        setTimeout(async () => {
            if (newUserRoles) await giveAllRoles(member.id, member.guild, newUserRoles);
        }, 2000);
    }

    const joinroles = await Joinroles.get({
        guild_id: member.guild.id,
    });
    if (joinroles.length === 0) return;

    for (let i in joinroles) {
        const joinrole = await member.guild.roles.cache.find((r) => r.id === joinroles[i]);
        await member.roles.add(joinrole).catch((err) => {});
    }
    errorhandler({
        fatal: false,
        message: `I have added the join roles to ${member.user.username} in ${member.guild.name}`,
    });
};
