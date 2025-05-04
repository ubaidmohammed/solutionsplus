class XobniNew {
    constructor(currentInstance) {
        this.api = null;
        this.columns = null;
        this.data = null;
        this.copyButtonIcon = '<i class="far fa-copy mx-1 cursor-pointer float-end LeaseNameCopyBtn" onclick="copyLeaseName(this)" title=" "></i>';
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
        this.isDtreqPagination = null;
        this.currentInstance = currentInstance;
        this.uniquetableName = "dtTable";
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
        this.isDtreqPagination = null;
        this.currentInstance = null;
        this.uniquetableName = "dtTable";
    }

	init(filterData) {
        if (this.api === null) {
            console.error('NO API Found');
            return;
        }
		if (this.data !== null) {
			// if data is provided you can ignore the APIs
			this.preRenderTable(filterData);
            return;
        }
        if (this.api !== null && this.data === null) {
			this.preRenderTable(filterData);
        }
    }

	preRenderTable(filterData) {
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
            if (this.isDtreqPagination)
                this.renderTableServerSide(filterData);
            else{
                common.getApi(this.api, (d) => this.assignData(d,this), null, null, this);
                this.renderTable();
            }

        }).catch((error) => {
            console.error("Error in fetching data: ", error);
        });
    }
    assignData(d, xobni) {
        
        if (xobni.assignDataFn != null) {
            xobni.assignDataFn(d);
        } else {
            xobni.data = d;
        }
        xobni.preRenderTable();
    }
    renderTableServerSide(filterData) {
        currXobni = this;
        if ($.fn.DataTable.isDataTable(this.container)) {
            this.dtObject.destroy();
            $(this.container).find('#dt-table-header').html('');
            $(this.container).find('#dt-table-body').html('');
        }
        try {
            var currCol = this.getDataFilter(this.columns);
            var columnDefs = this.generateColumnDefs(currCol);
            this.dtObject = $(this.container).DataTable({
                "tableName": this.uniquetableName,
                "serverSide": true,
                "processing": true,
                "paging": true,
                "searchHighlight": true,
                "searching": { "regex": true },
                "searchDelay": 2000,
                "lengthMenu": [50,100,150],
                "pageLength": 50,
                "dom": 'plfrtip',
                "ajax": {
                    "type": "POST",
                    "url": `${installs.apiUrl}/${this.api}`,
                    "dataType": "json",
                    "contentType": 'application/json; charset=utf-8',
                    "data": function (data) {
                        // Grab form values containing user options
                        let form = {};
                        if (filterData?.length) {
                            const lastElement = filterData.at(-1);
                            if (lastElement && 'IsAndStatus' in lastElement) {
                                form.IsAndStatus = lastElement.IsAndStatus;
                                form.filter = filterData.slice(0, -1);
                            } else {
                                form.filter = filterData;
                            }
                        }
                        $.extend(data, form);
                        return JSON.stringify(data);
                    },
                    "dataSrc": function (response) {
                        console.log("Server response:", response);
                        return response.data; // DataTables will use this to populate the table
                    },
                    "complete": (response) => {
                        if (this.callAfter != null) {
                            this.callAfter();
                        }
                    },
                    "error": function (response) {
                        console.error(response);
                    }
                },
                "order": [],
                "columns": currCol,
                "language": {
                    "paginate": {
                        "next": '<i class="fas fa-chevron-right"></i>',
                        "previous": '<i class="fas fa-chevron-left"></i>'
                    }
                },
                "columnDefs": columnDefs,
                "createdRow": function (row, data, dataIndex,res,d,e,r,s,) {
                    // Add a custom attribute to the row
                    $(row).attr('data-recordid', data.Id);
                    $('td', row).each(function (colIndex) {
                        var cellData = data[currCol[colIndex].data];
                        $(this).attr('title', cellData);
                    });
                },
                "fnRowCallback": function(nRow, aData, iDisplayIndex, iDisplayIndexFull) {
                    if(aData.IsSendToAI && typeof _userRole !== 'undefined' &&_userRole === "2" ){
                        $(nRow).addClass('sendToAiRow');
                    }
                },
                "drawCallback": () =>{
                    $(this.container + ' input[type="checkbox"]').prop('checked', false);
                },
                "responsive": {
                    details: {
                        renderer: function (api, rowIdx, columns) {
                            return responsiveGrid(api, rowIdx, columns);
                        }
                    }

                },
                "dom": 'plfrtip',
            });
            var debounce = new $.fn.dataTable.Debounce(this.dtObject);
            
            this.dtObject.on('draw', () => {
                $(`${this.container}`).find('#dt-table-body .select2').select2({ width: '100%' });
                if (document.getElementById('chkSelecteAll') != null)
                    document.getElementById('chkSelecteAll').onclick = () => this.selectAllRecords(document.getElementById('chkSelecteAll'))

                $("#count-badge").html('0 Selected');

                common.setupTooltip('table .LeaseNameCopyBtn', 'Click To Copy', true, 'Copied!');
            });
            
        } catch (e) {
            console.error(e);
        }
    }
    AddCopyButton(td, data, rowTdCol, userRole,className,icon) {
        const shouldAddCopyButton = data &&
            userRole !== null &&
            ((rowTdCol === 3 && userRole === "2") || (rowTdCol === 2 && userRole !== "2"));

        if (shouldAddCopyButton)
            $(td).addClass(className).append(icon);
    }
    getDataFilter(fieldsObj) {
        var { fields } = fieldsObj;
        if (fields && fields.length)
            if (this.enableSelectRecord)
                fields.unshift({});
            return fields.map((x,i) => {
                var obj = {};
                obj.title = x.header;
                obj.data = x.dbcolumn;
                obj.searchable = x?.searchable ?? true;
                obj.name = x?.searchBy;
                obj.orderable = x?.isSorting ?? false;
                obj.defaultContent = ''

                if (i === 0) {
                    if (this.enableSelectRecord) {
                        obj.enableSelectRecord = true;
                        obj.title = `<td class="colCheckbox"><input type="checkbox" id="chkSelecteAll"></td>`;
                        obj.render = (data, type, record) => {
                            var res = `<td class="colCheckbox"><input class="recordSelect" onclick="currXobni.updateSelectedCnt()" type="checkbox" value="${getObjectIDString(record['Id'])}"></td>`;
                            return res;
                        }
                    }
                }
                if (x.render) {
                    obj.render =  (data, type, row) => {
                        var res = this.buildColumns(x, row);
                        return res;
                    }
                }
                return obj
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
                        }
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
    buildColumns(field, record) {
        record = this.tryParseJSON(record);

        if (this.customDesignHTML !== null) {
            return this.buildCustomDesign(record);
        }

        const template = $("#grid-row-column").html();
        let rowHTML = "";
        const columnObj = [field]
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

            let t = template.replace("{{title}}", val);

            if (columnObj[i]["showmaxchar"] !== undefined && val.length >= columnObj[i]["showmaxchar"]) {
                val = val.substring(0, parseInt(columnObj[i]["showmaxchar"])) + "...";
            }

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
                        isSelected: option.Id === (record?.UserAssignee?.UserId || "")
                    }));
                    var selectedUserassigned = dropdownOptions?.find(x => x.isSelected) || null;
                    columnObj[i]["dropdownOptions"] = dropdownOptions;
                    columnObj[i]["isUserAssigned"] = record?.UserAssignee?.IsUsersFreeze;
                    columnObj[i]["isUserUnAssigned"] = record?.IsUserUnassigned == "True" || "";
                    columnObj[i]["selectedUserId"] = selectedUserassigned?.Id || "0";
                    columnObj[i]["selectedUserName"] = selectedUserassigned?.Name || "Select user";

                    // Pass the modified dropdownOptions to Mustache render
                    val = Mustache.render($(columnObj[i]["templateSource"]).html(), columnObj[i]);
                } else {
                    if (record?.DueDate) {
                        const recordDate = new Date(record.DueDate);
                        const currentDate = new Date();
                        recordDate.setHours(0, 0, 0, 0); // Reset both the dates' time to match only dates
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

            if (i === columnObj.length - 1 && val === "") {
                t = "";
            }
            rowHTML += t;
        }

        let iconHTML = "";
        if(typeof(field.isRowIcon) === "undefined")
            field.isRowIcon = true; // if row icon and templateSource both are avilable pass isRowIcon false

        if (this.rowIcons.length > 0 && !field.templateSource && field.isRowIcon) {
            let iconTemplate;
            for (let i = 0; i <= this.rowIcons.length - 1; i++) {
                if (this.rowIcons[i]?.IsAddedToAI && record['IsAddedToAI']) {
                    iconTemplate = `<button type="button" title="Batch Added To AI" class="btn btn-success btn-success-light-bg cursor-notAllowed"><i class="fas fa-check-circle me-1"></i>Added</button>&nbsp;`;
                } else {
                    iconTemplate = `<button  onclick="{{fn}}" type="button" class="btn btn-primary ${this.rowIcons[i]?.extraClass}">{{label}}\
                                        <i class="fas {{icon}} mg-l-10"></i></button>&nbsp;`;
                }

                iconHTML += Mustache.render(iconTemplate, this.rowIcons[i]);
            }
        } else if (this.customButtonTemplate !== null) {
            iconHTML += this.customButtonTemplate;
        }

        //if (this.enableSelectRecord) {
        //    let isDisabled;
        //    if (record['IsSendToAI'] && record['IsSendToAI'] === "True") {
        //        isDisabled = 'Disabled';
        //    } else {
        //        isDisabled = '';
        //    }
        //    rowHTML = `<td class="colCheckbox"><input class="recordSelect" type="checkbox" ${isDisabled} value="${ObjId}"></td>${rowHTML}`;
        //}

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
            header = '<td class="colCheckbox"><input type="checkbox" id="chkSelecteAll" onclick="currXobni.selectAllRecords(this)"></td>' + header;
        }

        header = `<tr>${header}</tr>`;
        $(this.container).find('#dt-table-header').html(header);
    }
    selectAllRecords(e) {
        var totalLength = $(this.container).find('.recordSelect:not(:disabled)');
        totalLength.prop("checked", $(e).prop("checked"));
        this.updateSelectedCnt();
    }

    getSelectedRecords() {
        return $(this.container).find(".recordSelect:checked").map(function () {
            return $(this).val();
        }).get();
    }
    updateSelectedCnt() {
        var currSelectedRec = this.getSelectedRecords();
        $(this.container).closest('div.modal-add-new-user').prev('div.showbadgeSec').find('span#count-badge').html(`${currSelectedRec.length} Selected`);
    }
    generateColumnDefs(columns) {// this function adds custom width to the first and last column of the grid if enableSelectRecord is true
        const columnDefs = [];

        // Check if the first column has enableSelectRecord and add it to columnDefs
        if (columns[0]?.enableSelectRecord) {
            columnDefs.push({
                targets: 0,
                width: "1px",
                orderable: columns[0].orderable
            });
        }

        // Add definitions for all columns except the first and last one
        columns.slice(1, -1).forEach((col, index) => {
            columnDefs.push({
                targets: index + 1,  // Adjust the index since we skipped the first column
                orderable: col.orderable,
                createdCell: (td, cellData, rowData, row, colIndex) => {
                    if (typeof _userRole !== 'undefined' && rowData?.LeaseName) {
                        this.AddCopyButton(td, rowData?.LeaseName, colIndex, _userRole, 'copy-btn-wth-leasename', this.copyButtonIcon);
                    }
                }
            });
        });

        // Add a custom definition for the last column if enableSelectRecord is true for the first column
        if (columns[0]?.enableSelectRecord) {
            columnDefs.push({
                targets: -1,
                width: "1px",
                orderable: columns[columns.length - 1]?.orderable
            });
        }

        return columnDefs;
    }
}