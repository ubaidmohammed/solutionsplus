var incidents = {
    preselection: null,
    urn: null,
    id: null,
    table: null,
    typeofcall: null,
    paramObjs: null,
    exceldata: null,
    recordId: null,
    addNew: function (preselction, typeofcall) {
        modal.size = "modal-xl"
        modal.success = incidents.save;
        modal.title = "Add New Incident";        
        incidents.changecalltype(preselction, typeofcall);
        common.loadhtmlcallback = incidents.selectcalltype;
        modal.load('incidents/new-incident.html?preselection=' + preselction);
        $('#modalButton').show();
    },
    viewIncident: function (naturetype, id) {
        var obj = enums.getEnum("natureform", parseInt(naturetype));
        var typeofcall = null;
        incidents.recordId = id;
        if (obj.for != undefined)
            typeofcall = obj.for;
        incidents.addNew(obj.name, typeofcall);
        $('#modalwindow').modal('show');
    },
    loadIncidentDetails: function () {
        common.getApi("Incidents/GetIncident/" + incidents.recordId, function (d) {
            incidents.viewIncidentDetails(d);
            incidents.recordId = null;
        })
        
    },
    viewIncidentDetails: function (d) {
        d = ConvertKeysToLowerCase(d);
        $('#urn-label').html(d.urn);
        var common = $('#common-form').find('.form-control');
        debugger;
        for (var i = 0; i <= common.length - 1; i++) {
            if ($(common[i]).data("fieldname") == undefined)
                continue;
            var fieldName = $(common[i]).data("fieldname").toLowerCase();
            incidents.fillForm($(common[i]), d[fieldName]);
        }

        var form = $('#' + incidents.preselection + '-form').find('.form-control');
        for (var i = 0; i <= form.length - 1; i++) {
            if ($(common[i]).data("fieldname") == undefined)
                continue;
            var fieldName = $(common[i]).data("fieldname").toLowerCase();
            incidents.fillForm($(common[i]), d[fieldName]);
        }
        $('#modalButton').hide();
    },
    fillForm: function (obj, val) {
        if (val == null)
            return;
        if (obj == null)
            return;
        if ($(obj).hasClass('form-check-input')) {//checbox
            if (val)
                $(obj).attr('checked', true);
            else
                $(obj).attr('checked', false);
            return;
        }

        if ($(obj).hasClass('text-box')) {//text box
            $(obj).val(val);
            return;
        }

    },
    changecalltype: function (preselction, typeofcall, reloadform) {
        if (preselction == "undefined")
            incidents.preselection = "";
        else
            incidents.preselection = preselction.toLowerCase();

        if (typeofcall == null)
            incidents.typeofcall = preselction;
        else
            incidents.typeofcall = typeofcall;

        if (reloadform)
            incidents.selectcalltype(false);
    },
    loadListPage: function () {
        common.loadhtmlcallback = incidents.defaultList;
        common.loadhtml('incidents/list.html', $('#page-content-body'));
        common.updatenavigation('incident');
    },
    defaultList: function () {
        incidents.changeReportDate();
        incidents.incidentReports();
    },
    incidentReports: function () {
        var d = { 'naturetype': $('#ddlCallType').val(), 'startdate': $('#startdate').val(), 'enddate': $('#enddate').val(), 'agentid': $('#ddlAgent').val(), 'departmentid': $('#ddlDepartment').val()};
        incidents.generateReportGrid(d);
    },
    generateReportGrid: function (d) {
        if (department.allDept == null) {
            department.callback = incidents.incidentReports
            department.loadAll();
            return;
        }
        common.postApi("Incidents/GetIncidentList", d, incidents.populateList);
    },
    populateList: function (d) {
        incidents.exceldata = d;
        if (incidents.table != null)
            incidents.table.fnDestroy();
        for (var i = 0; i <= d.length - 1;i++) {
            d[i]["agent"] = user.findUsers("objectId", d[i].agentId);
            d[i]["dept"] = department.findDept("objectId", d[i].department);
            d[i]["calltype"] = enums.getEnum("calltype", d[i].natureType).name;
            d[i]["iDate"] = common.formateDateTime(d[i].dateCreated);
            if (d[i]["dept"] !=undefined) {
                d[i]["flr"] = enums.getEnum("floor", d[i]["dept"].floor).name;
            }            
            d[i]["conFootage"] = enums.getEnum("footage", d[i]["confirmFootage"]).name;
            d[i]["conFootageColor"] = enums.getEnum("footagecolor", d[i]["confirmFootage"]).name;
            if (d[i]["esCalled"]) {
                d[i]["escalled"] = "Yes";
                d[i]["escalledColor"] = "success";
                d[i]["cadno"] = d[i]["cadNumber"]
                //
            } else {
                d[i]["escalled"] = "No";
                d[i]["escalledColor"] = "warning";
                d[i]["escalledColor"] = "warning";
                d[i]["cadno"] = '';
            }
            if (d[i]["nsv"]) {
                d[i]["nsvcolor"] = "success";
            } else {
                d[i]["nsvcolor"] = "danger";
            }
            d[i]["slsubmitted"] = enums.getEnum("slsubmitted", d[i]["slSubmitted"]).name;
            d[i]["slcolor"] = enums.getEnum("slcolor", d[i]["slSubmitted"]).name;
        }
        console.log(d);
        var data = { "incidents": d };
        var template = $("#incidentListRow").html();
        var text = Mustache.render(template, data);
        $("#incidentListGridBody").html(text);
        incidents.table = $('#tableIncidentList').dataTable({ order: [[1, 'desc']],});//sort by date created....
    },
    save: function () {
        var data = incidents.getFormData();
        console.log(data);
        var error = false;
        if (data.Department == "-1") {
            $('#error-ddlDepartmentNewIncident').show();
            error = true;
        }
        if (data.CallerName.length <=5) {
            $('#error-CallerName').show();
            error = true;
        }
        //if (data.CallerNumber.length <= 9) {
        //    $('#error-CallerNumber').show();
        //    error = true;
        //}

        if (error)
            return;
        common.postApi("Incidents/Save", data, incidents.postsave);
        incidents.incidents = null;
    },
    postsave: function (data) {
        common.showAlert("Incident Recorded!", "Thank you for submitting a new incident.", "success");
        modal.close();
    },
    selectcalltype: function (create) {
        $('.error-labels').hide();
        $('.subform').hide();
        $('#' + incidents.preselection + '-form').show();
        $('#' + incidents.preselection + '-form > .second-form').hide();
        $('#' + incidents.preselection + '-form > .' + incidents.typeofcall).show();
        console.log(incidents.preselection);
        $('#ddl-nature-of-call').val(incidents.typeofcall);
        if (create != false && incidents.recordId == null)
            incidents.createTemporary();
        $('#modalButton').off('click').on('click', incidents.save);

        //Enable Time picing
        var timePickr = $('.flatpickr-time');
        // Time
        if (timePickr.length) {
            timePickr.flatpickr({
                enableTime: true,
                noCalendar: true,
                allowInput: true,
                enableSeconds: true,
                minuteIncrement:1
                
            })
        };
        var datePickr = $('.flatpickr-basic');
        // Time
        if (datePickr.length) {
            datePickr.flatpickr();
        };
        incidents.populateDept('#ddlDepartmentNewIncident');
        $('#ddlDepartmentNewIncident').on('select2:select', function (e) {//hide the form validation error for Department selection
            $('#error-ddlDepartmentNewIncident').hide();
            incidents.updateDepDetails(e);
        });
        $('#txt-callername').off('keyup').keyup(function (e) {
            if ($(this).val().length > 5)
                $('#error-CallerName').hide();
        })
        $('#txt-callernumber').off('keyup').keyup(function (e) {
            if ($(this).val().length > 9)
                $('#error-CallerNumber').hide();
        })
    },
    createTemporary: function () {
        //create temp incident and get today's count + temp Incident Id
        common.getApi("Incidents/CreateTemporary", incidents.generateURN);
    },
    generateURN: function (data) {
        var data = $.parseJSON(data);
        const d = new Date();
        count = common.appendPrefix(3, '0', data.count);
        incidents.id = data.incidentId;
        var date = common.appendPrefix(2, '0', d.getUTCDate())  + common.appendPrefix(2,'0', (parseInt( d.getUTCMonth())+1)) + (d.getUTCFullYear()-2000);
        incidents.urn = `SOC-${user.initials}-${date}-${count}`;
        $('#urn-label').html(incidents.urn);
    },
    getDeptDetails: function (deptNumber) {
        var obj = { "number": deptNumber };
        common.postApi("Departments/GetDepartmentDetails", obj, incidents.updateDepDetails);
    },
    updateDepDetails: function (e) {
        var id = e.params.data.id;
        console.log(id);
        var obj = lookup(department.allDept, "objectId", id);
        var deptDetails = obj.name + ', ' + enums.getEnum("floor", obj.floor).name + ', ' + enums.getEnum("deptdivisiontype", obj.division).name + ',' + enums.getEnum("ownershiptype", obj.ownership).name;
        $('#deptDetails').html(deptDetails);
        $('#txt-floor').val(obj.floor);
    },
    getFormData: function () {
        var common = $('#common-form').find('.form-control');
        var form = $('#' + incidents.preselection + '-form').find('.form-control');
        var obj = {};
        $(common).each(function (index) {
            obj[$(this).data("fieldname")] = $(this).val();
        });
        $(form).each(function (index) {
            obj[$(this).data("fieldname")] = $(this).val();
        });
        obj["NatureType"] = incidents.typeofcall;
        obj["URN"] = incidents.urn;
        obj["id"] = incidents.id;
        obj["AgentId"] = user.id;
        return obj;
    },
    populateAgents: function () {
       if (user.allUsers == null) {
           user.loadAll();
            return;
        }
        var obj = user.allUsers;
        var all = { "objectId": "-1", "name": "All" };
        obj.unshift(all);
        var d = { "agents": obj };
        var template = $("#userListOptions").html();
        var text = Mustache.render(template, d);
        $("#ddlAgent").html(text);
        common.ddlsearch($('#ddlAgent'));
    },
    populateDept: function (ctrl) {
        if (department.allDept == null) {
            department.control = ctrl;
            department.loadAll();
            return;
        }
        $(ctrl).empty();
        department.isloadingall = false;
        var obj1 = JSON.parse(JSON.stringify(department.allDept));
        var all = { "objectId": "-1", "name": "All Departments" };
        obj1.unshift(all);
        var d = { "dept": obj1 };
        var template = $("#deptListOption").html();
        var text = Mustache.render(template, d);
        if (ctrl == undefined) {
            $(ctrl).html(text);
            common.ddlsearch($(ctrl));
        } else {
            $(ctrl).html(text);
            common.ddlsearch($(ctrl));
        }
    },
    changeReportDate: function () {
        var t = parseInt($('#ddlRange').val());
        if (t == -1) {
            $('#enddate').val('');
            $('#startdate').val('');
            return;
        }
        var d = new Date();
        d.setDate(d.getDate() - t);
        $('#startdate').val(d.getUTCFullYear() + "-" + (d.getMonth() + 1) + "-" + d.getDate());
        if (t == 0) {//year to date
            $('#startdate').val(d.getUTCFullYear() + "-01-01");
        }
        d = new Date();
        $('#enddate').val(d.getUTCFullYear() + "-" + (d.getMonth()+1) + "-" + d.getDate());
        
        console.log(d);
    },
    getvalue: function (val, nsv, id) {
        if (nsv)
            return "NSV";
        if (val > 0)
            return "£ " + val;
        return "N/A";
    },
    changeslstatus: function (stat, obj) {
        var d = { 'id': obj, 'slsubmitted': stat.toString() };
        incidents.paramObjs = { 'stat': stat, 'obj': obj}
        common.postApi("Incidents/UpdateSlStatus", d, incidents.postslstatus);
    },
    postslstatus: function () {
        obj = incidents.paramObjs['obj'];
        stat = incidents.paramObjs['stat'];
        incidents.paramObjs = null;
        var o = $('#slstatus-' + obj);
        var btn = $(o).find("button")
        $(btn).removeClass('btn-dark').removeClass('btn-info').removeClass('btn-success').removeClass('btn-danger')
        $(btn).addClass('btn-' + enums.getEnum("slcolor", stat).name);
        (btn)[0].textContent = enums.getEnum("slsubmitted", stat).name;
    },
    exportToExcel: function () {
        /* Declaring array variable */
        var d = incidents.exceldata;
        var rows = [];
        var headers = [
            "Date Created",
            "URN",
            "SOC Analyst",
            "Nature of Call",
            "Department",
            "Caller Name",
            "Caller Number",
            "Extension",
            "Guard Attended",
            "Guard Name",
            "Manager Informed",
            "Manager Name",
            "NSV",
            "Value",
            "Footage",
            "ES Called",
            "SL Submitted"
        ]
        var keys = [
            "['dateCreated']",
            "['urn']",
            "['agent']['name']",
            "['calltype']",
            "['dept']['name']",
            "['callerName']",
            "['callerNumber']",
            "['callerExtension']",
            "['GuardAttended']",
            "['guardName']",
            "['managerInformed']",
            "['managerName']",
            "['nsv']",
            "['value']",
            "['conFootage']",
            "['escalled']",
            "['slsubmitted']"
        ]
        var singleRow= []
        for (var i = 0; i <= headers.length - 1; i++) {
            singleRow.push(headers[i]);
        }
        rows.push(singleRow);
        //iterate through rows of table
        for (var i = 0; i<=d.length - 1; i++) {
            //rows would be accessed using the "row" variable assigned in the for loop
            //Get each cell value/column from the row
            /* add a new records in the array */
            var singleRow = []
            for (var n = 0; n <= keys.length - 1; n++) {
                singleRow.push(eval('incidents.exceldata[' +i + ']' + keys[n]));
            }
            rows.push(singleRow);
        }
        csvContent = "data:text/csv;charset=utf-8,";
        /* add the column delimiter as comma(,) and each row splitted by new line character (\n) */
        rows.forEach(function (rowArray) {
            row = rowArray.join(",");
            csvContent += row + "\r\n";
        });

        /* create a hidden <a> DOM node and set its download attribute */
        var encodedUri = encodeURI(csvContent);
        var link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", "Stock_Price_Report.csv");
        document.body.appendChild(link);
        /* download the data file named "Stock_Price_Report.csv" */
        link.click();
    }
}

function ConvertKeysToLowerCase(obj) {
    var output = {};
    for (i in obj) {
        if (Object.prototype.toString.apply(obj[i]) === '[object Object]') {
            output[i.toLowerCase()] = ConvertKeysToLowerCase(obj[i]);
        } else if (Object.prototype.toString.apply(obj[i]) === '[object Array]') {
            output[i.toLowerCase()] = [];
            output[i.toLowerCase()].push(ConvertKeysToLowerCase(obj[i][0]));
        } else {
            output[i.toLowerCase()] = obj[i];
        }
    }
    return output;
};