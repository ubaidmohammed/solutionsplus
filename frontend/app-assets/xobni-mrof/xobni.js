//linkTemplate: This is if one needs to have a column text linked with some other place
//recordIdAttr: If the link needs another ID instead of the ID in Json...
//templateSource: This is actually showing some other controls such as a toggle button or anything else...

var xobni = {//custom coding for data tables
    api: null,
    columns: null,
    data: null,
    sortBy:null,
    pageSize: null,//-1: Show all in one page will also hide pagination controls, null: show 10 (default) or show what the number assigned per page
    container: null,
    makedt: true,
    enableSelectRecord: false,
    rowIcons: [],
    customDesignHTML: null,
    callAfter: null,//this will call the function after the datagrid is populated...
    assignDataFn: null,
    dataFilters: [],
    dtObject: null,
    rowAttr: "",//this will add Row Attribute to all the columns whose value is set as IsAttribute
    headerButtonTemplate: null,//this will create the button in the header of the column, mostly used for applying to all situation
    customButtonTemplate: null,
    iconTemplate:null,
    reset: function () {
        xobni.api = null;
        xobni.columns = null;
        xobni.data = null;
        xobni.makedt = true;
        xobni.container = "#tbl-datatable";
        xobni.rowIcons = [];
        xobni.assignDataFn = null;
        xobni.callAfter = null;
        xobni.dataFilters = [];
        xobni.headerButtonTemplate = null;
        xobni.pageSize = null;
        xobni.customDesignHTML = null;
        xobni.customButtonTemplate = null;
        xobni.enableSelectRecord = false;
        xobni.rowAttr = "";
        xobni.iconTemplate = null;
    },
    init: function () {
        if (xobni.api == null & xobni.data == null) {
            console.log('No data found');
            return;
        }
        if (xobni.data != null) {//if data is provided you can ignore the APIs
            xobni.renderTable();
            return;
        }
        if (xobni.api != null & xobni.data == null) {
            common.getApi(xobni.api, xobni.assignData, false);
            return;
        }
    },
    assignData: function (d) {
        if (xobni.assignDataFn != null)
            xobni.assignDataFn(d);
        else
            xobni.data = d;
        xobni.renderTable();
    },
    renderTable: function () {
        if ($.fn.DataTable.isDataTable(xobni.container)) {
            xobni.dtObject.destroy();
            $(xobni.container).find('#dt-table-header').html('');
            $(xobni.container).find('#dt-table-body').html('');
        }

        xobni.buildHeader();
        xobni.buildEachRow();
        if (xobni.makedt) {
            if ($.fn.dataTable.isDataTable(xobni.container)) {
                xobni.dtObject = $(xobni.container).DataTable({ "aaSorting": [] });
            } else {
                var options = {};
                if (xobni.pageSize == -1) {
                    options["pageLength"] = xobni.data.length;
                    options["bPaginate"] = false;
                } else if (xobni.pageSize > 0) {
                    options["pageLength"] = xobni.pageSize;
                }
                if (xobni.sortBy != null) {
                    options["order"] = [[xobni.sortBy, 'asc']];
                } else {
                    options["aaSorting"] = [];
                }
                
                xobni.dtObject = $(xobni.container).DataTable(options);
            }
        }
        if (xobni.callAfter != null)
            xobni.callAfter();
        if (xobni.dataFilters.length > 0) {//if there is any filters passed on
            var allFilterHtml = "";
            for (var i = 0; i <= xobni.dataFilters.length - 1; i++) {
                allFilterHtml += `<button type="button" style="margin-right:5px;" class="btn-fill-small radius-10 text-light shadow-dodger-blue bg-dodger-blue" onclick="$('input').attr('type','search').val('${xobni.dataFilters[i]["data"]}').trigger('keyup')">
                    ${xobni.dataFilters[i]["name"]}
                </button>`;
            }
            allFilterHtml += `<button type="button" style="margin-right:5px;" class="btn-fill-small radius-10 text-light shadow-red bg-red" onclick="$('input').attr('type','search').val('').trigger('keyup')">Remove
                </button>&nbsp;`;
            $(allFilterHtml).insertBefore($('#tbl-datatable_filter').find('label'));
        }
        if (xobni.rowIcons.length > 0 || xobni.customButtonTemplate != null) {//remove the sorting option from the last column, only if there is any icons to be shown.
            $(xobni.container).find('th').last().removeClass('sorting')
        }
    },
    tryParseJSON: (records) => {
        try {
            records = removeObjectId(records);
            return JSON.parse(records);
        }
        catch {
            return records;
        }
        return records;
    },
    buildCustomDesign: function (record) {
        return `<td>${Mustache.render(xobni.customDesignHTML, record)}</td>`;
    },
    buildColumns: function (record) {
        xobni.rowAttr = "";
        record = xobni.tryParseJSON(record);
        if (xobni.customDesignHTML != null) {
            return xobni.buildCustomDesign(record);
        }
        var template = $("#grid-row-column").html();
        var rowHTML = "";
        var columnObj = xobni.columns.fields;
        for (let i = 0; i <= columnObj.length - 1; i++) {//build each column
            var val = record[columnObj[i]["dbcolumn"]];

            if (val == null)
                val = "";
            if (columnObj[i]["format"] != undefined) {
                switch (columnObj[i]["format"]) {
                    case "time":
                        val = parseTime(val)
                        break;
                    case "date":
                        val = parseDate(val)
                        break;
                    case "regulardate":
                        val = parseRegularDate(val)
                        break;
                    case "gender":
                        val = parseGender(val.toString());
                        break;
                    case "hidden"://hide the column
                        template = template.replace("{{style}}", "display:none;");
                        break;
                    case "custom"://get the info and send it to custom function to manipluate the data.
                        val = columnObj[i]["customfn"](val.toString());
                        break;
                }
            }
            if (columnObj[i]["isAttribute"] == true) {//if a column needs to have a link ...
                xobni.rowAttr += ` data-${columnObj[i]["dbcolumn"]}='${val}'`;
            }
            var _enum;
            if (columnObj[i]["enum"] != undefined) {
                _enum = enums.getEnum(columnObj[i]["enum"], val);
                val = _enum.name;
            }
            var t = template.replace("{{title}}", val);
            if (columnObj[i]["showmaxchar"] != undefined)
                val = val.substring(0, parseInt(columnObj[i]["showmaxchar"])) + "..."
            if (columnObj[i]["isBadge"] == "true") {
                var badgeColor = "success";
                val = '<span class="badge ' + badgeColor + ' badge-light-info">' + val + '</span>';
            }
            if (columnObj[i]["largeContent"]) {
                _style = `max-width:${columnObj[i]["max-width"]};white-space: nowrap;overflow: hidden;text-overflow: ellipsis;cursor:pointer;`
                t = t.replace("{{style}}", _style);
            }
            if (columnObj[i]["templateSource"] != undefined) {//replace the value with the template to be shown...
                val = $(columnObj[i]["templateSource"]).html().replace(/{{id}}/g, record["id"]).replace(/{{val}}/g, val);
            }
            if (columnObj[i]["linkTemplate"] != undefined) {//if a column needs to have a link ...
                t = t.replace("{{val}}", $(columnObj[i]["linkTemplate"]).html().replace(/{{id}}/g, record["id"]));//replace the value here
            }
            t = t.replace("{{val}}", val);//replace the value here

            if (columnObj[i]["recordIdAttr"] != undefined) {//if a column needs to have a link ...
                t = t.replace(/{{recordIdAttr}}/g, record[columnObj[i]["recordIdAttr"]]);//replace the value here
            }
            rowHTML += t;
        }
        var iconHTML = "";
        if (xobni.rowIcons.length > 0) {
            if (xobni.iconTemplate == null)
                xobni.iconTemplate = '<button   onclick="{{fn}}" type="button" class="btn btn-icon btn-flat-{{btncolor}} waves-effect">\
                    <svg xmlns = "http://www.w3.org/2000/svg" width = "14" height = "14" viewBox = "0 0 24 24" fill = "none" stroke = "currentColor" stroke-width="2" stroke - linecap="round" stroke-linejoin="round" class="feather feather-camera" ><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path><circle cx="12" cy="13" r="4"></circle></svg>\
                                        </button >'
            for (let i = 0; i <= xobni.rowIcons.length - 1; i++) {
                iconHTML += Mustache.render(xobni.iconTemplate, xobni.rowIcons[i]);
            }
        } else if (xobni.customButtonTemplate != null) {// you can either have row icons or custom template
            iconHTML += xobni.customButtonTemplate;
        }
        if (xobni.enableSelectRecord)
            rowHTML = `<td class="colCheckbox"><input class="recordSelect" type="checkbox" value="${record["id"]}"></td>${rowHTML}`;
        if (xobni.rowIcons.length > 0 || xobni.customButtonTemplate != null) {
            iconHTML = iconHTML.replace(/{{id}}/g, record["id"]);
            iconHTML = iconHTML.replace(/{{bool}}/g, record["bool"]);//TODO: do something about replacing the parameters...
            if (record["fname"] != "undefined") {
                iconHTML = iconHTML.replace(/{{fname}}/g, record["fname"]);
                iconHTML = iconHTML.replace(/{{lname}}/g, record["lname"]);
            }
            rowHTML += '<td class="grid-button-cell">' + iconHTML + '</td>';
        }
        return rowHTML;
    },
    buildEachRow: function () {
        var rowhtml = "";
        if (xobni.data == undefined)
            return;
        for (let n = 0; n <= xobni.data.length - 1; n++) {
            var rowRecord = xobni.data[n];
            if (typeof (rowRecord) == 'string') {
                rowRecord = $.parseJSON(rowRecord);
            }

            var columns = xobni.buildColumns(rowRecord);
            rowhtml += `<tr data-recordId='${rowRecord.id}' ${xobni.rowAttr}>${columns}</tr>`;
        }
        $(xobni.container).find('#dt-table-body').html(rowhtml);
    },
    buildHeader: function () {
        var template = $("#grid-header-column").html();
        var header = Mustache.render(template, xobni.columns);
        if (xobni.rowIcons.length > 0 || xobni.customButtonTemplate != null) {
            if (xobni.headerButtonTemplate == null)
                header += "<th>&nbsp;</th>"
            else
                header += `<th>${xobni.headerButtonTemplate}</th>`;
        }
        if (xobni.enableSelectRecord)
            header = '<th class="colCheckbox"><input type="checkbox" id="chkSelecteAll" onclick="xobni.selectAllRecords(this)"></th>' + header;
        header = "<tr>" + header + "</tr>";
        $(xobni.container).find('#dt-table-header').html(header);
    },
    selectAllRecords: function (e) {
        $('.recordSelect').prop("checked", $(e).prop("checked"));
    },
    getSelectedRecords: function () {
        return searchIDs = $(".recordSelect:checked").map(function () {
            return $(this).val();
        }).get();
    }
}

var docGallery = {
    containerId: null,
    data: null,
    init: function (api, tbody, table) {
        common.getApi(api, function (d) {
            d = docGallery.fixThumbnail(d);
            docGallery.renderGallery(d, tbody, table);
        })
    },
    renderGallery: function (d, tbody, table) {
        d = docGallery.fixThumbnail(d);//This will fix the data and generate ThumbURL as well
        docGallery.data = { 'docs': d };
        var docTableHTml = Mustache.render($('#docgallery-template').html(), docGallery.data);
        $(tbody).html(docTableHTml);
        $(table).DataTable();
        $('#documents').find('.dataTables_length').append('<button style="margin-left:15px;" type="button"  class="modal-trigger btn-fill-md radius-10 text-light bg-dodger-blue btn-sm" data-toggle="modal" data-target="#large-modal">New Document Upload&nbsp;<i class="fas fa-upload"></i></button>');
    },
    fixThumbnail: function (d) {
        for (var i = 0; i <= d.length - 1; i++) {
            d[i]["fileThumbUrl"] = installs.webUrl + "/img/" + enums.getEnum("thumbs", d[i].fileType).thumb
        }
        return d;
    }
}

