function getFutureDate(dbtime) {
    if (dbtime !== '') {
        const futuredate = new Date();
        futuredate.setSeconds(futuredate.getSeconds() + dbtime);
        dbtime = futuredate.getTime();
    } else {
        dbtime = 'Permanent';
    }
    return dbtime;
}

module.exports = { getFutureDate };
