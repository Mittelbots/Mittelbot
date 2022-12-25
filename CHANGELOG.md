<!--
! TEMPLATE|TEMPLATE|TEMPLATE|TEMPLATE|TEMPLATE|

## **TITLE**

### Added things:
    -

### Bug fixes:
    -

<br><br>

-->

# **MITTELBOT CHANGELOG**

# **BETA VERSION 0.52.1**

### Added things:

    - /

### Bug fixes & other changes:

    - Youtube notifier fixes
    - commands were stuck in loading state

### Dashboard:

    - /

<br><br>

# **BETA VERSION 0.52.0**

### Added things:

    - Timer feature
    - - /timer start
    - - /timer stop

### Bug fixes & other changes:

    - core fixes

### Dashboard:

    - /

<br><br>

# **BETA VERSION 0.51.0**

### Added things:

    - Reddit notifier
    - - /reddit_notifier

### Bug fixes & other changes:

    - core fixes
    - Fixed a spelling mistake in the /pride command

### Dashboard:

    - /

<br><br>

# **BETA VERSION 0.50.4**

### Added things:

    - /pride command

### Bug fixes & other changes:

    - core fixes

### Dashboard:

    - /

<br><br>

# **BETA VERSION 0.50.3**

### Added things:

    - /

### Bug fixes & other changes:

    - Some Fixes and improvements

### Dashboard:

    - /

<br><br>

# **BETA VERSION 0.50.2**

### Added things:

    - /

### Bug fixes & other changes:

    - Some Fixes

### Dashboard:

    - /

<br><br>

# **BETA VERSION 0.50.1**

### Added things:

    - /

### Bug fixes & other changes:

    - Removed Dashboard from repo
    - Fixed workflows

### Dashboard:

    - /

<br><br>

# **BETA VERSION 0.50.0**

### Added things:

    - Database ORM Sequelize

### Bug fixes & other changes:

    - Complete Bot rewrite
    - Removed cache

### Dashboard:

    - /

<br><br>

# **BETA VERSION 0.49.19**

### Added things:

    - /

### Bug fixes & other changes:

    - Bump @discordjs/rest from 1.1.0 to 1.2.0
    - Bump underscore from 1.13.4 to 1.13.6
    - Bump discord.js from 14.4.0 to 14.5.0
    - Reworked/Fixed: Welcomechannel settings

### Dashboard:

    - Removed Dashboard from bot startup
    - Removed all Bot variables from Dashboard

<br><br>

# **BETA VERSION 0.49.18**

### Added things:

    - Added: /kickme slash command

### Bug fixes & other changes:

    - Bump canvacord from 5.4.7 to 5.4.8
    - Bump discord.js from 14.3.0 to 14.4.0
    - Bump @napi-rs/canvas from 0.1.29 to 0.1.30
    - Removed unused packages.json commands

### Dashboard:

    - /

<br><br>

# **BETA VERSION 0.49.17**

### Added things:

    - Bump nodemon from 2.0.19 to 2.0.20
    - Bump @twurple/api from 5.2.3 to 5.2.4
    - Bump @twurple/auth from 5.2.3 to 5.2.4
    - Added: Docker (not working atm)
    - Added: rateLimit event to bot

### Bug fixes & other changes:

    - Changed: rss-parser timeout errorhandler to debug log instead of errorr log
    - Fixed: Timout error in youtube notifer will now be send to the debug log instead of error log
    - Clear-u: config files
    - Fixed: /infraction error and added guild_id to closed_infraction table

### Dashboard:

    -

<br><br>

# **BETA VERSION 0.49.15**

### Added things:

    - Added: New slashcommand: checkguild to get informations about another guild

### Bug fixes & other changes:

    - clear-up slash command folder structure
    - Fixed: open_infraction didnt got deleted from the cache
    - Fixed: youtube infinity loading Bug
    - Improved: Bot start & restart
    - Bump: canvacord from 5.4.6 to 5.4.7

### Dashboard:

    - Fixed: Dashboard crashs the bot after changing the function in core

<br><br>

# **BETA VERSION 0.49.14**

### Added things:

    - Added: cache to all temproles & open_infraction calls

### Bug fixes & other changes:

    - Cleared-up: index file

### Dashboard:

    - /

<br><br>

# **BETA VERSION 0.49.13**

