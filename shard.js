const config = require('./src/assets/json/_config/config.json')
const {
    ShardingManager
} = require('discord.js')
const token = require('./_secret/token.json');

var shards;

if (config.debug == 'false') {
    let manager = new ShardingManager('./index.js', {
        token: token.BOT_TOKEN,
        totalShards: "auto",
        respawn: true,
    });
    manager.on('shardCreate', shard => {
        shards = shard;
        setTimeout(() => {
            shard.kill();
        }, 86400000); // 24h
        console.log(`[SHARDS]: Launched shards ${shard.id}`)
    });

    manager.spawn();

    module.exports.restartShards = () => {
        return shards.kill();
    }    
}