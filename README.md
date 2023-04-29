<p align="center">
  <a href="" rel="noopener">
 <img width=250px src="./.github/logo.png" alt="Project logo"></a>
</p>

<h1 align="center">Mittelbot</h1>

[![wakatime](https://wakatime.com/badge/github/Mittelbots/Mittelbot.svg)](https://wakatime.com/badge/github/Mittelbots/Mittelbot)
![GitHub license](https://img.shields.io/github/license/Mittelbots/Mittelbot)
[![Discord](https://img.shields.io/discord/83000000000000000?color=7289DA&label=Discord&logo=Discord&logoColor=white)](https://discord.gg/AGp4hsccU6)
![GitHub issues](https://img.shields.io/github/issues/Mittelbots/Mittelbot)
[![Codacy Badge](https://app.codacy.com/project/badge/Grade/ab27b6a53f5f4946b4eb656f98738814)](https://app.codacy.com/gh/Mittelbots/Mittelbot/dashboard?utm_source=gh&utm_medium=referral&utm_content=&utm_campaign=Badge_grade)

---

It's a multipurpose Discord Bot with moderation, utilities and a levelsystem.

## <b>Development Status</b>

The Bot is in Beta currently. Some features are buggy as hell or not finished. <br>
Some part of the code are old. So don't be scared of some mess :)

## <b>You want to help?</b>

That's great! Contact me on Discord (https://mittelbot.blackdayz.de/support).
Or open issue if you want :)

# **Docker**

1. Add File "Dockerfile.prod" to your project root

2. Add File "docker-compose.override.yml" to your project root

3. Insert this code into the Dockerfile.prod

```Dockerfile

FROM node:18.15.0


WORKDIR /app

COPY package.json ./

RUN npm install

COPY . .

EXPOSE 5000

CMD [ "node", "bot/core/shard.js" ]

```

4. Insert this code into the docker-compose.override.yml

```yml
services:
    bot:
        build:
            context: .
            dockerfile: Dockerfile.prod

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
