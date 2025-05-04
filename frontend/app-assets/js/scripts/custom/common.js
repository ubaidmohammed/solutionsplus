var common = {
    loadhtmlcallback: null,
    loadhtml: function (url, e) {
        console.log(url);
        $.get(url, function (_html) {
            $(e).html(_html);
            if (typeof (common.loadhtmlcallback) == "function") {
                common.loadhtmlcallback();
                common.loadhtmlcallback = null;
            }
        })
    },
    updatenavigation: function (nav) {
        $('.nav-item').removeClass('active');
        $('#li-nav-' + nav).addClass('active');
    },
    ddlsearch: function (e) {
        var $this = $(e);
        $this.wrap('<div class="position-relative"></div>');
        $this.select2({
            // the following code is used to disable x-scrollbar when click in select input and
            // take 100% width in responsive also
            dropdownAutoWidth: true,
            width: '100%',
            dropdownParent: $this.parent()
        });
    },
    postApi: function (url, _data, callback) {
        if (!user.validateSession())//if user session is expired, return to login page
            return;
        var d = JSON.stringify(_data);
        $.ajax({
            type: "POST",
            url: `${apiUrl}/${url}`,
            data: d,
            contentType: 'application/json',
            success: function (d) {
                callback(d);
            },
            error: function (req, status, error) {
                console.log(error);
            }
        });
    },
    getApi: function (url, callback) {
        if (!user.validateSession())//if user session is expired, return to login page
            return;
        $.ajax({
            type: "GET",
            url: `${apiUrl}/${url}`,
            success: function (msg) {
                callback(msg);
            },
            error: function (req, status, error) {
                console.log(error);
            }
        });
    },
    appendPrefix: function (len, prefix, val) {
        val = String(val);
        if (val.length >= len)//since the val has all the required characters do nothing
            return val;
        var prefixCount = len - val.length;
        var _prefix = '';
        for (var i = 0; i < prefixCount; i++) {
            _prefix += prefix;
        }
        return _prefix + val;
    },
    updateTime(d) {
        var date = new Date(d);
        return (date.getHours() + ':' + date.getMinutes());
    },
    showAlert(title, text, type) {
        Swal.fire({
            title: title,
            text: text,
            icon: type,
            customClass: {
                confirmButton: 'btn btn-primary'
            },
            buttonsStyling: false
        });
    },
    formateDateTime: function (input) {
        var d = new Date(input);
        return (this.appendPrefix(2, '0', d.getDate()) + "/" + this.appendPrefix(2, '0', (d.getMonth() + 1)) + "/" + d.getFullYear() + " " + this.appendPrefix(2, '0', d.getHours()) + ":" + this.appendPrefix(2, '0', d.getMinutes()));
    }
}

var modal = {
    success: null,
    title: null,
    size: null,
    reset: function () {
        this.success = null;
        this.title = null;
        $('#myModalLabel16').html(this.title);
        $('#modalButton').bind('click', modal.success);
    },
    load: function (url) {
        if (this.size != null) {
            $('.modal-dialog').removeClass('modal-xl');
            $('.modal-dialog').removeClass('modal-lg');
            $('.modal-dialog').addClass(this.size);
        }
        $('#myModalLabel16').html(this.title);
        if (typeof (this.success) == "function") {
            $('#modalButton').bind('click', modal.success);
        }
        common.loadhtml(url, $('#modal-body'));
    }, close() {
        $("#modalwindow").modal('hide');
    }
}

var enums = {
    Floors: [{ "number": 0, "name": "Groud Floor" }, { "number": -1, "name": "Lower Groud Floor" }, { "number": 1, "name": "First Floor" }, { "number": 2, "name": "Second Floor" }, { "number": 3, "name": "Third Floor" }, { "number": 4, "name": "Fourth Floor" }
    ],

    getEnum: function (eType, eVal) {
        var obj = null;
        switch (eType) {

        }
        if (obj == undefined) {
            var obj = [];
            obj["name"] = "";
        }
        return obj;
    },

    getEVal: function (eType, eVal) {
        var obj = null;
        switch (eType) {
            case "calltype":
                obj = lookup(this.CallType, "name", eVal);
                break;
        }
        if (obj == undefined) {
            var obj = [];
            obj["number"] = 0;
        }
        return obj;
    }
}

function lookup(array, prop, value) {
    for (var i = 0, len = array.length; i < len; i++)
        if (array[i] && array[i][prop] === value) return array[i];
}
function getRandomSixDigit() {
    return Math.floor(Math.random() * (999999 - 100000 + 1)) + 100000;
}
