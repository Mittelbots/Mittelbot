const globalConfig = require('../Models/globalConfig.model');

(async () => {
    globalConfig.findAll().then((data) => {
        if (data.length === 0) {
            globalConfig.create({
                id: 1,
                ignoreMode: false,
                disabled_commands: [],
            });
        } else {
            console.info('Global config already exists');
        }
    });
})();
