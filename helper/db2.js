let secondaryDB;

exports.setSecondaryDB = function (secondDB) {
    secondaryDB = secondDB;
}
exports.getSecondaryDB = () => {
    return secondaryDB;
}