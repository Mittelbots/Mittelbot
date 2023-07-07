#!/bin/bash

DEPLOYMENT=$1

stopContainer() {
    echo "Stopping docker container"
    docker compose down
}

startBot() {
    echo "Starting bot"
    npm run start
}

startContainer() {
    echo "Starting docker container"
    docker compose up -d
}

installNpmPackages() {
    echo "Installing npm packages in docker container"
    docker compose exec ${DOCKER_CONTAINER} npm install
}

installAliasModules() {
    echo "Installing alias modules in docker container"
    docker compose exec ${DOCKER_CONTAINER} npm run alias-build
}

echo "Starting installation"

DOCKER_CONTAINER="bot"

if [ "$DEPLOYMENT" != "deployment" ]; then
    answer=""
    read -e -i "$answer" -p "Do you have inserted all important data to the .env file? [y/n]: " input
    answer="${input:-$answer}"

    if [ "$answer" != "${answer#[Nn]}" ] ;then
        echo "Please insert all important data to the .env file and run the script again."
        exit 1
    fi
fi


stopContainer
startContainer
installNpmPackages
installAliasModules
stopContainer
startBot
