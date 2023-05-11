module.exports.isValidDiscordInvite = (link) => {
    const regex =
        /^(?:https?:\/\/)?(?:discord\.(gg|io|me|li)|discordapp\.com\/invite)\/.+[a-zA-Z\d]/;

    return regex.test(link);
};