### Added things:

    - Added: Cache to guildMemberAdd & createInfractionId
    - Added: workflows for github repo
    - Added: new log design on error
    - Added: new owner command to export the latest log

### Bug fixes & other changes:

    - Changed/Removed: old db queries & added new functions
    - /infractions command improvements
    - Chore(deps): Bump uuid from 8.3.2 to 9.0.0
    - Hot-Fix: Errorhandler bot crash

### Dashboard:

    - /

<br><br>

# **BETA VERSION 0.49.12**

### Added things:

    - /

### Bug fixes & other changes:

    - Fixed/Removed: old db query & moved to new function in getMemberInfo
    - Fixed: parsed error in getMemberInfo
    - Changed: shard event to once event
    - Fixed: highest role bug in checkMessage
    - Fixed: errorhandler
    - Code improvements

### Dashboard:

    - /

<br><br>

# **BETA VERSION 0.49.11**

### Added things:

    - Added: Support for custom link to yt notifier setting

### Bug fixes & other changes:

    - Chore: Bump dotenv from 16.0.1 to 16.0.2
    - Fixed: permissionsIn throws error

### Dashboard:

    - /

<br><br>

# **BETA VERSION 0.49.10**

### Added things:

    - Added: file & linennumber from called file to errorhandler

### Bug fixes & other changes:

    - Fixed: ignoremode cache eror
    - Fixed: bug when apply from dataset is null
    - Fixed: /cacherefresh doesnt refresh the cache
    - Reworked: (global) disaled commands
    - Removed: unused code & code improvements
    - Fixed: guildCreate cache issue

### Dashboard:

    - /

<br><br>

# **BETA VERSION 0.49.9**

### Added things:

    - /

### Bug fixes & other changes:

    - Fixed: no permissio bug
    - Fixed: yt notifier

### Dashboard:

    - /

<br><br>

# **BETA VERSION 0.49.8**

### Added things:

    - Added: joinroles to guild_config
    - Added: levels to new level table

### Bug fixes & other changes:

    - Chore: Bump @twurple/api from 5.2.2 to 5.2.3
    - Chore: Bump ytdl-core from 4.10.0 to 4.10.1
    - Chore: Bump @napi-rs/canvas from 0.1.28 to 0.1.29
    - Chore: Bump @twurple/auth from 5.2.2 to 5.2.3
    - Fixed: adding a role to the log whitelist caused a bot crash
    - Removed: old level table

### Dashboard:

    - /

<br><br>

# **BETA VERSION 0.49.7**

### Added things:

    - Added: logs to guild_config
    - Added: new db support for auditlog, messagelog & modlog
    - Added warnroles to guild_config
    - Added: message when an user already has all warnroles

### Bug fixes & other changes:

    - Removed: _config database
    - Removed: unused code
    - Changed: settings command handling

### Dashboard:

    - /

<br><br>

# **BETA VERSION 0.49.6**

### Added things:

    - Added: default message to errorhandler when no data is passed

### Bug fixes & other changes:

    - Fixed: youtube notifier

### Dashboard:

    - /

<br><br>

# **BETA VERSION 0.49.5**

### Added things:

    - Added: server dynamical timezone
    - Added: new columns to guild_config (table.json)

### Bug fixes & other changes:

    - Changed: reply handling to followUp
    - Removed: old columns (table.json)

### Dashboard:

    - /

<br><br>

# **BETA VERSION 0.49.4**

### Added things:

    - Added: debug log
    - Added: new command to transform data between tables (owner only)
    - Added: cache to checkForScam function
    - Added: errorcode handling to checkDatabase function
    - Added: blacklist for guilds in guildCreate and messageCreate

### Bug fixes & other changes:

    - Chore(deps): @twurple/auth from 5.2.0 to 5.2.2
    - Chore(deps): @twurple/api from 5.2.0 to 5.2.2
    - Chore(deps): undici from 5.8.1 to 5.9.1
    - Chore(deps): canvacord from 5.4.3 to 5.4.6
    - Chore(deps): discord.js from 14.1.2 to 14.3.0
    - Chore(deps): nodemailer from 6.7.7 to 6.7.8
    - Chore(deps): @napi-rs/canvas from 0.1.26 to 0.1.28
    - Multiple code improvements
    - Modroles knw uses another database
    - Fixed but still broken: Cacherefresh
    - Updated: memberinfo
    - - moved data handling to new table & added full cache support
    - Fixed: Remove mute role bug
    - Updated: ReactionRoles setting to messageid instead of message link
    - Updated: Made afk response more readable
    - Updated: Table file

