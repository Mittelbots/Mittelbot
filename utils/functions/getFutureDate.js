function getFutureDate(dbtime) {
    let futuredate;
    if(dbtime !== '') {
        futuredate = new Date();
        futuredate.setSeconds(futuredate.getSeconds() + dbtime);
        dbtime = futuredate.toLocaleString('de-DE', {
            timeZone: 'Europe/Berlin',
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        });
    }else {
        dbtime = 'Permanent'
    }
    return dbtime;
}

module.exports = {getFutureDate}