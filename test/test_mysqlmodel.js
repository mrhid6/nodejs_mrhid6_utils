const iModel = require("../").Models.Model;
const iTranslation = require("../").Models.Translation;
const iTypes = require("../").Models.Types;

class InventoryItemModel extends iModel {
    constructor(DB) {
        super(DB, {
            table: "inventory_items",
            translations: [
                new iTranslation("ii_inv_id", "inv_id", iTypes.NUMBER),
                new iTranslation("ii_quantity", "quantity", iTypes.NUMBER),
                new iTranslation("ii_item_desc", "descriptor", iTypes.STRING),
                new iTranslation("ii_slot_num", "slot_id", iTypes.NUMBER)
            ],
            links: []
        })
    }

    retrieve() {
        return super.retrieve(
            ["ii_inv_id", "ii_slot_num"], [this.get("inv_id"), this.get("slot_id")]
        )
    }
}

class InventoryModel extends iModel {
    constructor(DB) {
        super(DB, {
            table: "inventories",
            translations: [
                new iTranslation("inv_id", "id", iTypes.NUMBER),
                new iTranslation("inv_char_id", "char_id", iTypes.NUMBER),
                new iTranslation("inv_name", "name", iTypes.STRING),
                new iTranslation("inv_size", "size", iTypes.NUMBER)
            ],
            links: [
                ["items", "inventory_items", ["id", "ii_inv_id"], InventoryItemModel]
            ]
        })
    }

    retrieve() {
        return super.retrieve(["inv_id"], [this.get("id")])
    }

    getItems() {
        return this.get("items");
    }
}

class CharacterModel extends iModel {
    constructor(DB) {
        super(DB, {
            table: "characters",
            translations: [
                new iTranslation("c_id", "id", iTypes.NUMBER),
                new iTranslation("c_user_id", "user_id", iTypes.NUMBER),
                new iTranslation("c_name", "name", iTypes.STRING),
                new iTranslation("c_mapname", "mapname", iTypes.STRING)
            ],
            links: [
                ["inventories", "inventories", ["id", "inv_char_id"], InventoryModel]
            ]
        })
    }

    retrieve() {
        return super.retrieve(["c_id"], [this.get("id")])
    }

    getInventories() {
        return this.get("inventories");
    }
}

class UserModel extends iModel {
    constructor(DB) {
        super(DB, {
            table: "users",
            translations: [
                new iTranslation("user_id", "id", iTypes.NUMBER),
                new iTranslation("user_username", "username", iTypes.STRING, ""),
                new iTranslation("user_password", "password", iTypes.STRING, ""),
                new iTranslation("user_firstname", "firstname", iTypes.STRING, ""),
                new iTranslation("user_lastname", "lastname", iTypes.STRING, ""),
                new iTranslation("user_email", "email", iTypes.STRING, ""),
                new iTranslation("user_web_access", "web_access", iTypes.BOOLEAN, false),
                new iTranslation("user_join_date", "join_date", iTypes.DATE, new Date()),
                new iTranslation("user_verified", "verified", iTypes.BOOLEAN, false),
            ],
            links: [
                ["characters", "characters", ["id", "c_user_id"], CharacterModel]
            ]
        })
    }

    getSearchData() {
        return {
            conditions: ["user_id"],
            value: [this.get("id")]
        }
    }

    retrieve() {
        const searchData = this.getSearchData();
        return super.retrieve(searchData.conditions, searchData.value);
    }

    getCharacters() {
        return this.get("characters");
    }
}

module.exports = UserModel;