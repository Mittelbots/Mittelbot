function getModTime(time) {
    let format;
    let dbtime;
    if (time.search('m') !== -1) {
        format = 'm';
        dbtime = (time.replace(format, '') * 60);
    } else if (time.search('h') !== -1) {
        format = 'h';
        dbtime = (time.replace(format, '') * 3600);
    } else if (time.search('d') !== -1) {
        format = 'd';
        dbtime = (time.replace(format, '') * 86400);
    } else if(time == '') {
        dbtime = '';
    }else {
        dbtime = false;
    }

    return dbtime;
}

module.exports = {getModTime}