const axios = require('axios');

module.exports = () => {
    console.log(process.env.BOT_AUTH_KEY)
            if(process.env.BOT_AUTH_KEY === ' ') {
                axios
                    .post('http://localhost:5000/auth', {
                        headers: {
                            accept: 'application/json',
                        },
                    })
                    .then((res) => {
                        for(let i = 0; i < 6; i++) {
                            if(i === 3) {
                                console.info(res.data);
                                continue;
                            }
                            console.info('COPY THIS TOKEN AND INSERT IT IN YOUR ENVIRONMENT VARIABLES');
                        }
                    })
                    .catch((err) => {
                        console.log(err.response.data);
                    });

            }
}