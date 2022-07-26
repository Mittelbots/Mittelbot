const sloc = require('node-sloc')
async function getLinesOfCode(cb) {
    const options = {
        path: './', // Required. The path to walk or file to read.
        extensions: ['js', 'json'], // Additional file extensions to look for. Required if ignoreDefault is set to true.
        ignorePaths: ['_logs', '.github', 'node_modules', '.bashrc', '.gitattributes', '.gitignore', 'LICENSE', 'package-lock.json', 'package.json', 'README.md', '.git', '.github', 'dashboard/assets/vendor', 'dashboard/assets/css', 'dashboard/assets/js'], // A list of directories to ignore. Supports glob patterns.
        ignoreDefault: true // Whether to ignore the default file extensions or not
      }
    
      return sloc(options).then((res) => {
        return cb(res.sloc);
      })
}
module.exports = {
    getLinesOfCode
};