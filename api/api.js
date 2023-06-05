const { getRoutes } = require('./routes/routes');
const express = require('express');
const auth = require('./auth/auth');

class MittelbotApi {
    constructor() {
        return new Promise(async (resolve) => {
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
            this.app.get('/init', (req, res) => {
                this.bot = req.data.bot;
            });

            this.app.get('*', (req, res) => getRoutes(req, res, 'get'));
            this.app.post('*', (req, res) => getRoutes(req, res, 'post'));
            this.app.delete('*', (req, res) => getRoutes(req, res, 'delete'));
            this.app.put('*', (req, res) => getRoutes(req, res, 'put'));
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
