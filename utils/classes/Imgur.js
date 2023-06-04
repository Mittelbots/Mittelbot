const { default: ImgurClient } = require('imgur');

module.exports = class Imgur {
    #imgurClient;

    constructor() {
        this.#imgurClient = new ImgurClient({
            clientId: process.env.IMGUR_CLIENT_ID,
            clientSecret: process.env.IMGUR_CLIENT_SECRET,
        });
    }

    uploadImage(image, title, description) {
        return new Promise((resolve, reject) => {
            this.#imgurClient
                .upload({
                    image: image,
                    title: title,
                    description: description,
                })
                .then((json) => {
                    resolve(json.data.link);
                })
                .catch((err) => {
                    reject(err);
                });
        });
    }
};
