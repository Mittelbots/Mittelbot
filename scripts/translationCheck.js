(() => {
    const fs = require('fs');
    const path = require('path');

    function compareJSONKeys(json1, json2) {
        const keys1 = Object.keys(json1);
        const keys2 = Object.keys(json2);

        const missingKeysInJson2 = keys1.filter((key) => !keys2.includes(key));
        const missingKeysInJson1 = keys2.filter((key) => !keys1.includes(key));

        for (let key in json1) {
            if (
                json1.hasOwnProperty(key) &&
                json2.hasOwnProperty(key) &&
                typeof json1[key] === 'object' &&
                typeof json2[key] === 'object'
            ) {
                const nestedDifferences = compareJSONKeys(json1[key], json2[key]);
                missingKeysInJson2.push(
                    ...nestedDifferences.missingKeysInJson2.map(
                        (nestedKey) => `${key}.${nestedKey}`
                    )
                );
                missingKeysInJson1.push(
                    ...nestedDifferences.missingKeysInJson1.map(
                        (nestedKey) => `${key}.${nestedKey}`
                    )
                );
            }
        }

        return {
            missingKeysInJson2,
            missingKeysInJson1,
        };
    }

    const transFilesPath = '~assets/json/translations/';

    const defaultTranslationPath = path.resolve(__dirname, transFilesPath + '_default.json');
    const defaultTranslation = JSON.parse(fs.readFileSync(defaultTranslationPath, 'utf8'));

    const translationFiles = fs
        .readdirSync(path.resolve(__dirname, transFilesPath))
        .filter((file) => file !== '_default.json');

    translationFiles.forEach((file) => {
        const translationPath = path.resolve(__dirname, transFilesPath + file);
        const translation = JSON.parse(fs.readFileSync(translationPath, 'utf8'));

        const differences = compareJSONKeys(defaultTranslation, translation);

        if (differences.missingKeysInJson2.length > 0) {
            console.info(
                `Translation file ${file} is not up to date with the default translation file. Missing keys:`
            );
            console.info(differences.missingKeysInJson2);
        } else {
            console.info(
                `Translation file ${file} is up to date with the default translation file`
            );
        }
    });
})();