### Dashboard:

    - /

<br><br>

# **BETA VERSION 0.49.3**

### Added things:

    - Added: max reactionroles to 5
    - Added: Start date to /infraction command

### Bug fixes & other changes:

    - Chore(deps): updated Bump @napi-rs/canvas from 0.1.25 to 0.1.26
    - Fixed: leaderboard level was higher then the real one
    - Changed levelconfig (reduced xp on high levels & add more differents between levels)
    - Fixed: default emote reaction role doesnt triggered event
    - Fixed: onGuildCreate doesnt added all tables
    - Removed: Useless tables

### Dashboard:

    - /

<br><br>

# **BETA VERSION 0.49.2**

### Added things:

    - /bunny command to view cute bunnys
    - Added: new Changerjs library version

### Bug fixes & other changes:

    - Code improvements
    - Switched to random-animals-api for /dogs & /bunny

### Dashboard:

    - Added: Welcome message channel option

<br><br>

# **BETA VERSION 0.49.1**

### Added things:

    - Added a bit of debug log to the code (more will come)
    - Slash Commands: Removed access for bots
    - ReactionRoles: Added support for default emojis
    - global: added ignoreMode
    - Levelsettings: Changed levelconfig multiplier
    - Console: removed all useless console.logs and replaced them with errorhandler function
    - Changed REST version for slash commands to default

### Bug fixes:

    - ReactionRoles: Fixed bug where a bot gets the reaction roles
    - ReactionRoles: Fixed error where a new created role/emoji wasnt found
    - Warn Command: Added missing function
    - Updated a bunch of deps

### Dashboard:

    - Fixed: Filter error in dashboard

<br><br>

# **BETA VERSION 0.49.0**

### Added things:

    - Added reaction role feature
    - Changed levelconfig to make things more difficult

### Bug fixes:

    - /

### Dashboard:

    - /

<br><br>

## **BETA VERSION 0.48.3**

### Added things:

    - Fixed upload handler (twitch & youtube)
    - Changed levelconfig

### Bug fixes:

    - Fixed permission bug in /purge

### Dashboard:

    - Select menu will be reseted after selected options

<br><br>

## **BETA VERSION 0.48.2**

### Added things:

    - Changed joinroles data storage to another table
    - Added: Joinrole settings editable
    - Added: dev & production support to dashboard
    - Removed: Old joinroles functions
    - Updated: deps

### Bug fixes:

    - Some performance & error fixes

<br><br>

## **BETA VERSION 0.48.1**

### Added things:

    - Added: Start date to infractions
    - Added: Cache to open & closed infractions
    - Moved: Infraction functions to data folder
    - Added cache support to checkInfraction & /infractions command
    - Added cache to getOpen/ClosedInfractionsbyUserId function
    - Added cache to yt / twitch upload handler
    - Added errorhandling when twitch user is not found

### Bug fixes:

    - /

<br><br>

# **BETA VERSION 0.48.0**

### Added things:

    - Added: Dashboard BETA

### Bug fixes:

    - Changed hasPermission function to be available for the dashboard

<br><br>

## **BETA VERSION 0.47.7**

### Added things:

    -

### Bug fixes:

    - Improved: unmuteUser
    - Fixed: double tag in modlog
    - Working on Dashboard

<br><br>

## **BETA VERSION 0.47.6**

### Added things:

    - Added: whitelist channels to audit- and messagelog
    - Added: Dm each user after accepted/declined or blacklisted

### Bug fixes:

    - Removed: 'You cant {type} bot' from some moderation commands

<br><br>

## **BETA VERSION 0.47.5**

### Added things:

    - Added: blacklist channels to levelsystem

### Bug fixes:

    - updated deps
    - Deleted: Old command files

<br><br>

## **BETA VERSION 0.47.4**

### Added things:

    - /

### Bug fixes:

    - Improved & reworked the community scam list feature
    - updated deps

<br><br>

## **BETA VERSION 0.47.3**

### Added things:

    - /

### Bug fixes:

    - Fixed: Old version of MessageAttachment
    - updated deps
    - Fixed: Button update on click

