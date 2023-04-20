const { contributeConfig } = require('../_config/utils/contribute');

module.exports.run = async ({ main_interaction, bot }) => {
    return main_interaction
        .reply({
            content: bot.config.github_repo,
            ephemeral: true,
        })
        .catch(() => {});
};

module.exports.data = contributeConfig;
