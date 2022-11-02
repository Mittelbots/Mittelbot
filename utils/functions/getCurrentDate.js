module.exports.getCurrentDate = ({ timestamp = new Date().getTime() }) => {
    return new Date(timestamp).toLocaleString('de-DE', {
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
    });
};
