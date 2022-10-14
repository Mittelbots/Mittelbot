import { config } from './config.js';

export class Information {
    #information = {
        name: 'ChangerJS',
        Author: 'www.blackdayz.de',
        Version: '0.0.5',
        License: 'OpenSource',
        Type: 'Library',
    };
    constructor() {
        if (config.InfoMessage) console.info(JSON.stringify(this.#information, null, 2));
    }
}
