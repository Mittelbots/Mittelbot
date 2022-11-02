const path = require('path');
const dataDir = path.resolve(`${process.cwd()}${path.sep}dashboard`); // The absolute path of current this directory.
const templateDir = path.resolve(`${dataDir}${path.sep}templates`); // Absolute path of ./templates directory.
// We declare a renderTemplate function to make rendering of a template in a route as easy as possible.
module.exports.renderTemplate = async (res, req, template, data = {}, bot) => {
    // Default base data which passed to the ejs template by default.
    const baseData = {
        bot,
        path: req.path,
        user: req.user ? req.user : null,
    };

    res.render(path.resolve(`${templateDir}${path.sep}${template}`), Object.assign(baseData, data));
};
