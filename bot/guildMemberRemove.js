const { getAllRoles } = require('../utils/functions/roles/getAllRoles');
const { MemberInfo } = require('../utils/functions/data/MemberInfo');

module.exports.guildMemberRemove = async ({ member }) => {
    const member_info = await MemberInfo.get({
        guild_id: member.guild.id,
        user_id: member.id,
    });

    const allRoles = getAllRoles(member);

    if (!member_info) {
        await MemberInfo.add({
            guild_id: member.guild.id,
            user_id: member.user.id,
            user_joined: member.joinedTimestamp,
            member_roles: JSON.stringify(allRoles),
        });
    } else {
        await MemberInfo.update({
            guild_id: member.guild.id,
            user_id: member.user.id,
            member_roles: JSON.stringify(allRoles),
        });
    }
};
