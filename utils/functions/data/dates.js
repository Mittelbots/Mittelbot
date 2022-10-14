module.exports.getCurrentFullDate = () => {
    return new Date().toLocaleString('de-DE', {
        timeZone: 'Europe/Berlin',
        hour12: false,
        hour: 'numeric',
        minute: 'numeric',
        second: 'numeric',
        year: 'numeric',
        month: 'numeric',
        day: 'numeric',
    });
};
