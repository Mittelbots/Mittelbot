const database = require("../src/db/db");
const { getAllGuildIds } = require("../utils/functions/data/getAllGuildIds");

const old_DB_name = "_guild_member_info";
const new_DB_name = "member_info";
const isGuildIdRequired = true;

async function main() {
    var all_guilds = [];
    if(isGuildIdRequired) {
        all_guilds = await getAllGuildIds();

        if(!all_guilds) {
            console.error("No guilds found or an error occured", err);
        }
    }

    for(let i in all_guilds) {
        const data = await database.query(`SELECT * FROM ${isGuildIdRequired ? all_guilds[i].guild_id : ""}${old_DB_name}`)
            .then(res => {return res;})
            .catch(err => {console.error("Error occured", err);});

        if(!data) continue;

        if(new_DB_name == "member_info") {
            for(let d in data) {
                await database.query(`INSERT IGNORE INTO ${new_DB_name} (user_id, guild_id, member_roles, user_joined) VALUES (?, ?, ?, ?)`, [data[d].user_id, all_guilds[i].guild_id, data[d].member_roles, data[d].user_joined])
                    .then(() => {console.log(`Successfully inserted new data. Status: ${d} of ${data.length}`);})
                    .catch(err => {console.error("Error occured", err);});
            }
        }
    }
}


main();