<br><br>

## **BETA VERSION 0.47.2**

### Added things:

    - Added whitelist to messageupdate

### Bug fixes:

    - Fixed: Whitelist on message delete & improved code

<br><br>

## **BETA VERSION 0.47.1**

### Added things:

    - /

### Bug fixes:

    - Fixed: Activity not apearing
    - Fixed: Permissions check was undefined

<br><br>

# **BETA VERSION 0.47.0**

### Added things:

    - Updated Bot to discord.js v14
    - Updated: Deps

### Bug fixes:

    - /

<br><br>

## **BETA VERSION 0.46.3**

### Added things:

    - Added: Sticker detector at auditlog `message delete`
    - Added: Warn option to automod

### Bug fixes:

    - Code improvements
    - Improved: Anti-Spam

<br><br>

## **BETA VERSION 0.46.2**

### Added things:

    - Added: anti-invite to automod
    - - /automod anitinvite

### Bug fixes:

    - /

<br><br>

## **BETA VERSION 0.46.1**

### Added things:

    - Added: whitelistroles to automod
    - - /automod whitelistroles

### Bug fixes:

    - Fixed: Bot crash cause undefined content in no perms function

<br><br>

# **BETA VERSION 0.46.0**

### Added things:

    - Added: antispam system (BETA)
    - - /automod antispam slash command

### Bug fixes:

    - Fixed: Levelsystem: User got stuck in timeout loop
    - Removed embed at youtube notifier and replaced it with the link

<br><br>

## **BETA VERSION 0.45.2**

### Added things:

    - Added: /givexp & /removexp slash commands
    - Added: disable levelup message setting

### Bug fixes:

    -  /

<br><br>

## **BETA VERSION 0.45.1**

### Added things:

    - Added: levelup setting
    - - change between dm and channel

### Bug fixes:

    -  Fixed: Missed module added to files

<br><br>

# **BETA VERSION 0.45.0**

### Added things:

    - Twitch notifier (BETA)
    - - /settings twitch
    - - add up to 3 twitch channels at once
    - - add a ping role
    - - update info channel & ping role afterwards

    - - /settings deltwitch
    - - delete twitch channel from the notification list

### Bug fixes:

    -  Removed: useless deps

<br><br>

# **BETA VERSION 0.44.0**

### Added things:

    - Youtube notifier (BETA)
    - - /settings youtube
    - - add up to 3 yt channels at once
    - - add a ping role
    - - update info channel & ping role afterwards

    - - /settings delyoutube
    - - delete youtube channel from the notification list

### Bug fixes:

    -  Added default value to prefix
    -  Fixed: Crash when user pass an invalid id or mention (!mods mr command)

<br><br>

## **BETA VERSION 0.43.22**

### Added things:

    - /

### Bug fixes:

    - Fixed:
    - - disabled_modules wont be added when bot joins
    - - logs default value wont be set
    - - bot crashes when no audit log is set

<br><br>

## **BETA VERSION 0.43.21**

### Added things:

    - Added: message count to levelsystem
    - Increased: level multiplication

### Bug fixes:

    - /

<br><br>

## **BETA VERSION 0.43.20**

### Added things:

    - Added: /leaderboard command to view the top 10 leaders
    - Added: cache refresh command (owner only)

### Bug fixes:

    - /

<br><br>

## **BETA VERSION 0.43.19**

### Added things:

    - Added: rank, level, next level and working progressbar to /rank

### Bug fixes:

    - Fixed: xp cache where data didnt got reconized and inserted new data to the database everytime a user wrote something

<br><br>

## **BETA VERSION 0.43.18**

### Added things:

    - Added: levelsystem slashcommand
    - - server admins are now able to change the level mode

### Bug fixes:

    - Fixed: levelcooldown is now guild sperated
    - Fixed: each xp got replaced with the new value of other users

<br><br>

## **BETA VERSION 0.43.17**

### Added things:

    - Added: BETA Levelsystem
    - - DM on levelup with next level displayed
    - - ready levelsystem upto over thousend levels
    - - improvements

### Bug fixes:

    - dependecies updated

<br><br>

## **BETA VERSION 0.43.16**

### Added things:

    - Added: autotranslate module to module setting.

### Bug fixes:

    - dependecies updated

<br><br>

## **BETA VERSION 0.43.15**

