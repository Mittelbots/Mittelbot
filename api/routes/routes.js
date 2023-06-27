const auth = require('~api/auth/auth');

module.exports.getRoutes = async (req, res, type = 'get', bot) => {
    return new Promise(async (resolve) => {
        const fs = require('fs');
        const path = require('path');

        const request = req.originalUrl.split('?')[0];

        let routes = [];
        let authenticated = false;

        const files = fs.readdirSync(path.resolve(__dirname, `./${type}`));
        for (const file of files) {
            if (file.startsWith('index') || file.startsWith('.')) continue;
            const route = require(path.resolve(__dirname, `./${type}/${file}`));

            if (!route.config || routes.includes(route.config.path)) {
                console.error(`Route ${route.config.path} already exists`);
                continue;
            };

            if (route.config.method === type && route.config.path === request) {
                console.log(route.config);
                if (!route.config.bypassAuth) {
                    authenticated = auth(req, res);
                    if (!authenticated) break;
                }

                routes.push(route.config.path);
                
                try {
                    req.data.bot = bot;
                }catch(err) {
                    req.data = {
                        bot: bot,
                    }
                }

                console.info(`Request: ${request} from ${req.ip}`);
                require(path.resolve(__dirname, `./${type}/${file}`))(req, res);
                break;
            }
        }

        if (!authenticated) {
            return resolve(false);
        }

        if (!routes.includes(request)) {
            res.status(404).json({
                message: 'Not found. Check your request.',
            });
        }

        resolve(true);
    });
};
