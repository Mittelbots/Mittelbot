const { errorhandler } = require("./errorhandler");
const { restartBot }  = require('../../../bot/core/core');

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
      
        restartBot();
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

        errorhandler({
          err: `---- BOT RESTARTED DUE ERROR..., ${new Date()}`,
          fatal: true
      });
      
        restartBot();
        
      })
}