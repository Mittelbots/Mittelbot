<p align="center">
  <a href="" rel="noopener">
 <img width=250px src="./.github/project_files/logo.png" alt="Project logo"></a>
</p>

<h1 align="center">Mittelbot</h1>

<center>

[![Deployment Beta Bot](https://github.com/Mittelbots/Mittelbot/actions/workflows/deploy.yml/badge.svg?branch=beta)](https://github.com/Mittelbots/Mittelbot/actions/workflows/deploy.yml)

<br>

[![wakatime](https://wakatime.com/badge/github/Mittelbots/Mittelbot.svg)](https://wakatime.com/badge/github/Mittelbots/Mittelbot)
![GitHub license](https://img.shields.io/github/license/Mittelbots/Mittelbot)
[![Discord](https://img.shields.io/discord/83000000000000000?color=7289DA&label=Discord&logo=Discord&logoColor=white)](https://discord.gg/AGp4hsccU6)
![GitHub issues](https://img.shields.io/github/issues/Mittelbots/Mittelbot)
[![Codacy Badge](https://app.codacy.com/project/badge/Grade/ab27b6a53f5f4946b4eb656f98738814)](https://app.codacy.com/gh/Mittelbots/Mittelbot/dashboard?utm_source=gh&utm_medium=referral&utm_content=&utm_campaign=Badge_grade)

 ![Alt](https://repobeats.axiom.co/api/embed/ac763e09e444c318e62d110a7c80b0d9b4ad370e.svg "Repobeats analytics image")
  
</center>

---

<br>

## **Important Note!**
This project <span style="font-weight: 800; color: red;">does not</span> support hosting without Docker or another free hosting service such as Heroku or Netlify currently. <br> 
To host this project, you must have a basic understanding of Docker and NodeJS.
Anyone is welcome to contribute to this project and add a "how to host" guide to this readme file for other hosting services.

<br>

## Performance
This project is designed to run on a server with at least 4GB of RAM and 2 CPU cores. 

<br>

---

<br>


**Mittelbot**. A multi-purpose Discord bot with a lot of features. <br>
With Notifications, Moderation with warn roles, Fun Commands, Auto-Translation, Banappeals, Auto-Moderation, Ticketsystem, Scam Detection, Reactionroles, Levelsystem, Music, Utility Commands and more! <br>

### [Invite the bot](https://mittelbot.xyz/invite)

<br>

## Roadmap

<img src="./.github/project_files/roadmap_mittelbot_2023_release1.png" alt="Roadmap Mittelbot Release 1.0" witdth="600px"/>

<br>

## **Contributing**

Thank you for considering contributing to the Mittelbot! <br>
If you want to contribute to the Mittelbot, you can do this by creating a pull request. <br>
If you want to add a new feature, please open an issue first. <br>
You may ask if you should change the Database variables in the .env. You can of course. But the default one are perfectly for the development. <br>
<br>
### For deeper Questions you can join my [Discord](https://mittelbot.blackdayz.de/support). <br>
<br>

## **Pre-Requirements**

### Docker
> How to install Docker on Linux: https://www.digitalocean.com/community/tutorials/how-to-install-and-use-docker-on-ubuntu-22-04 <br>
> How to install Docker on Windows: https://docs.docker.com/desktop/install/windows-install/ <br>
> How to install Docker on Mac: https://docs.docker.com/desktop/mac/install/ 
<br>

## **Installation**

1. Clone the repository
```bash
git clone https://github.com/Mittelbots/Mittelbot.git
```
<br>

2. Copy the .env.example to .env and fill in the values
(The most important values explained):

```env
DISCORD_SECRET= #Your bot secret (Visit the Discord Developer Portal for your token)
DISCORD_TOKEN= #Your bot token (Visit the Discord Developer Portal for your token)
DISCORD_APPLICATION_ID= #Your Bot Application ID (Also known as User ID)
DEVELOPER_DISCORD_GUILD_ID= #The Guild were all commands should load on (When NODE_ENV is development)

# DEVELOPER CHANNELS
DC_DEBUG= # The Channel ID for the debug channel where discords debug messages will be sent
DC_DISCONNECT= # The Channel ID for the disconnect channel where discords disconnect messages will be sent
DC_ERROR= # The Channel ID for the error channel where discords error messages will be sent
DC_WARN= # The Channel ID for the warn channel where discords warn messages will be sent
DC_RECONNECT= # The Channel ID for the reconnect channel where discords reconnect messages will be sent
DC_SCAMMANAGE= # The Channel ID where all scam link requests will be sent

# DATABASE
DB_DEBUG=false # debug mode for the database
DB_HOST=mysql # default
DB_USER=mittelbot # default
DB_PASSWORD=root # default
DB_DATABASE=mittelbot # default

# MISC
OWNER_ID= # Your Discord User ID to use the owner commands

# ====== OPTIONAL ====== #

# TWITCH
TT_CLIENT_ID= #Your Twitch Client ID to run the twitch notifier
TT_SECRET= #Your Twitch Secret

# IMGUR
IMGUR_CLIENT_ID= #Your Imgur Client ID to run the imgur uploader
IMGUR_CLIENT_SECRET= #Your Imgur Client Secret

# YOUTUBE
YT_KEY= #Your Youtube API Key to run the youtube notifier
```

<br>

3. Start Docker
```bash
npm run start
```

<br>

4. View all commands (development only)

Go to your bot direct message and send `deploycommands`. You will notice, that in your console the commands will be deployed and updated.


<br>

-----------------------

<br/>

<center>© BlackDayz 2023. All rights reserved</center>

<br/>