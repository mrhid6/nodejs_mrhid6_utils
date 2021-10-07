const iModel = require("../").MySQLModel;

const ModelTest = new iModel(null, {
    translations: [
        ["ci_pclevel", "PowerCoreLevel"]
    ]
});
const testData = [{
    "ci_pclevel": 1
}, {
    "ci_pclevel": 2
}]
ModelTest.ParseMySQLData(testData);