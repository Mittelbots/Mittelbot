const axios = require("axios");
const {
  randomUUID,
  Hash
} = require("crypto");
const url = require('url');
const database = require("../../../../src/db/db");
module.exports = ({app}) => {
  // Callback endpoint.
  app.get("/callback", async (req, res, ) => {
    const {
      code
    } = req.query;
    if (code) {
      const formData = new url.URLSearchParams({
        client_id: app.settings.config.id,
        client_secret: app.settings.config.clientSecret,
        grant_type: "authorization_code",
        code: code.toString(),
        redirect_uri: app.settings.callbackUrl,
      })

      try {
        var response = await axios.post('https://discord.com/api/v8/oauth2/token', formData.toString(), {
          headers: {
            "Content-Type": "application/x-www-form-urlencoded"
          }
        })
      } catch (err) {
        if (err.response.status !== 200) {
          return res.sendStatus(400);
        }
      }


      try {
        //send request to discord and get the email
        var user = await axios.get(`https://discord.com/api/v8/users/@me`, {
          headers: {
            Authorization: `Bearer ${response.data.access_token}`
          }
        })
      } catch (err) {
        if (err.response.status !== 200) {
          return res.sendStatus(400);
        }
      }



      if (user) {
        const loginToken = randomUUID();
        const jwt = require("jsonwebtoken");

        const token = jwt.sign({
          id: user.data.id,
          email: user.data.email,
          username: user.data.username,
          discriminator: user.data.discriminator,
          avatar: user.data.avatar,
          loginToken,
          access_token: response.data.access_token,
          refresh_token: response.data.refresh_token,
        }, process.env.JWT_SECRET, {
          expiresIn: "7d"
        });

        const userExists = await database.query(`SELECT id FROM dashboard_users WHERE email = ?`, [user.data.email]);

        if (userExists.length === 0) {
          await database.query(`INSERT IGNORE INTO dashboard_users (user_id, username, email, verified, loginToken) VALUES (?, ?, ?, ?, ?);`, [user.data.id, user.data.username, user.data.email, !!+user.data.verified, token])
            .catch(err => {
              console.log(err);
              return res.redirect(app.settings.config.route.homepage.path + "?error=true&message=Something went wrong, please try again.");
            })
        } else {
          await database.query(`UPDATE dashboard_users SET loginToken = ? WHERE email = ?`, [token, user.data.email])
            .catch(err => {
              console.log(err);
              return res.redirect(app.settings.config.route.homepage.path + "?error=true&message=Something went wrong, please try again.");
            })
        }
  

        res.cookie("token", token, {
          expire: 1000 * 60 * 60 * 24 * 7,
        });
        return res.redirect(app.settings.config.route.dashboard.path);
      }
    } else {
      res.redirect(app.settings.config.route.homepage.path);
    }
  });
}