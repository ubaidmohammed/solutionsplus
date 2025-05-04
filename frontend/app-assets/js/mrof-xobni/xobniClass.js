class XobniClass {
    constructor() {
        this.api = null;
        this.columns = null;
        this.data = null;
        this.pageSize = null; // -1: Show all in one page will also hide pagination controls, null: show 10 (default) or show what the number assigned per page
        this.container = "#tbl-datatable";
        this.makedt = true;
        this.enableSelectRecord = false;
        this.rowIcons = [];
        this.dtOptions = null;
        this.customDesignHTML = null;
        this.callAfter = null; // this will call the function after the datagrid is populated...
        this.assignDataFn = null;
        this.dataFilters = [];
        this.dtObject = null;
        this.headerButtonTemplate = null; // this will create the button in the header of the column, mostly used for applying to all situations
        this.customButtonTemplate = null;
    }

    reset() {
        this.api = null;
        this.columns = null;
        this.data = null;
        this.makedt = true;
        this.container = "#tbl-datatable";
        this.rowIcons = [];
        this.assignDataFn = null;
        this.callAfter = null;
        this.dtOptions = null;
        this.dataFilters = [];
        this.headerButtonTemplate = null;
        this.pageSize = null;
        this.customDesignHTML = null;
        this.customButtonTemplate = null;
        this.enableSelectRecord = false;
    }

    init() {
        if (this.api === null && this.data === null) {
            console.log('No data found');
            return;
        }
        if (this.data !== null) { // if data is provided you can ignore the APIs
            this.preRenderTable();
            return;
        }
        if (this.api !== null && this.data === null) {
            common.getApi(this.api, (d) => this.assignData(d,this), null, null, this);
        }
    }
    assignData(d, xobni) {
        
        if (xobni.assignDataFn != null) {
            xobni.assignDataFn(d);
        } else {
            xobni.data = d;
        }
        xobni.preRenderTable();
    }

    preRenderTable() {
        const tblFields = this.columns.fields;

        const promises = tblFields.map((field) => {
            const optionApi = field?.optionApi;
            if (!optionApi) {
                return Promise.resolve(false);
            }

            return new Promise((resolve, reject) => {
                try {
                    common.getApi(optionApi, (res) => {
                        if (!res) {
                            return resolve(false);
                        }

                        field.dropdownOptions = res;
                        resolve(true);
                    });
                } catch (e) {
                    reject(false);
                    console.error(e);
                }
            });
        });

        Promise.all(promises).then(() => {
            this.renderTable();
        }).catch((error) => {
            console.error("Error in fetching data: ", error);
        });
    }
    renderTable() {
        if ($.fn.DataTable.isDataTable(this.container)) {
            this.dtObject.destroy();
            $(this.container).find('#dt-table-header').html('');
            $(this.container).find('#dt-table-body').html('');
        }

        this.buildHeader();
        this.buildEachRow();

        if (this.makedt) {
            if ($.fn.dataTable.isDataTable(this.container)) {
                this.dtObject = $(this.container).DataTable();
            } else {
                let options;
                if (this.dtOptions !== null) {
                    options = this.dtOptions;
                } else {
                    options = {
                        language: {
                            paginate: {
                                next: '<i class="fas fa-chevron-right"></i>',
                                previous: '<i class="fas fa-chevron-left"></i>'
                            }
                        },
                        columnDefs: [{
                            'targets': [0], // column index [0,1,2,3]
                            'orderable': false, // true or false
                        }],
                        drawCallback: () => {
                            $(this.container + ' input[type="checkbox"]').prop('checked', false);
                        },
                        responsive: true,
                        lengthMenu: [50, 100, 150],
                        pageLength: 50
                    };
                }

                if (this.pageSize == -1) {
                    options["pageLength"] = this.data.length;
                    options["bPaginate"] = false;
                } else if (this.pageSize > 0) {
                    options["pageLength"] = this.pageSize;
                }
                this.dtObject = $(this.container).DataTable(options);
            }
        }

        if (this.callAfter != null) {
            this.callAfter();
        }

        if (this.dataFilters.length > 0) {
            let allFilterHtml = "";
            for (let i = 0; i <= this.dataFilters.length - 1; i++) {
                allFilterHtml += `<button type="button" style="margin-right:5px;" class="btn-fill-small radius-10 text-light shadow-dodger-blue bg-dodger-blue" onclick="$('input').attr('type','search').val('${this.dataFilters[i]["data"]}').trigger('keyup')">
                    ${this.dataFilters[i]["name"]}
                </button>`;
            }
            allFilterHtml += `<button type="button" style="margin-right:5px;" class="btn-fill-small radius-10 text-light shadow-red bg-red" onclick="$('input').attr('type','search').val('').trigger('keyup')">Remove
                </button>&nbsp;`;
            $(allFilterHtml).insertBefore($('#tbl-datatable_filter').find('label'));
        }
    }
    tryParseJSON(records) {
        try {
            records = this.removeObjectId(records); // Assuming removeObjectId is a method of Xobni class
            return JSON.parse(records);
        } catch {
            return records;
        }
    }
    buildCustomDesign(record) {
        return `<td>${Mustache.render(this.customDesignHTML, record)}</td>`;
    }
    buildColumns(record) {
        record = this.tryParseJSON(record);

        if (this.customDesignHTML !== null) {
            return this.buildCustomDesign(record);
        }

        const template = $("#grid-row-column").html();
        let rowHTML = "";
        const columnObj = this.columns.fields;
        const ObjId = getObjectIDString(record["Id"]);

        for (let i = 0; i <= columnObj.length - 1; i++) {
            let val = record[columnObj[i]["dbcolumn"]] || "";

            if (columnObj[i]["format"] !== undefined) {
                switch (columnObj[i]["format"]) {
                    case "time":
                        val = parseTime(val);
                        break;
                    case "date":
                        val = parseDate(val);
                        break;
                    case "regulardate":
                        val = parseRegularDate(val);
                        record[columnObj[i]["dbcolumn"]] = val;
                        break;
                    case "gender":
                        val = parseGender(val.toString());
                        break;
                    case "GetDataEnum":
                        var fn = columnObj[i]["fn"];
                        if (typeof fn === 'function') {
                            val = fn(val.toString());
                        }
                        break;
                }
            }

            let _enum;
            if (columnObj[i]["enum"] !== undefined) {
                _enum = enums.getEnum(columnObj[i]["enum"], val);
                val = _enum.name;
            }
            let t = '';

            if (columnObj[i]["title"] !== undefined) // pass title in the xobni json to dynamic change the title from db record
                t = template.replace("{{title}}", record[columnObj[i]["title"]]);
            else
                t = template.replace("{{title}}", val);


            if (columnObj[i]["showmaxchar"] !== undefined && val.length >= columnObj[i]["showmaxchar"])
                val = val.substring(0, parseInt(columnObj[i]["showmaxchar"])) + "...";
            

            if (columnObj[i]["isBadge"] === "true") {
                const badgeColor = _enum.badge;
                val = `<div class='badge badge-pill badge-${badgeColor} d-block mg-t-8' style='max-width:100px;padding:10px;'>${val}</div>`;
            }

            if (columnObj[i]["largeContent"]) {
                const _style = `max-width:${columnObj[i]["max-width"]};white-space: nowrap;overflow: hidden;text-overflow: ellipsis;cursor:pointer;`;
                t = t.replace("{{style}}", _style);
            }

            if (columnObj[i]["templateSource"] !== undefined) {
                record["Id"] = ObjId;

                if (columnObj[i]["optionApi"] !== undefined && columnObj[i]["dropdownOptions"] !== undefined) {
                    const dropdownOptions = columnObj[i]["dropdownOptions"].map(option => ({
                        ...option,
                        isSelected: option.Id === record.AssignedTo
                    }));
                    columnObj[i]["dropdownOptions"] = dropdownOptions;
                    val = Mustache.render($(columnObj[i]["templateSource"]).html(), columnObj[i]);
                } else {
                    if (record?.DueDate) {
                        const recordDate = new Date(record.DueDate);
                        const currentDate = new Date();
                        currentDate.setHours(0, 0, 0, 0);
                        record.isPastDue = recordDate < currentDate;
                    }

                    record.IsUserRole = (typeof _userRole !== 'undefined' ? _userRole.toString() : "") === "8";
                    if (record?.LeaseName)
                        record.LeaseNameTrim = val;
    
                    val = Mustache.render($(columnObj[i]["templateSource"]).html(), record);
                }
            }

            t = t.replace("{{val}}", val);

            rowHTML += t;
        }

        let iconHTML = "";
        if (this.rowIcons.length > 0) {
            let iconTemplate;
            for (let i = 0; i <= this.rowIcons.length - 1; i++) {
                if (this.rowIcons[i]?.IsAddedToAI && record['IsAddedToAI']) {
                    iconTemplate = '<button type="button" title="Batch Added To AI" class="btn btn-success AddedToAiBtnPad btn-success-light-bg cursor-notAllowed">Added<i class="fas {{icon}} mg-l-10"></i></button>&nbsp;';
                } else {
                    iconTemplate = '<button  onclick="{{fn}}" type="button" class="btn btn-primary">{{label}}\
                                        <i class="fas {{icon}} mg-l-10"></i></button>&nbsp;';
                }

                iconHTML += Mustache.render(iconTemplate, this.rowIcons[i]);
            }
        } else if (this.customButtonTemplate !== null) {
            iconHTML += this.customButtonTemplate;
        }

        if (this.enableSelectRecord) {
            let isDisabled;
            if (record['IsSendToAI'] && record['IsSendToAI'] === "True") {
                isDisabled = 'Disabled';
            } else {
                isDisabled = '';
            }
            rowHTML = `<td class="colCheckbox"><input class="recordSelect" type="checkbox" ${isDisabled} value="${ObjId}"></td>${rowHTML}`;
        }

        if (this.rowIcons.length > 0 || this.customButtonTemplate !== null) {
            iconHTML = iconHTML.replace(/{{Id}}/g, ObjId);
            iconHTML = iconHTML.replace(/{{bool}}/g, record["bool"]);
            if (record["Name"] !== "undefined") {
                iconHTML = iconHTML.replace(/{{Name}}/g, record["Name"]);
            }
            rowHTML += '<td class="grid-button-cell">' + iconHTML + '</td>';
        }

        return rowHTML;
    }
    buildEachRow() {
        let rowhtml = "";
        for (let n = 0; n <= this.data.length - 1; n++) {
            let rowRecord = this.data[n];
            const ObjId = getObjectIDString(rowRecord.Id);

            if (typeof rowRecord === 'string') {
                rowRecord = $.parseJSON(rowRecord);
            }

            rowhtml += `<tr data-recordId='${ObjId}'>`;
            rowhtml += this.buildColumns(rowRecord);
            rowhtml += "</tr>";
        }

        $(this.container).find('#dt-table-body').html(rowhtml);
        $(this.container).find('#dt-table-body .select2').select2({ width: '100%' });
    }

    buildHeader() {
        const template = $("#grid-header-column").html();
        let header = Mustache.render(template, this.columns);

        if (this.rowIcons.length > 0 || this.customButtonTemplate !== null) {
            if (this.headerButtonTemplate === null) {
                header += "<th>&nbsp;</th>";
            } else {
                header += `<th>${this.headerButtonTemplate}</th>`;
            }
        }

        if (this.enableSelectRecord) {
            header = '<td class="colCheckbox"><input type="checkbox" id="chkSelecteAll" onclick="this.selectAllRecords(this)"></td>' + header;
        }

        header = `<tr>${header}</tr>`;
        $(this.container).find('#dt-table-header').html(header);
    }
    selectAllRecords(e) {
        $(this.container).find('.recordSelect:not(:disabled)').prop("checked", $(e).prop("checked"));
    }

    getSelectedRecords() {
        return $(".recordSelect:checked").map(function () {
            return $(this).val();
        }).get();
    }

    // Add other methods here
}