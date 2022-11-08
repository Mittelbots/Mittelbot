const { restartBot } = require("../../../bot/core/core");
const { errorhandler } = require("./errorhandler");


module.exports.processErrorHandler = () => {
    process.on('unhandledRejection', async err => {
        errorhandler({
          err,
          fatal: true
        })

        errorhandler({
<<<<<<< HEAD
            err: `---- BOT RESTARTED DUE ERROR..., ${new Date()}`,
            fatal: true,
        });

        //await restartBot();
    });

    process.on('uncaughtException', async (err) => {
=======
          err: `---- BOT RESTARTED DUE ERROR..., ${new Date()}`,
          fatal: true
      });
      
        await restartBot();
      });
      
      process.on('uncaughtException', async err => {
>>>>>>> 3f3ba2cc101956b6e3b46b465fe39e90b376562f
        errorhandler({
          err: '----BOT CRASHED-----',
          fatal: true
        });
        errorhandler({
          err,
          fatal: true
        })

<<<<<<< HEAD
        // errorhandler({
        //     err: `---- BOT RESTARTED DUE ERROR..., ${new Date()}`,
        //     fatal: true,
        // });

        //await restartBot();
    });
};
=======
        errorhandler({
          err: `---- BOT RESTARTED DUE ERROR..., ${new Date()}`,
          fatal: true
      });
      
        await restartBot();
        
      })
}
>>>>>>> 3f3ba2cc101956b6e3b46b465fe39e90b376562f