### Added things:

    - Added: Apply funktion to add up to 5 embeds which can be used for user to one-click apply or just use a external link.

### Bug fixes:

    - dependecies updated

<br><br>

## **BETA VERSION 0.43.14**

### Added things:

    - /

### Bug fixes:

    - Hotfix

<br><br>

## **BETA VERSION 0.43.13**

### Added things:

    - Added: Missing module in interactionCreate.js
    - Added: Moderator to guildBanAdd & guildBanRemove auditlog events

### Bug fixes:

    - /

<br><br>

## **BETA VERSION 0.43.12**

### Added things:

    - Moved: settings command to slash commands

### Bug fixes:

    - /

<br><br>

## **BETA VERSION 0.43.11**

### Added things:

    - Added: Welcomemessage module to disable/activate

### Bug fixes:

    - /

<br><br>

## **BETA VERSION 0.43.10**

### Added things:

    - added better backup handling

### Bug fixes:

    - /

<br><br>

## **BETA VERSION 0.43.9**

### Added things:

    - added welcome message command to change the welcome message
    - added welcome message embed on join

### Bug fixes:

    - /

<br><br>

## **BETA VERSION 0.43.8**

### Added things:

    - added autotranslate feature

### Bug fixes:

    - /

<br><br>

## **BETA VERSION 0.43.7**

### Added things:

    - moved scam link management to slash command
    - - /scam add /scam remove /scam view
    - added option to deactivate/activate the scamlink detection

### Bug fixes:

    - /

<br><br>

## **BETA VERSION 0.43.6**

### Added things:

    - Added: modlog message on banAdd & banRemove without its triggered with own bot commands

### Bug fixes:

    - unban sql crash

<br><br>

## **BETA VERSION 0.43.5**

### Added things:

    - /

### Bug fixes:

    - Fixed: crash after restart

<br><br>

## **BETA VERSION 0.43.4**

### Added things:

    - added slash command to activate/deactivate given modules

### Bug fixes:

    - /

<br><br>

## **BETA VERSION 0.43.3**

### Added things:

    - /

### Bug fixes:

    - Fixed: ship cmd now dont work if the target is a bot
    - Fixed: avatar cmd will now display the avatar in a bigger size

<br><br>

## **BETA VERSION 0.43.2**

### Added things:

    - /

### Bug fixes:

    - Hotfix: fixed remove muted role

<br><br>

## **BETA VERSION 0.43.1**

### Added things:

    - /

### Bug fixes:

    - Hotfix: fixed sql error when adding a new user
    - Hotfix: fixed has permissions bug

<br><br>

## **BETA VERSION 0.43.0**

### Added things:

    - added Cache to the most data
    - - xp
    - - config
    - - modroles
    - - warnroles
    - - joinroles
    - fixed permission issue in /kick command
    - fixed /info issue where the bot crashed when the user was not in the server
    - removed deprecated code out of audit log

### Bug fixes:

    - /

<br><br>

## **BETA VERSION 0.42.7**

### Added things:

    - added memberinfo & logs & xp to cache

### Bug fixes:

    - /

<br><br>

## **BETA VERSION 0.42.6**

### Added things:

    - added base structure for cache

### Bug fixes:

    - yt notifier bug fixes

<br><br>

## **BETA VERSION 0.42.5**

### Added things:

    - /

### Bug fixes:

    - bug fixes

<br><br>

## **BETA VERSION 0.42.4**

### Added things:

    - added yt notifier APLHA

### Bug fixes:

    - /

<br><br>

## **BETA VERSION 0.42.3**

### Added things:

    - added dog command

### Bug fixes:

    - /

<br><br>

## **BETA VERSION 0.42.2**

### Added things:

    - added cat command

### Bug fixes:

    - /

<br><br>

## **BETA VERSION 0.42.1**

### Added things:

    - added guessnumber command

### Bug fixes:

    - /

<br><br>

## **BETA VERSION 0.42.0**

### Added things:

    - added ship & avatar command

### Bug fixes:

    - /

<br><br>

## **BETA VERSION 0.41.4**

### Added things:

    - /

### Bug fixes:

    - settings bug fixed

<br><br>

## **BETA VERSION 0.41.3**

### Added things:

    - added infraction remove command

### Bug fixes:

    - /

<br><br>

