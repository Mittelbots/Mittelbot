<<<<<<< HEAD
const { getAllRoles } = require('../utils/functions/roles/getAllRoles');
const { MemberInfo } = require('../utils/functions/data/MemberInfo');

module.exports.guildMemberRemove = async ({ member }) => {
    const member_info = await MemberInfo.get({
        guild_id: member.guild.id,
        user_id: member.id,
    });
=======
const { getAllRoles } = require("../utils/functions/roles/getAllRoles");
const { getMemberInfoById, insertMemberInfo, updateMemberInfoById } = require("../utils/functions/data/getMemberInfo");

module.exports.guildMemberRemove = async ({member}) => {
  const member_info = await getMemberInfoById({
    guild_id: member.guild.id,
    user_id: member.id,
  });
>>>>>>> 3f3ba2cc101956b6e3b46b465fe39e90b376562f

  const allRoles = getAllRoles(member);

<<<<<<< HEAD
    if (!member_info) {
        await MemberInfo.add({
            guild_id: member.guild.id,
            user_id: member.user.id,
            user_joined: member.joinedTimestamp,
            member_roles: allRoles,
        });
    } else {
        await MemberInfo.update({
            guild_id: member.guild.id,
            user_id: member.user.id,
            member_roles: allRoles,
        });
    }
};
=======
  if(!member_info) {
    await insertMemberInfo({
      guild_id: member.guild.id,
      user_id: member.user.id,
      user_joined: member.joinedTimestamp,
      member_roles: JSON.stringify(allRoles),
    })
  }else {
    await updateMemberInfoById({
      guild_id: member.guild.id,
      user_id: member.user.id,
      member_roles: JSON.stringify(allRoles),
    })
  }
}
>>>>>>> 3f3ba2cc101956b6e3b46b465fe39e90b376562f
