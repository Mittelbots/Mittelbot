import { Information } from './info.js';
import { config } from './config.js';

//Dev information
new Information();

// All new changes will be saved in this variable.
var ChangerJSData = [];

// {Boolean} to check if data is changed or not.
var ChangerJSDetector = false;

// To check if the data is changed or not
var ChangeJSOldArray = [];

/**
 * @description Generate Error messages
 * @param {string} message - Error message
 * @param {string} type - Error type
 * @param {string} code - Error code
 * @returns {string} Error message
 */
class Error {
    #generateErrorMessage() {
        return {
            error: {
                type: this.type,
                code: this.code,
                message: this.message,
            },
        };
    }

    constructor({ message, type, code }) {
        this.message = message;
        this.type = type;
        this.code = code;

        if (!message || !type || !code) {
            return new Error({
                message:
                    'Internal Error: Error Message, Type and Code are required. Please report this error to the developer or open a pull request to help us.',
                type: 'InternalError',
                code: '001',
            });
        }

        return this.#generateErrorMessage();
    }
}

/**
 * @description This function generates a random Integer to be used as a unique identifier for the HTML DOM elements.
 * @param {Number} length The legnth of the random integer.
 * @returns {Number} The random integer.
 */
class Randomint {
    #defaultLength = 10;
    randomint = 0;

    #generate() {
        let chars = '0123456789';
        let int = '';
        for (let i = 0; i <= this.length; i++) {
            int += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        this.randomint = parseInt(int);
    }

    constructor(length) {
        this.length = length || this.#defaultLength;
        this.#generate();
        return this.randomint;
    }
}

class onChanges {
    constructor(obj) {
        const event = new CustomEvent('onChanges', {
            detail: {
                error: false,
                isDataChanged: ChangerJSDetector,
                changes: obj,
            },
        });

        window.dispatchEvent(event);
    }
}

/**
 * @description This function is to return the changes in the right format to the user
 * @param {Object} obj - ChangerJSData object
 * @returns {Object} The changes object in the right format
 */
class returnChanges {
    constructor(obj) {
        return {
            error: false,
            isDataChanged: ChangerJSDetector,
            changes: obj,
        };
    }
}

/**
 * @description This function checks if the HTML DOM element is valid
 * @param {Object} required The HTML DOM element that is required to be checked
 * @returns {Boolean} Returns {true} if the HTML DOM element is valid and {false} if it is not valid
 */
class checkSupportedType {
    constructor(el) {
        this.el = el;
        return this.#check();
    }
    #check() {
        if (
            config.InputTypes.indexOf(this.el.type) !== -1 ||
            config.SupportedTypes.indexOf(this.el.tagName.toLowerCase()) !== -1
        ) {
            return true;
        } else {
            return false;
        }
    }
}

document.querySelectorAll('.ChangerJSInput').forEach(function (el) {
    if (new checkSupportedType(el)) {
        let OldValue = el.value === undefined ? '' : el.value;

        let changerID = new Randomint().randomint;

        let newobj = {
            id: changerID,
            cid: el.dataset.cid || '',
            OldValue,
            NewValue: OldValue,
        };

        let oldobj = {
            id: changerID,
            cid: el.dataset.cid || '',
            OldValue,
            NewValue: OldValue,
        };

        el.dataset.changerjs = changerID;

        ChangerJSData.push(newobj);
        ChangeJSOldArray.push(oldobj);

        el.addEventListener('change', function ({ target }) {
            let ChangerJSDataTag = target.dataset.changerjs;
            let InputData = target.type === 'file' ? target.files[0] : target.value;

            for (let i in ChangerJSData) {
                if (ChangerJSData[i].id == ChangerJSDataTag) ChangerJSData[i].NewValue = InputData;
                if (ChangerJSData[i].NewValue != ChangerJSData[i].OldValue) {
                    ChangerJSData[i].hasChanged = true;
                } else {
                    ChangerJSData[i].hasChanged = false;
                }
            }

            if (JSON.stringify(ChangerJSData) !== JSON.stringify(ChangeJSOldArray))
                ChangerJSDetector = true;
            else ChangerJSDetector = false;

            new onChanges(ChangerJSData);
        });
    } else {
        new Error({
            message: `Not supported type detected: ${el.type ? el.type : el.tagName.toLowerCase()}`,
            type: 'NotSupportedType',
            code: '002',
        });
    }
});

/**
 * @description Returns the ChangerJS Object of the input fields.
 * @param {Object} el requried
 * @returns {Object} ChangerJS Object & {Boolean} isDataChanged
 */
export function getCJChanges(el) {
    if (!el) {
        return new Error({
            message: 'Please pass the element as parameter',
            type: 'NoElementPassed',
            code: '003',
        });
    }

    var element;

    if (el.type == 'click') element = el.target;
    else element = el;

    if (element.dataset.cjclick == 'true') {
        return new returnChanges(ChangerJSData);
    } else {
        return new Error({
            message:
                'You have to declare the element with the data-cjclick="true" attribute to call the function',
            type: 'NoCorrectDataset',
            code: '004',
        });
    }
}
