const {
  checkAuth
} = require("../../../functions/checkAuth/checkAuth");
const {
  renderTemplate
} = require("../../../functions/renderTemplate/renderTemplate");
const {
  PermissionsBitField
} = require('discord.js');
const axios = require("axios");
const { getConfig } = require("../../../../utils/functions/data/getConfig");

module.exports = (app) => {
  // Dashboard endpoint.
  app.get("/dashboard", checkAuth, async (req, res) => {

    const user_guilds = await axios.get('https://discord.com/api/v8/users/@me/guilds', {
        headers: {
          Authorization: `Bearer ${req.user.access_token}`
        }
      })
      .catch(err => {
        err.response.status === 401 ? res.redirect(app.settings.config.route.homepage.path) : console.log(err.response);
      })

    req.user.guilds = []

    user_guilds.data.forEach(guild => {
      const guild_perms = new PermissionsBitField(guild.permissions);
      if(!guild_perms.has(PermissionsBitField.Flags.ManageGuild)) return;
      else {
        req.user.guilds.push(guild)
      }
    })

    renderTemplate(res, req, "settings/index.ejs", {
      guilds: req.user.guilds,
    }, app.settings.bot);
  });

  // Settings endpoint.
  app.get("/dashboard/:guildID", checkAuth, async (req, res) => {
    // We validate the request, check if guild exists, member is in guild and if member has minimum permissions, if not, we redirect it back.
    const guild = app.settings.bot.guilds.cache.get(req.params.guildID);
    if (!guild) return res.redirect("/dashboard");
    let member = guild.members.cache.get(req.user.id);
    if (!member) {
      try {
        const members = await guild.members.fetch()
        
        member = await members.get(req.user.id);
      } catch (err) {
        console.error(`Couldn't fetch the members of ${guild.id}: ${err}`);
      }
    }
    if (!member) return res.redirect("/dashboard");

    if (!member.permissions.has(PermissionsBitField.Flags.ManageGuild)) {
      return res.redirect("/dashboard");
    }
    if(!req.query.settings) {
      renderTemplate(res, req, "settings/guild_index.ejs", {
        guild,
        settings: {
          config: await getConfig({guild_id: req.params.guildID})
        },
        alert: null,
      }, app.settings.bot);
    }
    else if(req.query.settings === 'settings') {
      renderTemplate(res, req, "settings/guild_settings.ejs", {
        guild,
        settings: {
          config: await getConfig({guild_id: req.params.guildID})
        },
        alert: null,
      }, app.settings.bot);
    }else {
      renderTemplate(res, req, "settings/guild_index.ejs", {
        guild,
        settings: {
          config: await getConfig({guild_id: req.params.guildID})
        },
        alert: null,
      }, app.settings.bot);
    }
  });

  // // Settings endpoint.
  // app.post("/dashboard/:guildID", checkAuth, async (req, res) => {
  //     // We validate the request, check if guild exists, member is in guild and if member has minimum permissions, if not, we redirect it back.
  //     const guild = bot.guilds.cache.get(req.params.guildID);
  //     if (!guild) return res.redirect("/dashboard");
  //     const member = guild.members.cache.get(req.user.id);
  //     if (!member) return res.redirect("/dashboard");
  //     if (!member.permissions.has("MANAGE_GUILD")) {
  //         return res.redirect("/dashboard");
  //     }
  //     // We retrive the settings stored for this guild.
  //     let storedSettings = await GuildSettings.findOne({
  //         guildID: guild.id
  //     });
  //     if (!storedSettings) {
  //         // If there are no settings stored for this guild, we create them and try to retrive them again.
  //         const newSettings = new GuildSettings({
  //             guildID: guild.id,
  //         });
  //         await newSettings.save().catch((e) => {
  //             console.log(e);
  //         });
  //         storedSettings = await GuildSettings.findOne({
  //             guildID: guild.id
  //         });
  //     }

  //     // We set the prefix of the server settings to the one that was sent in request from the form.
  //     storedSettings.prefix = req.body.prefix;
  //     // We save the settings.
  //     await storedSettings.save().catch((e) => {
  //         console.log(e);
  //     });

  //     // We render the template with an alert text which confirms that settings have been saved.
  //     renderTemplate(res, req, "settings.ejs", {
  //         guild,
  //         settings: storedSettings,
  //         alert: "Your settings have been saved.",
  //     });
  // });
}