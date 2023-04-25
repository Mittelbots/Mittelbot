module.exports.isValidDiscordAttachmentsLink = (link) => {
    const regex = /^https:\/\/cdn\.discordapp\.com\/attachments\/\d+\/\d+\/\S+\.\w+$/;
    return regex.test(link);
};
