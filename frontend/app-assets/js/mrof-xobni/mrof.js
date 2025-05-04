class Mrof {

    static activeMrof;
    constructor() {
        this.apiDataCount = 0;
        this.recordId = null;//this is null if new record is being created or set the id here...
        this.tempId = null;//thjs if the new record is created, so hold the data in the tempId, used to update the fileupload, picture upload etc.
        this.apiOptionFields = [];//this is not used any more
        this.fields = null;//these are the fields of the form
        this.fileId = null;//not used any more
        this.fileType = null;//not used any more
        this.containerId = null;//this is the container Id where the entire form is rendered
        this.aftercomplete = null;//this is the pointer to a function that needs to be called once the form is saved such as redirect to a listing page or refresh the page etc..
        this.loadDataApi = null;//name of the API from where the data needs to be loaded, in case of editing a record
        this.filetag = null;//this is used for the file tag such as profilepicture or product picture etc.
        this.formhasfiles = false;//this sets it to true if there is any file uploaded in the form
        this.refreshcache = null;//this is used to refresh any data which is cached, if this is true the sytem will load the data from the server once a record is updated called after the save form
        this.hiddenVal = null;//every form can have some hidden values that doens't need to be shown to the user but needs to be submitted while saving the data...
        this.data = [];//this is for filling up with existing data, if you are not loading the data from the API
        this.saveapi = null;//this is a reference to the API where the data would be saved.
        this.fileRecords = [];//this is the array of files that a form can have
        this.isFormRendered = false;//this is set to true only after the form is rendered
        this.fetchdataforeditapi = null;//this is a pointer to an API, if the form is being edited what is the API to get the data
        this.callbackafterrender = null;//as the variabel name suggest this is call back after the form is rendered
        this.appendFormData = null;//you may have certain information that is not a part of the form yet you want it to be submitted to the form...
        this.fileControlId = null;//this is the control Id where the form is rendered...
        this.individualValidation = false;
        this.modalId = null;
        this.beforeSubmit = false;
        this.isFormError = false;
    }

    resetmrof() {//this function resets all the form objects, this is must to call before a form is rendered or initiated. This is the first line that must be called.
        this.apiDataCount = 0;
        this.recordId = null;
        this.tempId = null;
        this.apiOptionFields = [];
        this.fields = null;
        this.fileId = null;
        this.fileType = null;
        this.containerId = null;
        this.aftercomplete = null;
        this.loadDataApi = null;
        this.filetag = null;
        this.formhasfiles = false;
        this.refreshcache = null;
        this.hiddenVal = null;
        this.data = [];//this is for filling up with existing data
        this.saveapi = null;
        this.fileRecords = [];
        this.isFormRendered = false;
        this.fetchdataforeditapi = null;
        this.callbackafterrender = null;
        this.appendFormData = null;
        this.fileControlId = null;
        this.individualValidation = false;
        this.modalId = null;
        this.beforeSubmit = false;
    }

    init(fields, containerId, data, saveapi, fn) {
        //fields are the set of the fields that needs to be shown on the form
        //containerId is the Div or any html element here the form will be rendered
        //data is the json array of object to render the form and fillin the info
        // saveapi is the API that you can send to save the data
        //fn is the pointer to another JS function which should be called after rendering is complete.
        this.fields = fields;
        if (containerId == null)// if no container ID is sent, it will default to one specific container
            containerId = "form-container";
        this.containerId = containerId;
        this.data = data;
        customLoader(this.containerId);
        this.saveapi = saveapi;
        if (this.recordId == "-1") {//if it's a new record it must have a unique id
            this.tempId = generateUUID();
        } else {
            this.tempId = this.recordId;//else set the recordId to the form
            this.downloadFileRecords();//if must have the file records to show the edited version of the form
        }
        if (fn != null) {
            this.callbackafterrender = fn;//call the function after the form is rendered.
        }
        this.downloadAPIData(fields);
    }
    downloadFileRecords() {
        common.getApi("FileUpload/GetFilesByRecordId/" + this.recordId, (d) => {
            this.fileRecords = d;
            if (this.isFormRendered) {
                this.showFilesOnFormControl(this.fileRecords);//this will list all the files found with the records
            }
        });
    }
    showFilesOnFormControl(d) {
        // This should change as per custom logic
        var allFiles = $('.file-upload-div');
        for (let i = 0; i <= allFiles.length - 1; i++) {
            var obj = $(allFiles[i]);
            var f = this.fileRecords.filter(el => el.fileTag == $(obj).data("filetype"));
            if (f.length > 0) {
                $(obj).css('background-image', 'url(' + installs.webUrl + "/cache/" + f[0].id + f[0].fileType + ')');
            }
        }
    }
    aftergetdataforedit(d) {
        this.fetchdataforeditapi = null;
        var keys = Object.keys(d);
        for (let i = 0; i <= keys.length - 1; i++) {
            var attr = keys[i];
            if (attr == "_id")
                continue;
            this.data[attr] = d[attr];
        }
        this.fillinform();
    }
    buildIndividualFields(__fields) {
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
    }
    addMultiRecordRow() {
        var multiRecords = this.fields.find(x => x.type == "multi-records");
        if (multiRecords !== undefined) {
            multiRecords["currentIndex"]++;
            for (var i = 0; i <= multiRecords.data.length - 1; i++) {
                multiRecords.data[i]["field"] = `${multiRecords.data[i]["field"]}_${multiRecords["field"]}_${multiRecords["currentIndex"]}`;
            }
            $(`#multi-record-container-${multiRecords.field}`).append('<hr />' + this.buildIndividualFields(multiRecords.data));
        }
    }
    renderForm() {
        console.log(this.fileRecords);
        console.log(this.fields);
        console.log("--- I HAVE GOT ALL THE DATA ---");
        // First, get the data of any dependent fields
        $("#" + this.containerId).html(this.buildIndividualFields(this.fields));
        var multiRecords = this.fields.find(x => x.type == "multi-records");
        if (multiRecords != undefined) {
            multiRecords["currentIndex"] = 1;
            for (var i = 0; i <= multiRecords.data.length - 1; i++) {
                multiRecords.data[i]["field"] = `${multiRecords.data[i]["field"]}_${multiRecords["field"]}_${multiRecords["currentIndex"]}`;
            }
            $(`#multi-record-container-${multiRecords.field}`).html(this.buildIndividualFields(multiRecords.data));
        }

        $('#' + this.containerId + ' .select2').select2({
            width: '100%'
        });
        setSelectMaxlength('#' + this.containerId);
        resetSelectValidation('#' + this.containerId);
        common.renderDate(this.containerId);
        if (this.recordId != '-1') {
            this.fillinform();
        }

        this.isFormRendered = true;
        if (this.fileRecords.length > 0) {
            this.showFilesOnFormControl(this.fileRecords);
        }

        console.log('Form Rendered');
        if (this.callbackafterrender != null) {
            this.callbackafterrender();
        }
    }
    downloadAPIData(fields) {
        // Get all DDL with options = null
        if (this.apiDataCount == this.fields.length) { // Render form if all the download APIs are completed
            this.renderForm();
            return;
        }
        if (this.fields[this.apiDataCount].type == undefined) {
            this.apiDataCount++;
            this.downloadAPIData();
            return;
        }
        Mrof.activeMrof = this;
        if ((this.fields[this.apiDataCount].type == "ddl" || this.fields[this.apiDataCount].type == "multiselect") && this.fields[this.apiDataCount].options == null) {
            if (this.fields[this.apiDataCount].optionapi?.islocal) {
                var result = eval(this.fields[this.apiDataCount].optionapi.api);
                this.updateApiOptions(result);
                return;
            }
            else {
                common.getApi(this.fields[this.apiDataCount].optionapi.api, this.updateApiOptions);
                return;
            }
        } else {
            this.apiDataCount++;
            this.downloadAPIData();
            return;
        }
        this.renderForm();
    }

    rebind(_field, _options, modalId) {//this function will rebind the data with APIs
        var field = lookup(this.fields, "field", _field);
        if (field == undefined) {
            console.log("No field found")
            return;
        }

        if (field && _options == null) {
            common.getApi(field.optionapi.api, (d) => { this.rebindOptions(d, field, modalId) });
        } else {
            this.rebindOptions(_options, field, modalId);
        }

    }
    rebindOptions(_options, mainField, modalId) {
        if (!mainField?.optionapi) {
            var mainDdl = $(`#${modalId}`).find(`#ddl-${mainField.field}`);
            mainDdl.empty();
            _options.forEach((option) => {
                mainDdl.append(`<option value='${option.val}'>${option.label}</option>`);
            });
        } else {
            var options = [];
            var text = mainField.optionapi.text;
            var val = mainField.optionapi.val;
            var additionalfield = mainField.optionapi.additionalData;

            if (mainField.defaultOption !== undefined) {
                options.push({ "label": mainField.defaultOption, "val": '' });
            }

            for (let i = 0; i < _options.length; i++) {
                var obj = _options[i];
                options.push({ "label": obj[text], "val": getObjectIDString(obj[val]), "additional": obj[additionalfield] });
            }

            mainField.options = options;
            var mainDdl = $(modalId).find(`#${mainField.type}-${mainField.field}`);
            mainDdl.empty();
            options.forEach((option) => {
                mainDdl.append(`<option value='${option.val}' data-additional='${option.additional}' >${option.label}</option>`);
            });
            mainDdl.select2('destroy').select2({ width: '100%' });
        }
    }

    updateApiOptions(d) {
        var obj = Mrof.activeMrof.fields[Mrof.activeMrof.apiDataCount];
        var options = [];
        var textfield = obj?.optionapi.text;
        var valfield = obj?.optionapi.val;
        var additionalfield = obj?.optionapi.additionalData;
        if (obj["defaultOption"] != undefined) {
            options.push({
                "label": obj["defaultOption"], "val": ""
            });
        }
        for (let i = 0; i <= d.length - 1; i++) {
            if (typeof (d[i]) == "string")
                var parsedObj = $.parseJSON(removeObjectId(d[i]));
            else
                var parsedObj = d[i];
            let option = {
                "label": parsedObj[textfield],
                "val": parsedObj[valfield],
                "additional": parsedObj[additionalfield]
            };

            if (obj["SelectedOption"] === parsedObj[valfield])
                option.selected = true;

            options.push(option);
        }
        Mrof.activeMrof.fields[Mrof.activeMrof.apiDataCount]["options"] = options;
        Mrof.activeMrof.apiDataCount++;
        Mrof.activeMrof.downloadAPIData();
    }
    selectItem(obj) {
        if ($(obj).data("isselected")) {
            $(obj).data("isselected", false).removeClass('multi-select-item-selected');
        } else {
            $(obj).data("isselected", true).addClass('multi-select-item-selected');
        }
    }
    validateText(__field) {
        if (!this.individualValidation)//do this only Individual field validation is set
            return;
        var currInput = $('#' + this.containerId).find(`input[data-fieldname="${__field}"]`);
        var isRequired = currInput.attr('data-isrequired');
        var regexPattern = currInput.attr('data-regex'); // custom validation regex
        if (isRequired == "1" && currInput.val().trim() == "") {//is required validation
            $('#' + this.containerId).find('#error-' + $(currInput).attr('data-fieldname')).html($(currInput).attr('data-isreqerror')).show();
            this.isFormError = true;
        } else if (regexPattern && !new RegExp(regexPattern).test(currInput.val().trim())) {//custom regex validation
            $('#' + this.containerId).find('#error-' + $(currInput).attr('data-fieldname')).html($(currInput).attr('data-regexmsg')).show(); // Show error for regex validation failure
            this.isFormError = true;
        } else {
            $('#' + this.containerId).find('#error-' + $(currInput).attr('data-fieldname')).html($(currInput).attr('data-isreqerror')).hide();
        }
    }
    validateTextArea(__field) {
        if (!this.individualValidation)//do this only Individual field validation is set
            return;
        var currInput = $('#' + this.containerId).find(`textarea[data-fieldname="${__field}"]`);
        var isRequired = currInput.attr('data-isrequired');
        var regexPattern = currInput.attr('data-regex'); // custom validation regex
        if (isRequired == "1" && currInput.val().trim() == "") {//is required validation
            $('#' + this.containerId).find('#error-' + $(currInput).attr('data-fieldname')).html($(currInput).attr('data-isreqerror')).show();
            this.isFormError = true;
        } else if (regexPattern && !new RegExp(regexPattern).test(currInput.val().trim())) {//custom regex validation
            $('#' + this.containerId).find('#error-' + $(currInput).attr('data-fieldname')).html($(currInput).attr('data-regexmsg')).show(); // Show error for regex validation failure
            this.isFormError = true;
        } else {
            $('#' + this.containerId).find('#error-' + $(currInput).attr('data-fieldname')).html($(currInput).attr('data-isreqerror')).hide();
        }
    }
    validateDDL(__field) {
        var selectDdl = $('#' + this.containerId).find(`select[data-fieldname="${__field}"]`);//all drop down selectable items
        var isRequired = $(selectDdl).attr('data-isrequired');
        if (isRequired == "1" && $(selectDdl).val() == "") {
            $('#' + this.containerId).find('#error-' + $(selectDdl).attr('data-fieldname')).show();
            this.isFormError = true;
        } else {
            $('#' + this.containerId).find('#error-' + $(selectDdl).attr('data-fieldname')).hide();
        }
    }
    validateSelect2(__field) {
        var selectDdl = $('#' + this.containerId).find(`.select2[data-fieldname="${__field}"]`);//all drop down selectable items
        var isRequired = $(selectDdl).attr('data-isrequired');
        if (isRequired == "1" && ($(selectDdl).val() == "-1" || $(selectDdl).val() == "")) {
            $('#' + this.containerId).find('#error-' + $(selectDdl).attr('data-fieldname')).show();
            this.isFormError = true;
        } else {
            $('#' + this.containerId).find('#error-' + $(selectDdl).attr('data-fieldname')).hide();
        }
    }
    getformdata() {
        $('.alert1').hide();
        this.isFormError = false;
        var formData = "";
        var inputs = $('#' + this.containerId).find('input, textarea');// All input boxes
        for (let i = 0; i <= inputs.length - 1; i++) {
            var currInput = $(inputs[i]);
            var isRequired = currInput.attr('data-isrequired');
            var regexPattern = currInput.attr('data-regex'); // Custom validation regex
            if (isRequired == "1" && currInput.val() == "") { // Is required validation
                $('#' + this.containerId).find('#error-' + currInput.attr('data-fieldname')).html(currInput.attr('data-isreqerror')).show();
                this.isFormError = true;
            } else {
                var fieldVal = this.getfieldvalue(currInput);
                if (regexPattern && !new RegExp(regexPattern).test(currInput.val())) { // Custom regex validation
                    $('#' + this.containerId).find('#error-' + currInput.attr('data-fieldname')).html(currInput.attr('data-regexmsg')).show(); // Show error for regex validation failure
                    this.isFormError = true;
                } else {
                    if (fieldVal != null) {
                        if (formData.length > 0)
                            formData += ",";
                        if (currInput.data('stringify') == '1')
                            fieldVal = JSON.stringify(fieldVal);
                        formData += fieldVal;
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
            formData += ',"' + fieldName + '":"' + multiSelectVal + '"';
            formData += ',"classIds":""';
            formData += ',"usersList":""';
        } else if (selectedClass.length > 0) {
            var multiSelectVal = "";
            var fieldName = selectedClass.attr('data-fieldname');
            for (let i = 0; i <= selectedClass.length - 1; i++) {
                if (multiSelectVal.length > 0)
                    multiSelectVal += ",";
                multiSelectVal += selectedClass[i].value;
            }
            formData += ',"' + fieldName + '":"' + multiSelectVal + '"';
            formData += ',"forPersona":""';
            formData += ',"usersList":""';
        } else if (selectedIndividual.length > 0) {
            var multiSelectVal = "";
            var fieldName = selectedIndividual.attr('data-fieldname');
            for (let i = 0; i <= selectedIndividual.length - 1; i++) {
                if (multiSelectVal.length > 0)
                    multiSelectVal += ",";
                multiSelectVal += selectedIndividual[i].value;
            }
            formData += ',"' + fieldName + '":"' + multiSelectVal + '"';
            formData += ',"classIds":""';
            formData += ',"forPersona":""';
        }

        var selectDdl = $('#' + this.containerId).find('select'); // All drop down selectable items

        for (let i = 0; i <= selectDdl.length - 1; i++) {
            var isRequired = $(selectDdl[i]).attr('data-isrequired');
            if (isRequired == "1" && $(selectDdl[i]).val() == "") {
                $('#' + this.containerId).find('#error-' + $(selectDdl[i]).attr('data-fieldname')).show();
                this.isFormError = true;
            } else {
                var fieldVal = this.getfieldvalue($(selectDdl[i]));
                if (fieldVal != null) {
                    if (formData.length > 0)
                        formData += ",";
                    formData += fieldVal;
                }
            }
        }

        var select2 = $('#' + this.containerId).find('.select2'); // All drop downs

        for (let i = 0; i <= select2.length - 1; i++) {
            var isRequired = $(select2[i]).attr('data-isrequired');
            if (isRequired == "1" && $(select2[i]).val() == "") {
                $('#' + this.containerId).find('#error-' + $(select2[i]).attr('data-fieldname')).show();
                this.isFormError = true;
            } else {
                var fieldVal = this.getfieldvalue($(select2[i]));
                if (fieldVal != null) {
                    if (formData.length > 0)
                        formData += ","
                    formData += fieldVal;
                }
            }
        }

        var fileInputs = $('#' + this.containerId).find('.file-upload'); // All input boxes

        var multiSet = $('#' + this.containerId).find('.multiset-form-fields');
        for (let i = 0; i < multiSet.length; i++) {
            var fieldName = $(multiSet[i]).data('fieldname');
            var multiSelectVal = "";
            var anyChecked = false; // Flag to track if any checkbox is checked
            $(multiSet[i]).find('input[type=checkbox]').each(function () {
                if ($(this).prop('checked')) {
                    multiSelectVal += `${$(this).data('val')},`;
                    anyChecked = true; // At least one checkbox is checked
                }
            });
            if (!anyChecked) {
                this.isFormError = true; // Set form error flag if no checkbox is checked
                $('#' + this.containerId).find('#error-' + fieldName).show();
            } else {
                $('#' + this.containerId).find('#error-' + fieldName).hide();
            }
            formData += ',"' + fieldName + '":"' + multiSelectVal + '"';
        }



        if (this.isFormError)
            return;
        console.log('Get the form data');
        formData += ',"id":"' + this.recordId + '"';
        if (this.hiddenVal != null)
            formData += ',' + this.hiddenVal;
        if (this.appendFormData != null)
            formData = this.appendFormData(formData);
        formData = "{" + formData + "}";
        return formData;
    }
    formvalidation() {
        let formData = this.getformdata();
        var isValid = true;

        if (typeof this.beforeFormSubmit === 'function') {
            isValid = this.beforeFormSubmit();
        }

        if (!isValid) {
            return;
        }

        if (formData) {
            common.postApi(this.saveapi, formData, this.formsuccess);
        }
    }
    formsuccess(d) {
        if (!this.formhasfiles) {
            this.formsavecompleted();
            return;
        }
        var formData = { "recordid": d.id, "oldrecordid": this.tempId };
        common.postApi("FileUpload/UpdateObjectId", JSON.stringify(formData), this.formsavecompleted);
    }

    formsavecompleted() {
        if (this.aftercomplete != null) {
            var callback = this.aftercomplete;
            if (this.refreshcache != null) {
                this.refreshcache = null;
            }
            this.resetmrof();
            callback();
        }
    }
    uploadfiles(file) {
        //var newCurrMrof = lastArrElm(mrofArr);
        //var mrofFormControlId = ;
        //currmrof = currmrof.Mrof;
        //Mrof.activeMrof = newCurrMrof;
        //var input = $(`#${newCurrMrof.ModalId}`).find('#file-upload-content');
        //var file = input.prop('files')[0];
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
                    this.updatefilerecord(data);
                }.bind(this) // Bind the success callback to the current instance of mrof
            }
        );
    }

    updatefilerecord(d) {
        var formData = { "fileid": getObjectIDString(d.Id), "recordid": this.tempId, "filetag": this.filetag };
        var containerId = `#${this.containerId}`;
        var $UserPicEle = $(`${containerId}` + ' #userSelectedProfile');
        $(`${containerId}` + ' #userSelectedAbbre').hide();
        $UserPicEle.attr('src', `${d.UrlPath}`);
        $UserPicEle.show();
        $(`${containerId}`).find('#file-upload-content').attr('data-val', `${d.Name}`);
        $(`${containerId}`).find("#removeUserPic").removeClass("d-none");
        common.postApi("FileUpload/UpdateFileRecord", JSON.stringify(formData), this.filerecordsuccess.bind(this)); // Bind the success callback to the current instance of mrof
    }

    filerecordsuccess(d) {
        this.formhasfiles = true;
        $('#large-modal').modal('hide');
    }
    getfieldvalue(obj, isStringify) {
        if ($(obj).attr('data-fieldname') === undefined)
            return null;
        console.log($(obj).attr('data-fieldname'));
        var value = $(obj).val();
        // Check if the value is an array
        if (Array.isArray(value)) {
            // Handle array values
            return `"${$(obj).attr('data-fieldname')}":"${value.join(',')}"`;
        }

        console.log(value?.replace(/"/g, '\\"'));

        if ($(obj).attr('type') === "file") {

            return `"${$(obj).attr('data-fieldname')}":"${$(obj).attr('data-val')?.replace(/"/g, '\\"')}"`;
        }
        if ($(obj).attr('type') === "checkbox" && $(obj).attr('singleCheckbox') === "yes") {
            value = $(obj).is(":checked");
            
            return `"${$(obj).attr('data-fieldname')}":${value}`;
        }

        return `"${$(obj).attr('data-fieldname')}":"${value?.replace(/"/g, '\\"')}"`;
    }
    fillinform() {
        if (this.fetchdataforeditapi != null) {
            var formData = { "objId": this.recordId };
            common.postApi(this.fetchdataforeditapi, JSON.stringify(formData), this.aftergetdataforedit);
            return;
        }
        if (this.data == null)
            return;
        var inputs = $('#' + this.containerId).find('input');
        for (let i = 0; i <= inputs.length - 1; i++) {
            var fieldname = $(inputs[i]).attr('data-fieldname');
            if ($(inputs[i]).attr('data-isAdditional') == 'true')
                valObj = this.getValue($(inputs[i]), "", fieldname);
            else
                var valObj = this.data[fieldname];
                var objId = getObjectIDString(valObj);
            if ($(inputs[i]).attr('type') == 'file') {
                var $UserPicEle = $('#' + this.containerId).find("#userSelectedProfile");
                var $UserAbbreEle = $('#' + this.containerId).find("#userSelectedAbbre");
                $UserAbbreEle.html(this.data.Abbreviation);
                $UserAbbreEle.attr("title", this.data.FirstName + " " + this.data.LastName);
                $UserPicEle.attr('src', `${objId}`);
                if (objId === null || objId === "") {
                    $UserPicEle.hide();
                    $UserAbbreEle.show();
                } else {
                    $('#' + this.containerId).find('#file-upload-content').attr('data-val', this.data[fieldname + "Id"]);
                    $UserAbbreEle.hide();
                    $UserPicEle.show();
                }
            } else if ($(inputs[i]).attr('type') == 'checkbox') {
                var isChecked = objId?.includes($(inputs[i]).data('val'));
                $(inputs[i]).prop('checked', isChecked);
            } else {
                $('#' + this.containerId).find(inputs[i]).val(this.getValue($(inputs[i]), objId, fieldname));
            }
        }


        var textareas = $('#' + this.containerId).find('textarea');
        for (let i = 0; i <= textareas.length - 1; i++) {
            var fieldname = $(textareas[i]).attr('data-fieldname');
            var valObj = this.data[fieldname];
            var objId = getObjectIDString(valObj);
            $(textareas[i]).val(objId);
        }
        var select2 = $('#' + this.containerId).find('.select2');

        for (let i = 0, len = select2.length; i < len; i++) {
            var fieldname = $(select2[i]).data('fieldname');
            if (fieldname !== undefined) {
                var isAdditional = $(select2[i]).data('isadditional');
                var valObj = isAdditional === 'true' ? this.getValue($(select2[i]), '', fieldname) : this.data[fieldname];

                if (valObj !== undefined) {
                    if (Array.isArray(valObj)) {
                        $(select2[i]).val(valObj);
                    } else {
                        try {
                            var val = JSON.parse(valObj); // Try parsing as JSON array
                            $(select2[i]).val(val); // Set value accordingly
                        } catch (e) {
                            $(select2[i]).val(valObj);
                        }
                    }
                    $(select2[i]).select2('destroy').select2();
                }
            }
        }

        //var select2 = $('#' + this.containerId).find('.select2');
        //for (let i = 0; i < select2.length; i++) {
        //    var fieldname = $(select2[i]).attr('data-fieldname');
        //    if (fieldname !== undefined) {
        //        var fieldValue = this.data[fieldname];

        //        // Parse JSON string to array if needed
        //        if (typeof fieldValue === 'string') {
        //            try {
        //                fieldValue = JSON.parse(fieldValue);
        //            } catch (error) {
        //                console.error("Error parsing JSON for field:", fieldname, error);
        //            }
        //        }

        //        // Convert single value to array if not already an array
        //        fieldValue = Array.isArray(fieldValue) ? fieldValue : [fieldValue];

        //        // Set values directly
        //        $(select2[i]).val(fieldValue).trigger('change');
        //    }
        //}

    }
    showuploadcontrols(e, showHide) {
        if (showHide)
            $(e).find('.file-upload-controls').show();
        else
            $(e).find('.file-upload-controls').hide();
    }

    getValue(obj, val, fieldname) {
        console.log(fieldname);
        console.log($(obj).data("isadditional"));
        if ($(obj).data("isadditional")) {
            let _fieldName = '[fieldname]';
            if ($(obj).data("datapathfield") != undefined && $(obj).data("datapathfield") != '')
                _fieldName = `[${$(obj).data("datapathfield")}]`;
            if ($(obj).data("datapath") != undefined && $(obj).data("datapath") != '')
                val = eval('this.data.AdditionalInformation[0].' + $(obj).data("datapath") + _fieldName);
            else if (this.data.AdditionalInformation.length > 0)
                val = this.data.AdditionalInformation[0][fieldname];
            else
                val = '';
        }
        if ($(obj).hasClass('air-datepicker'))
            return parseRegularDate(val);
        else if ($(obj).data("format") == "time")
            return parseUTCDate(val);
        else
            return val;
    }

    uncheckOther(obj, name, field) {
        if (!$(obj).is(":checked"))
            return;
        $(`.check-box-group-${field}`).find('input[type=checkbox]').each(function () {
            if ($(this).attr("name") != name) {
                $(this).prop('checked', false);
            }
        });
        $(`.check-box-group-${field}`).find('span').hide();
    }

    isJson(str) {
        try {
            JSON.parse(str);
        } catch (e) {
            return false;
        }
        return true;
    }

}

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
                    $('#record-' + field).css('background-image', 'url(' + installs.webUrl + "/cache/" + f[0].id + f[0].fileType + ')');
                }
                continue;
            }
            console.log(viewmmrof.fields[i]["field"]);
            if (viewmmrof.fields[i] != undefined) {
                val = viewmmrof.data[viewmmrof.fields[i]["field"]];
                if (viewmmrof.fields[i]["type"] == "date") {
                    val = parseDate(val);
                }
                if (viewmmrof.fields[i]["enum"] != undefined) {
                    val = enums.getEnum(viewmmrof.fields[i]["enum"], val).name;
                }
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
    },
}