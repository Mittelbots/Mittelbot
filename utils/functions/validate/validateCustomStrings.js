module.exports.validateCustomStrings = ({
    string,
    joined_user
}) => {
    if(!string) return '';
    if(string.length === 0) return '';
    
    let isName = string.search('{name}')
    let isMention = string.search('{mention}')
    let isGuild = string.search('{guild}')
    let isCount = string.search('{count}')
    let isEveryone = string.search('{everyone}')
    let isHere = string.search('{here}')
    let isPfp = string.search('{pfp}')

    switch(true) {
        case isName !== -1:
            string = string.replace('{name}', joined_user.user.username)
        case isMention !== -1:
            string = string.replace('{mention}', `<@${joined_user.id}>`)
        case isGuild !== -1:
            string = string.replace('{guild}', joined_user.guild.name)
        case isCount !== -1:
            string = string.replace('{count}', joined_user.guild.members.cache.filter(member => !member.user.bot).size)
        case isEveryone !== -1:
            string = string.replace('{everyone}', `@everyone`)
        case isHere !== -1:
            string = string.replace('{here}', `@here`)
        case isPfp !== -1:
            string = string.replace('{pfp}', joined_user.user.displayAvatarURL({format: 'png', dynamic: true}))
    }
    return string;
}