@echo off

set "DOCKER_CONTAINER=bot"

set /p "answer=Do you have inserted all important data to the .env file? [y/n]: "

if /i "%answer%"=="n" (
    echo Please insert all important data to the .env file and run the script again.
    exit /b 1
)

:stopContainer
echo Stopping docker container
docker compose down

:startContainer
echo Starting docker container
docker compose up -d

echo Starting installation

:installNpmPackages
echo Installing npm packages in docker container
docker compose exec %DOCKER_CONTAINER% npm install

:installAliasModules
echo Installing alias modules in docker container
docker compose exec %DOCKER_CONTAINER% npm run alias-build

:endScript
npm run stop && echo You can now start the bot with the command "npm run start"

exit /b