## **BETA VERSION 0.41.2**

### Added things:

    - /

### Bug fixes:

    - fixed moderation cmd bug
    - fixed modlog emote bug

<br><br>

## **BETA VERSION 0.41.1**

### Added things:

    - /

### Bug fixes:

    - fixed errorhandler (temp)

<br><br>

## **BETA VERSION 0.41.0**

### Added things:

    - added slash commands
    - - ban, infractions, isbanned, kick, mute, purge, unban, unmute, warn
    - disabled normal moderation commands

### Bug fixes:

    - /

<br><br>

## **BETA VERSION 0.40.0**

### Added things:

    - added slash commands
    - - help, info, ping, rank

### Bug fixes:

    - fixed backup system

<br><br>

## **BETA VERSION 0.39.6**

### Added things:

    - added mention to infractions command response when no infractions was found
    - added abilitiy to ban member who isnt in the guild
    - worked on checkForScam

### Bug fixes:

    - fixed unban

## **BETA VERSION 0.39.5**

### Added things:

    - added database backup each day
    - new dep versions

### Bug fixes:

    - fixed auto role bug where bots got the user role

<br><br>

## **BETA VERSION 0.39.4**

### Added things:

    - whitelist link database for checkForScam

### Bug fixes:

    - fixed owner commands
    - fixed spawn bug on crash
    - fixed checkForScam bug (temporary solution)

<br><br>

## **BETA VERSION 0.39.3**

### Added things:

    - added new scam domain database

### Bug fixes:

    - /

<br><br>

## **BETA VERSION 0.39.2**

### Added things:

    - added restart after bot crash
    - changed lines of code (new module & new code)
    - added feature to delete every past message on ban (limit: 7 days)

### Bug fixes:

    - /

<br><br>

## **BETA VERSION 0.39.1**

### Added things:

    - /

### Bug fixes:

    - updated severity vulnerabilities

<br><br>

## **BETA VERSION 0.39.0**

### Added things:

    - added option to remove settings value from database

### Bug fixes:

    - fixed bug when user clicked on "x" on help command
    - upgraded version of dependecies

<br><br>

## **BETA VERSION 0.38.4**

### Added things:

    - added crash log to see if the bots crashed or not in logs

### Bug fixes:

    - /

<br><br>

## **BETA VERSION 0.38.3**

### Added things:

    - /

### Bug fixes:

    - lowered xp per message
    - fixed space bug in auditlog

<br><br>

## **BETA VERSION 0.38.2**

### Added things:

    - bot will update activity each 12h

### Bug fixes:

    - update scam manage to working one

<br><br>

## **BETA VERSION 0.38.1**

### Added things:

    - /

### Bug fixes:

    - fixed shard bug
    - new dependencies version

<br><br>

## **BETA VERSION 0.38.0**

### Added things:

    - added ability to disable commands global
    - added new insert data query on guildCreate

### Bug fixes:

    - fixed shard crash after 5 days

<br><br>

## **BETA VERSION 0.37.2**

### Added things:

    - /

### Bug fixes:

    - bug fixes on guildMemberRemove &  guildMemberAdd

<br><br>

## **BETA VERSION 0.37.1**

### Added things:

    - /

### Bug fixes:

    - Fatal bug fixed when member is muted but dont have any data in member info database

<br><br>

## **BETA VERSION 0.37.0**

### Added things:

    - added "isBanned" command to check if a user is banned or not
    - added npm script to install log folder

### Bug fixes:

    - /

<br><br>

## **BETA VERSION 0.36.6**

### Added things:

    - changed bot restart time to 5d

### Bug fixes:

    - /

<br><br>

## **BETA VERSION 0.36.5**

### Added things:

    - /

### Bug fixes:

    - fixed bug where roles didnt got given back after unmute

<br><br>

## **BETA VERSION 0.36.4**

### Added things:

    - /

### Bug fixes:

    - fixed bug where roles didnt got given back after unmute

<br><br>

## **BETA VERSION 0.36.3**

### Added things:

    - added timestamp to info command

### Bug fixes:

    - joined At bug fix

<br><br>

## **BETA VERSION 0.36.2**

### Added things:

    - /

### Bug fixes:

    - small bug fixes

<br><br>

## **BETA VERSION 0.36.1**

### Added things:

    - /

### Bug fixes:

    - fixed errorhandler in some files

