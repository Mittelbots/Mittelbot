module.exports.isValidHexCode = (str) => {
    if (str[0] !== '#') return false;

    if (!(str.length === 4 || str.length === 7)) return false;

    for (let i = 1; i < str.length; i++) {
        const charCode = str[i].charCodeAt(0);
        if (
            !(
                (charCode >= '0'.charCodeAt(0) && charCode <= '9'.charCodeAt(0)) ||
                (charCode >= 'a'.charCodeAt(0) && charCode <= 'f'.charCodeAt(0)) ||
                (charCode >= 'A'.charCodeAt(0) && charCode <= 'F'.charCodeAt(0))
            )
        ) {
            return false;
        }
    }

    return true;
};
