const axios = require('axios');

module.exports = () => {
    console.log(process.env.BOT_AUTH_KEY, 'BOT_AUTH_KEY', process.env.BOT_AUTH_KEY.length < 1);
    if (process.env.BOT_AUTH_KEY.length < 1) {
        console.log('No auth key found. Generating one...');
        axios
            .get('http://localhost:5000/auth', {
                headers: {
                    accept: 'application/json',
                },
            })
            .then((res) => {
                process.env.BOT_AUTH_KEY = res.data.token;
                console.info('****Auth key generated!****');
                for (let i = 0; i < 6; i++) {
                    if (i === 3) {
                        console.info(res.data);
                        continue;
                    }
                    console.info('COPY THIS TOKEN AND INSERT IT IN YOUR ENVIRONMENT VARIABLES');
                }
            })
            .catch((err) => {
                console.log('Error while generating auth key');
                console.log(err.response.data);
            });
    }
};
