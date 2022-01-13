const opts = {
    errorEventName: 'error',
    logDirectory: './_logs', // NOTE: folder must exist and be writable...
    fileNamePattern: 'roll-<DATE>.log',
    dateFormat: 'YYYY.MM.DD'
};
const log = require('simple-node-logger').createRollingFileLogger(opts);

module.exports = {log};