function removeMention(mention) {
    return mention = mention.replaceAll('<', '').replaceAll('@', '').replaceAll('!', '').replaceAll('&', '').replaceAll('>', '');
}

module.exports = {removeMention}