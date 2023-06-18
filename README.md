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

**Mittelbot**. A multi-purpose Discord bot with a lot of features. <br>
With Notifications, Moderation with warn roles, Fun Commands, Auto-Translation, Banappeals, Auto-Moderation, Ticketsystem, Scam Detection, Reactionroles, Levelsystem, Music, Utility Commands and more! <br>

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
- Docker
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
# -> All channels for informations

TT_CLIENT_ID= #Your Twitch Client ID to run the twitch notifier
TT_SECRET= #Your Twitch Secret

IMGUR_CLIENT_ID= #Your Imgur Client ID to run the imgur uploader
IMGUR_CLIENT_SECRET= #Your Imgur Client Secret

-----------------------
# ENV VARIABLES YOU CAN IGNORE (DUE OLD CODE OR FUTURE REQUIREMENTS)
JWT_SECRET=
BOT_STATUS=
YT_KEY=
TW_CONSUMER_KEY=
TW_CONSUMER_SECRET=
TW_ACCESS_TOKEN=
TW_ACCESS_SECRET=
GO_TRANSLTE_PROJECTID=
API_PORT=
API_DOMAIN=

-----------------------
# ENV VARIABLES THAT YOU DONT CHANGE
DP_FORCE_YTDL_MOD=
```

<br>

3. Start the docker container
```bash
docker compose up -d

# For older docker versions:
docker-compose up -d
```
<br>

-----------------------

<br>

# **Production**

1. Add File "docker-compose.override.yml" to your project root

2. Insert this code into the docker-compose.override.yml

```yml
services:
    bot:
        build:
            args:
                - NODE_ENV=production
        environment:
            - NODE_ENV=production

    mysql:
        environment:
            - MYSQL_ROOT_PASSWORD=xxxx
            - MYSQL_DATABASE=mittelbot
            - MYSQL_USER=xxxx
            - MYSQL_PASSWORD=xxxxx
            - MYSQL_PORT=3306
```

<br/>
<br/>

<center>© BlackDayz 2023. All rights reserved</center>