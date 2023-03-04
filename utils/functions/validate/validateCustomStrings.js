module.exports.validateCustomStrings = ({ string, joined_user }) => {
    if (!string || string.length === 0) return null;

    let isName = string.search('{name}');
    let isMention = string.search('{mention}');
    let isGuild = string.search('{guild}');
    let isCount = string.search('{count}');
    let isEveryone = string.search('{everyone}');
    let isHere = string.search('{here}');
    let isPfp = string.search('{pfp}');

    switch (true) {
        case isName !== -1:
            string = string.replaceAll('{name}', joined_user.user.username);
        case isMention !== -1:
            string = string.replaceAll('{mention}', `<@${joined_user.user.id}>`);
        case isGuild !== -1:
            string = string.replaceAll('{guild}', joined_user.guild.name);
        case isCount !== -1:
            string = string.replaceAll(
                '{count}',
                joined_user.guild.members.cache.filter((member) => !member.user.bot).size
            );
        case isEveryone !== -1:
            string = string.replaceAll('{everyone}', `@everyone`);
        case isHere !== -1:
            string = string.replaceAll('{here}', `@here`);
        case isPfp !== -1:
            string = string.replaceAll(
                '{pfp}',
                joined_user.user.displayAvatarURL({ format: 'png', dynamic: true })
            );
    }
    return string;
};
