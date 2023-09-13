const { getRoutes } = require('./routes/routes');
const express = require('express');
const auth = require('./auth/auth');

class MittelbotApi {
    constructor(bot) {
        return new Promise(async (resolve) => {
            this.bot = bot;
            await this.create();
            await this.config();
            await this.routes();
            this.start();
            resolve(true);
        });
    }

    create() {
        return new Promise((resolve) => {
            this.app = express();
            resolve(true);
        });
    }

    config() {
        return new Promise((resolve) => {
            resolve(true);
        });
    }

    routes() {
        return new Promise((resolve) => {
            this.app.get('*', (req, res) => getRoutes(req, res, 'get', this.bot));
            this.app.post('*', (req, res) => getRoutes(req, res, 'post', this.bot));
            this.app.delete('*', (req, res) => getRoutes(req, res, 'delete', this.bot));
            this.app.put('*', (req, res) => getRoutes(req, res, 'put', this.bot));
            resolve(true);
        });
    }

    start() {
        this.app.listen(process.env.API_PORT, process.env.API_DOMAIN, () => {
            console.info(
                `http://${process.env.API_DOMAIN}:${process.env.API_PORT} server started on ${process.env.API_PORT}`
            );
        });

        process.once('SIGUSR2', function () {
            console.info('SIGUSR2 received, closing server');
            process.kill(process.pid, 'SIGUSR2');
        });

        process.on('beforeExit', () => {
            console.info('beforeExit received, closing server');
            process.exit();
        });
    }
}

module.exports = MittelbotApi;
