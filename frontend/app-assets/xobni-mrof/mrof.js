
var mrof = {
    apiDataCount: 0,
    recordId: null,//this is null if new record is being created or set the id here...
    tempId: null,//thjs if the new record is created, so hold the data in the tempId, used to update the fileupload, picture upload etc.
    apiOptionFields: [],//this is not used any more
    fields: null,//these are the fields of the form
    fileId: null,//not used any more
    fileType: null,//not used any more
    containerId: null,//this is the container Id where the entire form is rendered
    aftercomplete: null,//this is the pointer to a function that needs to be called once the form is saved such as redirect to a listing page or refresh the page etc..
    loadDataApi: null,//name of the API from where the data needs to be loaded, in case of editing a record
    filetag: null,//this is used for the file tag such as profilepicture or product picture etc.
    formhasfiles: false,//this sets it to true if there is any file uploaded in the form
    refreshcache: null,//this is used to refresh any data which is cached, if this is true the sytem will load the data from the server once a record is updated called after the save form
    hiddenVal: null,//every form can have some hidden values that doens't need to be shown to the user but needs to be submitted while saving the data...
    data: [],//this is for filling up with existing data, if you are not loading the data from the API
    saveapi: null,//this is a reference to the API where the data would be saved.
    fileRecords: [],//this is the array of files that a form can have
    isFormRendered: false,//this is set to true only after the form is rendered
    fetchdataforeditapi: null,//this is a pointer to an API, if the form is being edited what is the API to get the data
    callbackafterrender: null,//as the variabel name suggest this is call back after the form is rendered
    appendFormData: null,//you may have certain information that is not a part of the form yet you want it to be submitted to the form...
    fileControlId: null,//this is the control Id where the form is rendered...
    resetmrof: function () {//this function resets all the form objects, this is must to call before a form is rendered or initiated. This is the first line that must be called.
        mrof.fetchdataforeditapi = null;
        mrof.loadDataApi = null;
        mrof.tempId = null;
        mrof.apiDataCount = 0;
        mrof.recordId = null;
        mrof.apiOptionFields = [];
        mrof.fields = null;
        mrof.fileId = null;
        mrof.fileType = null;
        mrof.containerId = null;
        mrof.aftercomplete = null;
        mrof.data = [];//this is for filling up with existing data
        mrof.saveapi = null;
        mrof.filetag = null;
        mrof.formhasfiles = false;
        mrof.fileRecords = [];
        mrof.isFormRendered = false;
        mrof.hiddenVal = null;
        mrof.callbackafterrender = null;
        mrof.appendFormData = null;
        mrof.fileControlId = null;
    },
    init: function (fields, containerId, data, saveapi, fn) {
        //fields are the set of the fields that needs to be shown on the form
        //containerId is the Div or any html element here the form will be rendered
        //data is the json array of object to render the form and fillin the info
        // saveapi is the API that you can send to save the data
        //fn is the pointer to another JS function which should be called after rendering is complete.
        mrof.fields = fields;
        if (containerId == null)// if no container ID is sent, it will default to one specific container
            containerId = "form-container";
        mrof.containerId = containerId;
        mrof.data = data;
        mrof.saveapi = saveapi;
        if (mrof.recordId == "-1") {//if it's a new record it must have a unique id
            mrof.tempId = generateUUID();
        }
        else {
            mrof.tempId = mrof.recordId;//else set the recordId to the form
            mrof.downloadFileRecords();//if must have the file records to show the edited version of the form
        }
        mrof.downloadAPIData(fields);//get the edit data
        if (fn != null) {
            mrof.callbackafterrender = fn;//call the function after the form is rendered.
        }
    },
    downloadFileRecords: function () {
        //the API should be changed, but one needs to send the Record ID to get the fiels associated with the form
        common.getApi("FileUpload/GetFilesByRecordId/" + mrof.recordId, function (d) {
            mrof.fileRecords = d;
            if (mrof.isFormRendered)
                mrof.showFilesOnFormControl(mrof.fileRecords);//this will list all the files found with the records
        })
    },
    showFilesOnFormControl: function (d) {
        //this shold change as per custom logic
        var allFiles = $('.file-upload-div');
        for (let i = 0; i <= allFiles.length - 1; i++) {
            var obj = $(allFiles[i]);
            var f = mrof.fileRecords.filter(el => el.fileTag = $(obj).data("filetype"))
            if (f.length > 0) {
                //$(obj).css('background-image', 'url(`/cache/${installs.domain}/${f[0].id}${f[0].fileType}`)');
                $(obj).css('background-image', 'url(' + installs.webUrl + "/cache/" + installs.domain + "/" + f[0].id + f[0].fileType + ')');
            }
        }
    },
    aftergetdataforedit: function (d) {
        mrof.fetchdataforeditapi = null;
        var keys = Object.keys(d);
        for (let i = 0; i <= keys.length - 1; i++) {
            var attr = keys[i];
            if (attr == "_id")
                continue;
            mrof.data[attr] = d[attr];
        }
        mrof.fillinform();
    },
    buildIndividualFields: function (__fields) {
        var formhtml = "<div class='row'>";
        for (var i = 0; i <= __fields.length - 1; i++) {
            if (__fields[i].type == "newrow") {
                formhtml += '</div>';
                formhtml += '<div class=\'row\'>';
                continue;
            }
            var template = $(`#form-${__fields[i].type}-field`).html();
            formhtml += `${Mustache.render(template, __fields[i])}`;
        }
        formhtml += '</div>';
        return formhtml;
    },
    addMultiRecordRow: function () {
        var multiRecords = mrof.fields.find(x => x.type == "multi-records")
        if (multiRecords != undefined) {
            multiRecords["currentIndex"]++;
            for (var i = 0; i <= multiRecords.data.length - 1; i++) {
                multiRecords.data[i]["field"] = `${multiRecords.data[i]["field"]}_${multiRecords["field"]}_${multiRecords["currentIndex"]}`
            }
            $(`#multi-record-container-${multiRecords.field}`).append('<hr />' + mrof.buildIndividualFields(multiRecords.data));
        }
    },
    renderForm: function () {
        console.log(mrof.fileRecords);
        console.log(mrof.fields);
        console.log("--- I HAVE GOT ALL THE DATA ---");
        //first get the data of any dependant fields
        $("#" + mrof.containerId).html(mrof.buildIndividualFields(mrof.fields));
        var multiRecords = mrof.fields.find(x => x.type == "multi-records")
        if (multiRecords != undefined) {
            multiRecords["currentIndex"] = 1;
            for (var i = 0; i <= multiRecords.data.length - 1; i++) {
                multiRecords.data[i]["field"] = `${multiRecords.data[i]["field"]}_${multiRecords["field"]}_${multiRecords["currentIndex"]}`
            }
            $(`#multi-record-container-${multiRecords.field}`).html(mrof.buildIndividualFields(multiRecords.data));
        }
        //debugger;
        $('.select2').select2({
            width: '100%'
        });
        common.renderDate();
        if (mrof.recordId != '-1')
            mrof.fillinform();

        mrof.isFormRendered = true;
        if (mrof.fileRecords.length > 0)
            mrof.showFilesOnFormControl(mrof.fileRecords);
        console.log('Form Rendered');
        if (mrof.callbackafterrender != null)
            mrof.callbackafterrender();
    },
    downloadAPIData: function (fields) {//get all DDL with options = null
        if (mrof.apiDataCount == mrof.fields.length) {//render form if all the download APIs are completed
            mrof.renderForm();
            return;
        }
        if (mrof.fields[mrof.apiDataCount].type == undefined) {
            mrof.apiDataCount++;
            mrof.downloadAPIData();
            return;
        }
        if ((mrof.fields[mrof.apiDataCount].type == "ddl" || mrof.fields[mrof.apiDataCount].type == "multiselect") && mrof.fields[mrof.apiDataCount].options == null) {
            common.getApi(mrof.fields[mrof.apiDataCount].optionapi.api, mrof.updateApiOptions);
            return;
        } else {
            mrof.apiDataCount++;
            mrof.downloadAPIData();
            return;
        }
        mrof.renderForm();
    },
    rebind: function (_field) {//this function will rebind the data with APIs
        var field = lookup(mrof.fields, "field", _field);
        if (field == undefined) {
            console.log("No field found")
            return;
        }
        common.getApi(field.optionapi.api, function (d) {
            var options = [];
            var textfield = field.optionapi.text;
            var valfield = field.optionapi.val;
            if (field["defaultOption"] != undefined) {
                options.push({
                    "label": field["defaultOption"], "val": -1
                })
            }
            for (let i = 0; i <= d.length - 1; i++) {
                if (typeof (d[i]) == "string")
                    var obj = $.parseJSON(removeObjectId(d[i]));
                else
                    var obj = d[i];
                options.push({ "label": obj[textfield], "val": obj[valfield] })
            }
            field["options"] = options;
            var template = $(`#form-${field.type}-field`).html();
            $(`div.form-group[data-fieldname="${_field}"]`).html(Mustache.render(template, field));
            $('.select2').select2({
                width: '100%'
            });

        }, false);

    },
    updateApiOptions: function (d) {
        var obj = mrof.fields[mrof.apiDataCount];
        var options = [];
        var textfield = obj.optionapi.text;
        var valfield = obj.optionapi.val;
        if (obj["defaultOption"] != undefined) {
            options.push({
                "label": obj["defaultOption"], "val": -1
            })
        }
        for (let i = 0; i <= d.length - 1; i++) {
            if (typeof (d[i]) == "string")
                var obj = $.parseJSON(removeObjectId(d[i]));
            else
                var obj = d[i];
            options.push({ "label": obj[textfield], "val": obj[valfield] })
        }
        mrof.fields[mrof.apiDataCount]["options"] = options;
        mrof.apiDataCount++;
        mrof.downloadAPIData();
    },
    selectItem: function (obj) {
        if ($(obj).data("isselected")) {
            $(obj).data("isselected", false).removeClass('multi-select-item-selected');
        } else
            $(obj).data("isselected", true).addClass('multi-select-item-selected');
    },
    getformdata: function () {//this will get the data before saving and convert into Json
        $('.alert1').hide();
        var isFormError = false;
        var formdata = "";
        var inputs = $('#' + mrof.containerId).find('input, textarea');//all input boxes
        for (let i = 0; i <= inputs.length - 1; i++) {
            var currInput = $(inputs[i]);
            var isRequired = currInput.attr('data-isrequired');
            var regexPattern = currInput.attr('data-regex'); // custom validation regex
            if (isRequired == "1" && currInput.val() == "") {//is required validation
                $('#error-' + $(currInput).attr('data-fieldname')).html($(currInput).attr('data-isreqerror')).show();
                isFormError = true;
            } else {
                var fieldVal = mrof.getfieldvalue(currInput);
                if (regexPattern && !new RegExp(regexPattern).test(currInput.val())) {//custom regex validation
                    $('#error-' + $(currInput).attr('data-fieldname')).html($(currInput).attr('data-regexmsg')).show();
                    isFormError = true;
                } else {
                    if (fieldVal != null) {
                        if (formdata.length > 0)
                            formdata += ",";
                        if (currInput.data('stringify') == '1')
                            fieldVal = JSON.stringify(fieldVal);
                        formdata += fieldVal;
                    }
                }
            }
        }

        var selectedPersona = $('input[name=selectpersona]:checked');
        var selectedIndividual = $('input[name=selectindividualuser]:checked');
        var selectedClass = $('input[name=selectclass]:checked');
        if (selectedPersona.length > 0) {
            var multiSelectVal = "";
            var fieldName = selectedPersona.attr('data-fieldname');
            for (let i = 0; i <= selectedPersona.length - 1; i++) {
                if (multiSelectVal.length > 0)
                    multiSelectVal += ",";
                multiSelectVal += selectedPersona[i].value;
            }
            formdata += ',"' + fieldName + '":"' + multiSelectVal + '"';
            formdata += ',"classIds":""';
            formdata += ',"usersList":""';
        }
        else if (selectedClass.length > 0) {
            var multiSelectVal = "";
            var fieldName = selectedClass.attr('data-fieldname');
            for (let i = 0; i <= selectedClass.length - 1; i++) {
                if (multiSelectVal.length > 0)
                    multiSelectVal += ",";
                multiSelectVal += selectedClass[i].value;
            }
            formdata += ',"' + fieldName + '":"' + multiSelectVal + '"';
            formdata += ',"forPersona":""';
            formdata += ',"usersList":""';
        }
        else if (selectedIndividual.length > 0) {
            var multiSelectVal = "";
            var fieldName = selectedIndividual.attr('data-fieldname');
            for (let i = 0; i <= selectedIndividual.length - 1; i++) {
                if (multiSelectVal.length > 0)
                    multiSelectVal += ",";
                multiSelectVal += selectedIndividual[i].value;
            }
            formdata += ',"' + fieldName + '":"' + multiSelectVal + '"';
            formdata += ',"classIds":""';
            formdata += ',"forPersona":""';
        }

        //var inputs = $('#' + mrof.containerId).find('textarea');//all text areas
        //for (let i = 0; i <= inputs.length - 1; i++) {
        //    var isRequired = $(inputs[i]).attr('data-isrequired');
        //    if (isRequired == "1" && $(inputs[i]).val() == "") {
        //        $('#error-' + $(inputs[i]).attr('data-fieldname')).show();
        //        isFormError = true;
        //    } else {
        //        var fieldVal = mrof.getfieldvalue($(inputs[i]), $(inputs[i]).data('stringify'));
        //        if (fieldVal != null) {
        //            if (formdata.length > 0)
        //                formdata += ",";
        //            formdata += fieldVal;
        //        }
        //    }
        //}
        var selectDdl = $('#' + mrof.containerId).find('select');//all drop down selectable items

        for (let i = 0; i <= selectDdl.length - 1; i++) {
            var isRequired = $(selectDdl[i]).attr('data-isrequired');
            if (isRequired == "1" && $(selectDdl[i]).val() == "") {
                $('#error-' + $(selectDdl[i]).attr('data-fieldname')).show();
                isFormError = true;
            } else {
                var fieldVal = mrof.getfieldvalue($(selectDdl[i]));
                if (fieldVal != null) {
                    if (formdata.length > 0)
                        formdata += ",";
                    formdata += fieldVal;
                }
            }
        }

        var select2 = $('#' + mrof.containerId).find('.select2');//all drop downs
        for (let i = 0; i <= select2.length - 1; i++) {
            var isRequired = $(select2[i]).attr('data-isrequired');
            if (isRequired == "1" && $(select2[i]).val() == "") {
                $('#error-' + $(select2[i]).attr('data-fieldname')).show();
                isFormError = true;
            } else {
                var fieldVal = mrof.getfieldvalue($(select2[i]));
                if (fieldVal != null) {
                    if (formdata.length > 0)
                        formdata += ","
                    formdata += fieldVal;
                }
            }
        }
        var fileinputs = $('#' + mrof.containerId).find('.file-upload');//all input boxes

        var multiselect = $('#' + mrof.containerId).find('.form-multiselect');

        for (let i = 0; i <= multiselect.length - 1; i++) {
            //var obj = $('#multiselect-teachers').find('.multiselectitem')
            var multiSelectVal = "";
            var fieldname = $(multiselect[i]).data('fieldname');
            var obj = $('#multiselect-' + fieldname).find('.multiselectitem');
            if (obj.length > 0) {
                for (let n = 0; n <= obj.length - 1; n++) {
                    var a = obj[n];
                    if ($(a).data("isselected")) {
                        if (multiSelectVal.length > 0)
                            multiSelectVal += ",";
                        multiSelectVal += $(a).data("val");
                    }
                }
            }
            if (formdata.length > 0)
                formdata += ',';
            formdata += '"' + fieldname + '":"' + multiSelectVal + '"';
        }

        var multiset = $('#' + mrof.containerId).find('.multiset-form-fields');
        for (let i = 0; i <= multiset.length - 1; i++) {
            var fieldname = $(multiset[i]).data('fieldname');
            var multiSelectVal = "";
            $(multiset[i]).find('input[type=checkbox]').each(function () {
                if ($(this).prop('checked')) {
                    multiSelectVal+= `${$(this).data('val')},`
                }
            })
            formdata += '"' + fieldname + '":"' + multiSelectVal + '"';
        }

        if (isFormError)
            return;
        console.log('Get the form data');
        formdata += ',"id":"' + mrof.recordId + '"';
        if (mrof.hiddenVal != null)
            formdata += ',' + mrof.hiddenVal;
        if (mrof.appendFormData != null)
            formdata = mrof.appendFormData(formdata);
        formdata = "{" + formdata + "}";
        return formdata;
    },
    formvalidation: function () {
        formdata = mrof.getformdata();
        common.postApi(mrof.saveapi, formdata, mrof.formsuccess);
    },
    formsuccess: function (d) {
        if (!mrof.formhasfiles) {
            mrof.formsavecompleted();
            return;
        }
        var formdata = { "recordid": d.id, "oldrecordid": mrof.tempId };
        common.postApi("FileUpload/UpdateObjectId", JSON.stringify(formdata), mrof.formsavecompleted);
    },
    formsavecompleted: function () {
        if (mrof.aftercomplete != null) {
            var f = mrof.aftercomplete;
            if (mrof.refreshcache != null) {//refresh API data after saving the form
                caching.refreshcache(mrof.refreshcache);
                mrof.refreshcache = null;
            }
            mrof.resetmrof();
            f();
        }
    },
    uploadfiles: function () {
        var input = document.getElementById('file-upload-content');
        var file = input.files[0];
        var formData = new FormData();
        formData.append("filetoupload", file);
        $.ajax(
            {
                url: `${installs.apiUrl}/FileUpload/UploadFiles`,
                dataType: 'json',
                data: formData,
                processData: false,
                contentType: false,
                type: "POST",
                success: function (data) {
                    mrof.updatefilerecord(data);
                }
            }
        );
    },
    updatefilerecord: function (d) {
        var formdata = { "fileid": d.id, "recordid": mrof.tempId, "filetag": mrof.filetag };
        $(mrof.fileControlId).css('background-image', 'url("' + installs.webUrl + "/cache/" + installs.domain + "/" + d.id + d.fileType + '")');
        common.postApi("FileUpload/UpdateFileRecord", JSON.stringify(formdata), mrof.filerecordsuccess);
    },
    filerecordsuccess: function (d) {
        mrof.formhasfiles = true;
        $('#large-modal').modal('hide');
    },
    getfieldvalue: function (obj, isStringify) {
        if ($(obj).attr('data-fieldname') == undefined)
            return null;
        console.log($(obj).attr('data-fieldname'));
        console.log($(obj).val().replace(/"/g, '\\"'));
        return '"' + $(obj).attr('data-fieldname') + '":"' + $(obj).val().replace(/"/g, '\\"').replace(/\n/g, '') + '"';
    },
    fillinform: function () {
        if (mrof.fetchdataforeditapi != null) {
            var formdata = { "objId": mrof.recordId };
            common.postApi(mrof.fetchdataforeditapi, JSON.stringify(JSON.parse(fieldVal)), mrof.aftergetdataforedit);
            return;
        }
        if (mrof.data == null)
            return;
        var inputs = $('#' + mrof.containerId).find('input');
        for (let i = 0; i <= inputs.length - 1; i++) {
            var fieldname = $(inputs[i]).attr('data-fieldname');
            if ($(inputs[i]).attr('data-isAdditional') == 'true')
                valObj = mrof.getValue($(inputs[i]), "", fieldname);
            else
                var valObj = mrof.data[fieldname];
            $(inputs[i]).val(mrof.getValue($(inputs[i]), valObj, fieldname));
        }

        var inputs = $('#' + mrof.containerId).find('textarea');
        for (let i = 0; i <= inputs.length - 1; i++) {
            var fieldname = $(inputs[i]).attr('data-fieldname');
            var valObj = mrof.data[fieldname];
            $(inputs[i]).val(valObj);
        }
        var select2 = $('#' + mrof.containerId).find('.select2');
        for (let i = 0; i <= select2.length - 1; i++) {
            var fieldname = $(select2[i]).attr('data-fieldname');
            if (fieldname != undefined) {
                if ($(select2[i]).attr('data-isAdditional') == 'true')
                    valObj = mrof.getValue($(select2[i]), "", fieldname);
                else
                    var valObj = mrof.data[fieldname];
                if (valObj != undefined) {
                    $(select2[i]).val(valObj.toString());
                    $(select2[i]).trigger('change');
                }
            }
        }
    },
    showuploadcontrols: function (e, showHide) {
        if (showHide)
            $(e).find('.file-upload-controls').show();
        else
            $(e).find('.file-upload-controls').hide();
    },
    getValue: function (obj, val, fieldname) {
        console.log(fieldname);
        console.log($(obj).data("isadditional"));
        if ($(obj).data("isadditional"))//data-isadditional
        {
            _fieldName = '[fieldname]';
            if ($(obj).data("datapathfield") != undefined && $(obj).data("datapathfield") != '')
                _fieldName = `[${$(obj).data("datapathfield")}]`;
            if ($(obj).data("datapath") != undefined && $(obj).data("datapath") != '')
                val = eval('mrof.data.AdditionalInformation[0].' + $(obj).data("datapath") + _fieldName);
            else if (mrof.data.AdditionalInformation.length > 0)
                val = mrof.data.AdditionalInformation[0][fieldname];
            else
                val = '';
        }
        if ($(obj).hasClass('air-datepicker'))
            return parseDate(val);
        else if ($(obj).data("format") == "time")
            return parseTime(val);
        else
            return val;
    },

    uncheckOther: function (obj, name, field) {
        if (!$(obj).is(":checked"))//if the check box is unchecked do nothing...
            return;
        $(`.check-box-group-${field}`).find('input[type=checkbox]').each(function () {
            if ($(this).attr("name") != name) {
                $(this).prop('checked', false);
            }
        });
    },
    isJson: function (str) {
        try {
            JSON.parse(str);
        } catch (e) {
            return false;
        }
        return true;
    },
    __loadTemplates: function () {
        $('body').append('<div id="__mfroTemplateContainer" style="display:none;"></div>');
        $('#__mfroTemplateContainer').load('../xobni-mrof/mrof-templates.html');
    }
}
mrof.__loadTemplates();

function generateUUID() { // Public Domain/MIT
    var d = new Date().getTime();//Timestamp
    var d2 = ((typeof performance !== 'undefined') && performance.now && (performance.now() * 1000)) || 0;//Time in microseconds since page-load or 0 if unsupported
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        var r = Math.random() * 16;//random number between 0 and 16
        if (d > 0) {//Use timestamp until depleted
            r = (d + r) % 16 | 0;
            d = Math.floor(d / 16);
        } else {//Use microseconds since page-load if supported
            r = (d2 + r) % 16 | 0;
            d2 = Math.floor(d2 / 16);
        }
        return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
    });
}


var viewmmrof = {
    fields: null,
    containerId: null,
    data: [],//this is for filling up with existing data
    error: null,
    recordId: null,
    callbackafterrender: null,
    fileRecords: [],
    //not required
    tempId: null,
    apiOptionFields: [],
    fileId: null,
    fileType: null,
    aftercomplete: null,
    loadDataApi: null,
    filetag: null,
    formhasfiles: false,
    refreshcache: null,
    hiddenVal: null,
    saveapi: null,
    isFormRendered: false,
    fetchdataforeditapi: null,
    appendFormData: null,
    fileControlId: null,

    resetmrof: function () {
        viewmmrof.fetchdataforeditapi = null;
        viewmmrof.loadDataApi = null;
        viewmmrof.tempId = null;
        viewmmrof.apiDataCount = 0;
        viewmmrof.recordId = null;
        viewmmrof.apiOptionFields = [];
        viewmmrof.fields = null;
        viewmmrof.fileId = null;
        viewmmrof.fileType = null;
        viewmmrof.containerId = null;
        viewmmrof.aftercomplete = null;
        viewmmrof.data = [];//this is for filling up with existing data
        viewmmrof.saveapi = null;
        viewmmrof.filetag = null;
        viewmmrof.formhasfiles = false;
        viewmmrof.fileRecords = [];
        viewmmrof.isFormRendered = false;
        viewmmrof.hiddenVal = null;
        viewmmrof.callbackafterrender = null;
        viewmmrof.appendFormData = null;
    },
    init: function (fields, containerId, data, fn) {
        viewmmrof.fields = fields;
        viewmmrof.containerId = containerId;
        viewmmrof.data = data;
        if (viewmmrof.recordId == "-1") {
            viewmmrof.error = "No Record ID is set";
        }
        else {
            viewmmrof.downloadFileRecords();
        }

        if (fn != null) {
            viewmmrof.callbackafterrender = fn;
        }
    },
    downloadFileRecords: function () {
        common.getApi("FileUpload/GetFilesByRecordId/" + viewmmrof.recordId, function (d) {
            viewmmrof.fileRecords = d;
            viewmmrof.downloadAPIData(viewmmrof.fields);
        })
    },
    renderView: function () {
        var formhtml = "";
        var template = $("#view-form-text").html();
        for (var i = 0; i <= viewmmrof.fields.length - 1; i++) {
            if (viewmmrof.fields[i].type == "newrow") {
                formhtml += '</div>';
                formhtml += '<div class=\'row\'>';
                continue;
            }
            if (viewmmrof.fields[i].type == "photo") {
                var field = viewmmrof.fields[i]["field"];
                var f = viewmmrof.fileRecords.filter(el => el.fileTag = field);
                if (f.length > 0) {
                    $('#record-' + field).css('background-image', 'url(' + installs.webUrl + "/cache/" + installs.domain + "/" + f[0].id + f[0].fileType + ')');
                    //$('#record-' + field).css('background-image', 'url(`/cache/${installs.domain}/${f[0].id}${f[0].fileType}`)');
                }
                continue;
            }
            console.log(viewmmrof.fields[i]["field"]);
            //if (viewmmrof.fields[i]["field"] == "currentClass")
            //    debugger;
            if (viewmmrof.fields[i] != undefined) {
                val = viewmmrof.data[viewmmrof.fields[i]["field"]];
                if (viewmmrof.fields[i]["type"] == "date") {
                    val = parseDate(val);
                }
                if (viewmmrof.fields[i]["enum"] != undefined) {
                    val = enums.getEnum(viewmmrof.fields[i]["enum"], val).name;
                }
                if (viewmmrof.fields[i]["isAdditional"] && viewmmrof.fields[i]["datapath"] == null) {
                    val = viewmmrof.data.AdditionalInformation[0][viewmmrof.fields[i]["field"]];
                }
                if (viewmmrof.fields[i]["isAdditional"] && viewmmrof.fields[i]["datapath"] != null) {
                    val = eval('viewmmrof.data.AdditionalInformation[0].' + viewmmrof.fields[i]["datapath"] + "." + viewmmrof.fields[i]["field"]);
                }
                if (viewmmrof.fields[i]["customfn"] != null) {
                    val = viewmmrof.fields[i]["customfn"](val.toString());
                }

                if (val == "" || val == undefined)
                    val = "NA";
                viewmmrof.fields[i]["value"] = val;
                formhtml += Mustache.render(template, viewmmrof.fields[i]);
            }
        }
        $("#" + viewmmrof.containerId).html(formhtml);
        if (viewmmrof.callbackafterrender != null)
            viewmmrof.callbackafterrender();
    },
    downloadAPIData: function (fields) {//get all DDL with options = null
        viewmmrof.renderView();
    }
}
