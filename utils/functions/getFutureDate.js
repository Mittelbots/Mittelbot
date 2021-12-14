function getFutureDate(dbtime) {
    let futuredate;
    if(dbtime !== '') {
        futuredate = new Date();
        futuredate.setSeconds(futuredate.getSeconds() + dbtime);
        dbtime = futuredate.toLocaleString('de-DE', {
            timeZone: 'Europe/Berlin'
        });
    }else {
        dbtime = 'Permanent'
    }
    return dbtime;
}

module.exports = {getFutureDate}