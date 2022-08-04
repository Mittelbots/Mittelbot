const opts = {
    errorEventName: 'error',
    logDirectory: './_logs', // NOTE: folder must exist and be writable...
    fileNamePattern: 'roll-<DATE>.log',
    dateFormat: 'YYYY.MM.DD'
};
const log = require('simple-node-logger').createRollingFileLogger(opts);

const debug_opts = {
    errorEventName: 'debug',
    logDirectory: './_dbug', // NOTE: folder must exist and be writable...
    fileNamePattern: 'roll-<DATE>.log',
    dateFormat: 'YYYY.MM.DD'
};
const debug_log = require('simple-node-logger').createRollingFileLogger(debug_opts);

module.exports = {log, debug_log};