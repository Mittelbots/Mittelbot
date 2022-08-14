const { getAllRoles } = require("../utils/functions/roles/getAllRoles");
const { getMemberInfoById, insertMemberInfo, updateMemberInfoById } = require("../utils/functions/data/getMemberInfo");

module.exports.guildMemberRemove = async ({member}) => {
  const member_info = await getMemberInfoById({
    guild_id: member.guild.id,
    user_id: member.id,
  });

  const allRoles = getAllRoles(member);
  console.log(member_info);

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