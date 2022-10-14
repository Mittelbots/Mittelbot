function removeMention(mention) {
    return (mention = mention
        .replaceAll('<', '')
        .replaceAll('@', '')
        .replaceAll('!', '')
        .replaceAll('&', '')
        .replaceAll('#', '')
        .replaceAll('>', ''));
}

function removeHttp(link) {
    link = link.replaceAll('/', '').replaceAll(':', '');
    if (link.search('http://') !== -1) {
        return (link = link.replace('http', ''));
    } else {
        return (link = link.replace('https', ''));
    }
}

function removeEmojiTags(emoji) {
    emoji = emoji.replaceAll('<', '').replaceAll('>', '');
    emoji = emoji.split(':');
    return emoji[emoji.length - 1];
}

module.exports = {
    removeMention,
    removeHttp,
    removeEmojiTags,
};
