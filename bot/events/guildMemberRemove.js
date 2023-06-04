const { getAllRoles } = require('~utils/functions/roles/getAllRoles');
const MemberInfo = require('~utils/classes/MemberInfo');

module.exports.guildMemberRemove = async ({ member }) => {
    const member_info = await new MemberInfo().get({
        guild_id: member.guild.id,
        user_id: member.id,
    });

    const allRoles = getAllRoles(member);

    if (!member_info) {
        await new MemberInfo().add({
            guild_id: member.guild.id,
            user_id: member.user.id,
            user_joined: member.joinedTimestamp,
            member_roles: allRoles,
        });
    } else {
        await new MemberInfo().update({
            guild_id: member.guild.id,
            user_id: member.user.id,
            member_roles: allRoles,
        });
    }
};
