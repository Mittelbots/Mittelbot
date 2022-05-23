const LanguageDetect = require('languagedetect');
const { errorhandler } = require('../errorhandler/errorhandler');
const lngDetector = new LanguageDetect();

module.exports.checkLang = async (message) => {
    const detec = lngDetector.detect(message.content);

    let pass = false;
    for(let i = 0; i < 10; i++) {
        if(detec[i][0] == 'english') {
            pass = true;
            break;
        }
    }

    if(!pass) {
        await message.channel.send("Please use english language");
        message.delete();
        errorhandler({err: '', message: `Detector fired! English was ${detec["english"]}`, fatal: false});
        return false;
    }else return true;
}

console.log();