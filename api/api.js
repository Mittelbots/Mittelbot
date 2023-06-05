const { getRoutes } = require('./routes/get');
const { postRoutes } = require('./routes/post');
const { putRoutes } = require('./routes/put');
const { deleteRoutes } = require('./routes/delete');
const express = require('express');

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
            this.app.get('*', getRoutes);
            this.app.post('*', postRoutes);
            this.app.delete('*', deleteRoute);
            this.app.put('*', putRoutes);
            resolve(true);
        });
    }

    start() {
        this.app.listen(process.env.API_PORT, process.env.API_DOMAIN, () => {
            console.info(
                `http://${process.env.API_DOMAIN}:${process.env.API_PORT} server started on ${process.env.API_PORT}`
            );
        });

        process.once('SIGUSR2', function() {
            console.info('SIGUSR2 received, closing server');
            this.app.close();
            process.kill(process.pid, 'SIGUSR2');
        });

        process.on("beforeExit", () => {
            console.info('beforeExit received, closing server');
            this.app.close();
        });
    }
}

module.exports = MittelbotApi;