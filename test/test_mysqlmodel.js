const iModel = require("../").Models.Model;
const iTranslation = require("../").Models.Translation;
const iLink = require("../").Models.Link;
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
                new iLink("items", "Items", "inventory_items", ["id", "ii_inv_id"], InventoryItemModel, iTypes.MANY)
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
                new iTranslation("c_id", "id", "Id", iTypes.NUMBER),
                new iTranslation("c_user_id", "user_id", "UserId", iTypes.NUMBER),
                new iTranslation("c_name", "name", "CharName", iTypes.STRING),
                new iTranslation("c_mapname", "mapname", "MapName", iTypes.STRING)
            ],
            links: [
                new iLink("inventories", "Inventories", "inventories", ["id", "inv_char_id"], InventoryModel, iTypes.MANY)
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
                new iTranslation("user_id", "id", "UserId", iTypes.NUMBER),
                new iTranslation("user_username", "username", "Username", iTypes.STRING, ""),
                new iTranslation("user_password", "password", "Password", iTypes.STRING, ""),
                new iTranslation("user_firstname", "firstname", "FirstName", iTypes.STRING, ""),
                new iTranslation("user_lastname", "lastname", "LastName", iTypes.STRING, ""),
                new iTranslation("user_email", "email", "Email", iTypes.STRING, ""),
                new iTranslation("user_web_access", "web_access", "HasWebAccess", iTypes.BOOLEAN, false),
                new iTranslation("user_join_date", "join_date", "JoinedDate", iTypes.DATE, new Date()),
                new iTranslation("user_verified", "verified", "Verified", iTypes.BOOLEAN, false),
            ],
            links: [
                new iLink("characters", "Characters", "characters", ["id", "c_user_id"], CharacterModel, iTypes.MANY)
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