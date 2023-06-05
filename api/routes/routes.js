const auth = require('~api/auth/auth');

module.exports.getRoutes = async (req, res, type = 'get') => {
    return new Promise(async (resolve) => {
        const fs = require('fs');
        const path = require('path');
        const folders = fs.readdirSync(path.resolve(__dirname, './'));

        const request = req.originalUrl.split('?')[0];

        let routes = [];
        let authenticated = false;

        for (const folder of folders) {
            if (folder.endsWith('.js')) continue;

            const files = fs.readdirSync(path.resolve(__dirname, `./${folder}`));
            for (const file of files) {
                const route = require(path.resolve(__dirname, `./${folder}/${file}`));

                if (!route.config || routes.includes(route.config.path)) continue;

                if (route.config.method === type && route.config.path === request) {
                    console.log(route.config.path, request, route.config);
                    if (!route.config.bypassAuth) {
                        authenticated = await auth(req, res);
                        if (!authenticated) break;
                    }

                    routes.push(route.config.path);
                    require(path.resolve(__dirname, `./${folder}/${file}`))(req, res);
                    break;
                }
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
