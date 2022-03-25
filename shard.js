const config = require('./src/assets/json/_config/config.json')
const {
    ShardingManager
} = require('discord.js')
const token = require('./_secret/token.json');

if (config.debug == 'false') {
    let manager = new ShardingManager('./index.js', {
        token: token.BOT_TOKEN,
        totalShards: "auto",
        respawn: true,
    });
    manager.on('shardCreate', shard => {

        module.exports.restartShards = () => {
            return shard.kill();
        }    

        setTimeout(() => {
            shard.kill();
        }, 86400000); // 24h
        console.log(`[SHARDS]: Launched shards ${shard.id}`)
    });

    manager.spawn();
}