<br><br>

## **BETA VERSION 0.36.0**

### Added things:

    - added errorhandling on missing permissions

### Bug fixes:

    - small bug fixes

<br><br>

## **BETA VERSION 0.35.4**

### Added things:

    - /

### Bug fixes:

    - removed old packages
    - fixed bug where banned people get unbanned on next check

<br><br>

## **BETA VERSION 0.35.3**

### Added things:

    - added new rank card

### Bug fixes:

    - /

<br><br>

## **BETA VERSION 0.35.2**

### Added things:

    - /

### Bug fixes:

    - hasPermission bug fix

<br><br>

## **BETA VERSION 0.35.1**

### Added things:

    - changed Audit-log format

### Bug fixes:

    - /

<br><br>

## **BETA VERSION 0.35.0**

### Added things:

    - added help command with every command in it
    - hasPermissions improvements

### Bug fixes:

    - /

<br><br>

## **BETA VERSION 0.34.4**

### Added things:

    - changed activity system

### Bug fixes:

    - /

<br><br>

## **BETA VERSION 0.34.3**

### Added things:

    - give user the value of xp each message in levelsettings

### Bug fixes:

    - /

## **BETA VERSION 0.34.2**

### Added things:

    - /

### Bug fixes:

    - bug fixes

<br><br>

## **BETA VERSION 0.34.1**

### Added things:

    - /

### Bug fixes:

    - bug fixes

<br><br>

## **BETA VERSION 0.34.0**

### Added things:

    - database connection will now be handled by a mysql connection pool

### Bug fixes:

    - !mods mr will now return a message when the value is empty

<br><br>

## **BETA VERSION 0.33.0**

### It's time to release a huge new feature: <b>Levelsystem</b> :yus:

<br>

### Added things:

    - Levelsystem (BETA)
    - - !rank (mention) [open to everyone]

    - - !levelsettings rank | r [open to server admins]
    - - - set level
    - - - set rankup role or "none"
    - - - set XP

    - - gain xp per message á 1 min

### Bug fixes:

    - removed whitelist (bot is now private)
    - "Lines of Code" bug is now fixed and the total lines of self-coded Code will be displayed
    - bot will now restart each 24h due JavaScript Heap out Memory bug & the bot didn't responsed after 24h+ uptime
    - disable owner only commands due unhandle bugs
    - my little bug hunters killed a few bugs too

<br><br>

## **BETA VERSION 0.32.0**

### Added things:

    - /

### Bug fixes:

    - checkDatabase is now working as it should

<br><br>

## **BETA VERSION 0.31.0**

### Added things:

    - /

### Bug fixes:

    - checkForScam function bug fixed

<br><br>

## **BETA VERSION 0.30.0**

### Added things:

    - /

### Bug fixes:

    - bug fixes

## **BETA VERSION 0.29.0**

### Added things:

    - automatically version control

### Bug fixes:

    - "database undefined" bug fixed in unban command

<br><br>

## **BETA VERSION 0.28.0**

### Added things:

    - /

### Bug fixes:

    - fixed bug where every infraction were shown

<br><br>

## **BETA VERSION 0.27.0**

### Added things:

    - roles will be saved on ban too

### Bug fixes:

    - huge bug fix
    - bot should work as usual now

<br><br>

## **BETA VERSION 0.26.0**

### Added things:

    - /

### Bug fixes:

    - bug fixes and bug fixes and bug fi...

<br><br>

## **BETA VERSION 0.25.0**

### Added things:

    - bot is running on shards now

### Bug fixes:

    - high memory storage fixed

<br><br>

## **BETA VERSION 0.24.0**

### Added things:

    - added better errorhandler
    - add advanced scamlist feature where every server admin can request to add an specified link
    - - commands: "add", "delete" and "view" added

### Bug fixes:

    - bug fixes
    - bot performance improved

<br><br>

## **BETA VERSION 0.23.0**

### Added things:

    - Settings to save, update or remove modroles is now with buttons (User friendly 100%)

### Bug fixes:

    - infractions command bug fixed

<br><br>

## **BETA VERSION 0.22.0**

### Added things:

    - /

### Bug fixes:

    - hot fix
    - improvements

<br><br>

## **BETA VERSION 0.21.0**

### Added things:

    - reactivate "checkScam" feature & improvements
    - add guild name to private Punishment response

