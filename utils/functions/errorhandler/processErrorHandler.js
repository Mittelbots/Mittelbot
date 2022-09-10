const { delay } = require("../delay/delay");
const { errorhandler } = require("./errorhandler");
const {
    spawn,
    exec
  } = require('child_process');

module.exports.processErrorHandler = () => {
    process.on('unhandledRejection', async err => {
        errorhandler({
          err,
          fatal: true
        })
      
        errorhandler({
          err: `---- BOT RESTARTED DUE ERROR..., ${new Date()}`,
          fatal: true
        });
      
        await delay(5000);
        spawn(process.argv[1], process.argv.slice(2), {
          detached: true,
          stdio: ['ignore', null, null]
        }).unref()
        process.exit()
      });
      
      process.on('uncaughtException', async err => {
        errorhandler({
          err: '----BOT CRASHED-----',
          fatal: true
        });
        errorhandler({
          err,
          fatal: true
        })
      
        await delay(5000);
        spawn(process.argv[1], process.argv.slice(2), {
          detached: true,
          stdio: ['ignore', null, null]
        }).unref()
      
        errorhandler({
          err: `---- BOT RESTARTED DUE ERROR..., ${new Date()}`,
          fatal: true
        });
      
        process.exit()
      })
}