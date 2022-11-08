function getFutureDate(dbtime) {
<<<<<<< HEAD
    if (dbtime !== '') {
        const futuredate = new Date();
        futuredate.setSeconds(futuredate.getSeconds() + dbtime);
        dbtime = futuredate.getTime();
    } else {
        dbtime = 'Permanent';
=======
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
>>>>>>> 3f3ba2cc101956b6e3b46b465fe39e90b376562f
    }
    return dbtime;
}

module.exports = {getFutureDate}