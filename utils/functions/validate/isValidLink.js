module.exports.isValidLink = (link) => {
    try {
        new URL(link);
        return true;
    } catch (err) {
        return false;
    }
};