### Bug fixes:

    - small bug fixes

<br><br>

## **BETA VERSION 0.20.0**

### Added things:

    - added feature to see the actual join time in info command
    - added scam detection feature with autoban

### Bug fixes:

    - improved and fixed some bugs in ban functions

<br><br>

## **BETA VERSION 0.19.0**

### Added things:

    - updated "config.example.json to lastest version

### Bug fixes:

    - fixed bug where the bot crashed on unban command when the user isnt banned
    - fixed rejoin bug where user got the muted role when they are muted on another guild

<br><br>

## **BETA VERSION 0.18.0**

### Added things:

    - added emotes to modlog embed
    - improved integration to add tables and columns automatically

### Bug fixes:

    - small bug fixes

<br><br>

## **BETA VERSION 0.17.0**

### Added things:

    - added integration to add tables and columns automatically
    - added image viewer on delete message event in auditlog
    - added checkScam integration
    - - member gets banned & message gets deleted
    - - its enabled on default

### Bug fixes:

    - small bug fixes

<br><br>

## **BETA VERSION 0.16.0**

### Added things:

    - /

### Bug fixes:

    - fixed "heap out of memory"

<br><br>

## **BETA VERSION 0.15.0**

### Added things:

    - added scripts to create template tables and columns

### Bug fixes:

    - /

<br><br>

## **BETA VERSION 0.14.0**

### Added things:

    - /

### Bug fixes:

    - bug fixes

<br><br>

## **BETA VERSION 0.13.0**

### Added things:

    - Complete rework of all moderation commands
    - now more functions are more dynamically and can be used at every other command or interaction
    - tried to improve bots performance

### Bug fixes:

    - bug fixes

<br><br>

## **BETA VERSION 0.12.0**

### Added things:

    - improved auto unmute

### Bug fixes:

    -

<br><br>

## **BETA VERSION 0.11.0**

### Added things:

    - added permanent feature to ban and mute command

### Bug fixes:

    -

<br><br>

## **BETA VERSION 0.10.0**

### Added things:

    - the "till date" will now shown if it exits in infraction command

    - feature added to save roles when a user leaves and give them back when the same user joins back
    - - if the user is muted the bot gives only the muted role

### Bug fixes:

    - fixed error where tables didnt got added when one querie got an error - "npm run deployTables"

<br><br>

## **BETA VERSION 0.9.0**

### Added things:

    - /

### Bug fixes:

    - fixed bug where the infraction command didnt worked with only user id after last version

<br><br>

## **BETA VERSION 0.8.0**

### Added things:

    - added option to use infraction command with only user id

### Bug fixes:

    - removed useless fata error logging

<br><br>

## **BETA VERSION 0.7.0**

### Added things:

    - [private]

### Bug fixes:

    - /

<br><br>

## **BETA VERSION 0.6.0**

### Added things:

    - improved remove all roles function on mute command

### Bug fixes:

    - fixed bug where the bot gives a fatal error

<br><br>

## **BETA VERSION 0.5.0**

### Added things:

    - Logging in file

### Bug fixes:

    - /

<br><br>

## **BETA VERSION 0.4.0**

### Added things:

    - added server to whitelist

### Bug fixes:

    - /

<br><br>

## **BETA VERSION 0.3.0**

### Added things:

    - added feature to remove and save all user roles on mute
    - added featute to add all saved roles to user on unmute

### Bug fixes:

    - /

<br><br>

## **BETA VERSION 0.2.0**

### Added things:

    - /

### Bug fixes:

    - small bug fixes & improvements
    - infraction will now deleted from specified database and insert into another database

<br><br>

## **BETA VERSION 0.1.0**

### Added things:

    - added color to specified auditlog events

### Bug fixes:

    - small bug fixes & improvements
    - infraction will now deleted from specified database and insert into another database

<br><br>

## **BETA VERSION 0.0.2**

### Added things:

    - added error handler to ban command

### Bug fixes:

    - fixed bug where links triggered the updateMessage event
    - fixed bug where space were given as time

<br><br>

## **BETA VERSION 0.0.1**

### Added things:

    - added error handler to ban command

### Bug fixes:

    - fixed permission bug where the mod role "helper" can't use all moderation commands
    - removed channelupdate log for now

<br><br>

## \*\*\*\*
