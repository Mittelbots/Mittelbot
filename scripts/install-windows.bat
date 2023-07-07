@echo off

:: Function to stop the docker container
:stopContainer
echo Stopping docker container
docker-compose down

:: Function to start the bot
:startBot
echo Starting bot
npm run start

:: Function to start the docker container
:startContainer
echo Starting docker container
docker-compose up -d

:: Function to install npm packages
:installNpmPackages
echo Installing npm packages in docker container
docker-compose exec %DOCKER_CONTAINER% npm install

:: Function to install alias modules
:installAliasModules
echo Installing alias modules in docker container
docker-compose exec %DOCKER_CONTAINER% npm run alias-build

echo Starting installation

set "DOCKER_CONTAINER=bot"

set /p "answer=Do you have inserted all important data to the .env file? [y/n]: "

if /i "%answer%"=="n" (
    echo Please insert all important data to the .env file and run the script again.
    exit /b 1
)

call :stopContainer
call :startContainer
call :installNpmPackages
call :installAliasModules
call :stopContainer
call :startBot

exit /b
