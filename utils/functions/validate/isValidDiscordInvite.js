module.exports.isValidDiscordInvite = (link) => {
    const regexWithHttp =
        /(https?:\/\/)?(www\.)?(discord\.(gg|io|me|li)|discordapp\.com\/invite)\/.+[a-zA-Z0-9]/;

    const regexWithoutHttp = /(discord\.(gg|io|me|li)|discordapp\.com\/invite)\/.+[a-zA-Z0-9]/;
    return regexWithHttp.test(link) || regexWithoutHttp.test(link);
};
