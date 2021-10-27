const serialize = require("serialijse");

Tools = {};
Tools.modal_opened = false;

Tools.declareSerializedClasses = function (...Classes) {
    for (let i = 0; i < Classes.length; i++) {
        serialize.declarePersistable(Classes[i]);
    }
}

Tools.declareSerializedClassesArray = function (Classes) {
    for (let i = 0; i < Classes.length; i++) {
        serialize.declarePersistable(Classes[i]);
    }
}

Tools.serialize = function (obj) {
    return serialize.serialize(obj);
}

Tools.deserialize = function (obj) {
    return serialize.deserialize(obj);
}

Tools.generateRandomString = function (length) {
    var text = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

    for (var i = 0; i < length; i++)
        text += possible.charAt(Math.floor(Math.random() * possible.length));

    return text;
};

Tools.generateRandomInt = function (length) {
    var text = "";
    var possible = "0123456789";

    for (var i = 0; i < length; i++)
        text += possible.charAt(Math.floor(Math.random() * possible.length));

    return text;
};

Tools.generateUUID = function (format) {
    var formatdata = format.split("-");

    var ret_str = "";

    for (var i = 0; i < formatdata.length; i++) {
        var d = formatdata[i];
        if (i > 0) {
            ret_str = ret_str + "-" + Tools.generateRandomString(d.length);
        } else {
            ret_str = ret_str + Tools.generateRandomString(d.length);
        }
    }

    formatdata = undefined;
    return ret_str;
}

Tools.openModal = function (modal_dir, modal_name, var1, var2) {

    let options = {
        allowBackdropRemoval: true
    };

    let callback = null;

    if (arguments.length == 3) {
        callback = var1;
    } else if (arguments.length == 4) {
        options = var1;
        callback = var2;
    }

    if ($("body").hasClass("modal-open")) {
        return;
    }

    $.ajax({
        url: modal_dir + "/" + modal_name + ".html",
        success: function (data) {

            $('body').append(data);

            var modalEl = $("#" + modal_name);

            modalEl.find("button.close").on("click", (e) => {
                e.preventDefault();
                const $this = $(e.currentTarget).parent().parent().parent().parent();
                $this.remove();
                $this.trigger("hidden.bs.modal");
                $this.modal("hide");
                $("body").removeClass("modal-open").attr("style", null);
                $(".modal-backdrop").remove();
            })

            modalEl.on('hidden.bs.modal', () => {
                $(this).remove();
                $('[name^="__privateStripe"]').remove();
                Tools.modal_opened = false;
                if (options.allowBackdropRemoval == true)
                    $('.modal-backdrop').remove();
            });
            modalEl.modal('show');
            if (callback)
                callback(modalEl);
        },
        dataType: 'html'
    });
};

module.exports = Tools;