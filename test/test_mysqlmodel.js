const iModel = require("../").Model;
const iTypes = require("../").ModelTypes;

class InventoryItemModel extends iModel {
    constructor(DB) {
        super(DB, {
            table: "inventory_items",
            translations: [
                ["ii_inv_id", "inv_id", iTypes.NUMBER],
                ["ii_quantity", "quantity", iTypes.NUMBER],
                ["ii_item_desc", "descriptor", iTypes.STRING],
                ["ii_slot_num", "slot_id", iTypes.NUMBER]
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
                ["inv_id", "id", iTypes.NUMBER],
                ["inv_char_id", "char_id", iTypes.NUMBER],
                ["inv_name", "name", iTypes.STRING],
                ["inv_size", "size", iTypes.NUMBER]
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
                ["c_id", "id", iTypes.NUMBER],
                ["c_user_id", "user_id", iTypes.NUMBER],
                ["c_name", "name", iTypes.STRING],
                ["c_mapname", "mapname", iTypes.STRING]
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
                ["user_id", "id", iTypes.NUMBER],
                ["user_username", "username", iTypes.STRING],
                ["user_password", "password", iTypes.STRING],
                ["user_firstname", "firstname", iTypes.STRING],
                ["user_lastname", "lastname", iTypes.STRING],
                ["user_email", "email", iTypes.STRING],
                ["user_web_access", "web_access", iTypes.BOOLEAN],
                ["user_join_date", "join_date", iTypes.DATE],
                ["user_verified", "verified", iTypes.BOOLEAN],
            ],
            links: [
                ["characters", "characters", ["id", "c_user_id"], CharacterModel]
            ]
        })
    }

    getSearchData(){
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