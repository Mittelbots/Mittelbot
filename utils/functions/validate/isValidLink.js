module.exports.isValidLink = (link) => {
    const regex = /^(https?:\/\/)?([\w.-]+)\.([a-z]{2,6}\.?)(\/[\w.-]*)*\/?$/i;
    return regex.test(link);
};
