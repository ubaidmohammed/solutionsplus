function LoadDueDatefn(currElm) {
     
    var currprojId = $('#hdnSelectedProjId').val();
    var userId = $("#hidUserId").val();
    var persona = _userRole;
    var eml = $(currElm);
    var optionDivId = eml.find('a').attr('href');
    var ul = $(optionDivId).find('ul');
    var checkedCheckboxes = ul.find('input.filter-checkbox:checked');

    if (checkedCheckboxes.length === 0) {
        common.getApi(`Task/GetDueDatesProjWise/${currprojId}/${userId}/${persona}`, function (res) {

            ul.html('');
            if (res && res.length > 0) {
                var dueDateJson = {
                    DbName: "dueDate",
                    FilterName: "Due Date",
                    options: res.map(date => {
                        let currDate = parseRegularDate(date);
                        return {
                            value: currDate,
                            Name: currDate
                        };
                    })
                };

                var optionTemp = $('#filter-option-template').html();
                var response = Mustache.render(optionTemp, dueDateJson);
                ul.html(response);
            } else {
                ul.html('<div>No due date found.</div>');
            }
        });
    }
}
function getDropdownOptions(optionList = []) {
    return new Promise((resolve, reject) => {
        if (optionList.length === 0)
            return resolve(false);

        var formdata = { "dropdowns": optionList.join(',') };
        common.postApi(`Common/GetDropdownOptions`, JSON.stringify(formdata), function (res) {
            if (res) {
                const modifiedRes = {};
                for (const key in res) {
                    if (res.hasOwnProperty(key)) {
                        // Map the array of options to change keys from Label/Value to label/val to support mrof
                        modifiedRes[key] = res[key].map(item => ({
                            label: item.Label,
                            val: item.Value
                        }));
                    }
                }
                resolve(modifiedRes);
            } else {
                reject(res);
            }
        });
    });
}


function exportTask() {
    ModalBtnsFn('', 'mywork/task/exportTask.html', 0, "-1", [], 'mywork');
}
$("#preloader").fadeOut("slow", function () {
    $(this).remove();
});
function lookup(array, prop, value) {
    for (var i = 0, len = array.length; i < len; i++)
        if (array[i] && array[i][prop] === value) return array[i];
}
(function ($) {
    if (typeof $.fn.dataTable !== 'undefined') {
        $.fn.dataTable.Debounce = function (table, options) {
            // Ensure delay function exists
            if (typeof delay === 'function') {
                var tableId = table.settings()[0].sTableId;
                $('.dataTables_filter input[aria-controls="' + tableId + '"]') // Select the correct input field
                    .unbind() // Unbind previous default bindings
                    .bind('input', delay(function (e) { // Bind our desired behavior
                        table.search($(this).val()).draw();
                        return;
                    }, 500)); // Set delay in milliseconds
            } else {
                console.warn('The delay function is not defined.');
            }
        };
    } else {
        console.warn('DataTables is not loaded.');
    }
})(jQuery);


//TODO : OLD CODE WHICH REQUIRE SSL CERTIFICATE 
//function copyLeaseName(currElm) {
//    var textToCopy = $(currElm).closest('td').attr('title').trim();
//    navigator?.clipboard.writeText(textToCopy).then(function () {
//        common.FireToast('top-right', 'white', { popup: 'colored-toast' }, 5000, true, 'success', 'Lease Name copied to clipboard');
//    }, function (err) {
//        common.FireToast('top-right', 'white', { popup: 'colored-toast' }, 5000, true, 'error', 'Error!');
//    });
//}





function delay(callback, ms) {
    var timer = 0;
    return function () {
        var context = this, args = arguments;
        clearTimeout(timer);
        timer = setTimeout(function () {
            callback.apply(context, args);
        }, ms || 0);
    };
}
function customLoader(modalId) {
    $(`#${modalId}`).html(`
        <div class="loading-section">
            <div class="spinner-border text-primary" role="status">
                <span class="visually-hidden">Loading...</span>
            </div>
        </div>`);
}
function getHourOptions(startTime, endTime, increment) {
    const options = [];
    const startDate = new Date("1970-01-01 " + startTime);
    let endDate = new Date("1970-01-01 " + endTime);

    if (endDate <= startDate) {
        endDate.setDate(endDate.getDate() + 1);
    }
    let currentTime = startDate;
    while (currentTime <= endDate) {
        const hour = currentTime.getHours() % 12 || 12;
        const minute = currentTime.getMinutes().toString().padStart(2, '0');
        const ampm = currentTime.getHours() < 12 ? 'AM' : 'PM';
        const time = `${hour}:${minute} ${ampm}`;

        options.push({ label: time, val: time });
        currentTime.setMinutes(currentTime.getMinutes() + increment);
    }
    return options;
}


function createObjectId(creationTime, increment, machine, pid) {
    function padHex(number, length) {
        return number.toString(16).padStart(length, '0');
    }

    // 1. Convert the creationTime to a Unix timestamp
    const creationTimestamp = Math.floor(new Date(creationTime).getTime() / 1000);
    const timestampHex = padHex(creationTimestamp, 8);

    // 2. Convert the machine identifier to a 3-byte hex string
    const machineHex = padHex(machine, 6).slice(-6);

    // 3. Convert the process identifier to a 2-byte hex string
    const pidHex = padHex(pid & 0xFFFF, 4).slice(-4); // ensure it fits within 2 bytes

    // 4. Convert the increment counter to a 3-byte hex string
    const incrementHex = padHex(increment, 6).slice(-6);

    // Combine all parts to form the ObjectId
    const objectIdHex = timestampHex + machineHex + pidHex + incrementHex;

    // Return the ObjectId as a hex string
    return objectIdHex;
}
function getObjectIDString(valObj) {
    if (typeof valObj === 'object' && valObj !== null && 'CreationTime' in valObj) {
        const { CreationTime, Increment, Machine, Pid, Timestamp } = valObj;
        return valObj = createObjectId(CreationTime, Increment, Machine, Pid, Timestamp);
    }
    return valObj;

}
function renderPageFn(curr) {
    var currId = $(curr).attr('id');
    if (currId != null) {
    sessionStorage.setItem("childTab", currId);
    $(".nav-link").removeClass("active");
    $("#" + currId + " .nav-link").addClass("active");
        core.loadPage('todo', `todo/${currId}/mainSection.html`, 'new user form', () => { }, 'mainSection');
    }
}
function getCurrentDate() {
    return new Date().toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' })
}

function DeleteDataFromGrid(d, grid, msg) {
    if (d !== null && d !== false) {
        if (typeof grid === 'function') {
            grid();
        } else {
            grid?.loadList();
        }
        $("#count-badge").html('0 Selected');
        common.FireToast('top-right', 'white', { popup: 'colored-toast' }, 5000, true, 'success', msg);
    }
}

function GetNewModal() {
    var modalTemp = $('#modalTemp').html();
    var newId = "modal_" + generateUniqueId();
    modalTemp = modalTemp.replaceAll('{{id}}', newId);
    $('body div.page').append(modalTemp);
    return newId;
}



function lastArrElm(array) {
    return array[array.length - 1];
}

function emptyArray(arr) {
    arr.length = 0;
    return arr;
}
function generateUniqueId() {
    // Combine timestamp with random integer for uniqueness
    const timestamp = Date.now().toString(36); // Base-36 for shorter string
    const random = Math.floor(Math.random() * 10000).toString(36).padStart(4, '0');
    return timestamp + random;
}
function closeModal() {
    emptyArray(mrofArr);
    //$("#modal #closeModal").trigger('click');
    $('#modal .modal-dialog').html('');
    $('#modal').modal('hide');
    //$(`.modal-backdrop`).remove();
}
function openModal(id) {
    $(id).modal('show');
    //if (id == '#modal') {
    //    mrofArr = [];
    //}
}

function bindSelect2(modalId) {
    
    $(modalId).find('select.select2').not('#drpsofteareplatform').select2({
        width: '100%'
    });
}

function closeCustomModal() {
    $('#custom-modal .modal-dialog').empty();
    $('#custom-modal').modal('hide');
    if (within_first_modal) {
        $('#modal').modal('show');
        within_first_modal = false;
    }
}

function removeArrayElement(arr, val) {
    const index = arr.indexOf(val);
    if (index > -1) { // only splice array when item is found
        arr.splice(index, 1); // 2nd parameter means remove one item only
    }
    return arr;
}

function convertBsonArrayToObject(d) {
    var data = [];
    for (var i = 0; i < d.length; i++) {
        var obj;
        if (typeof (d[i]) == 'string')
            obj =JSON.parse(removeObjectId(d[i]));
        else
            obj = d[i];
        data.push(obj);
    }
    return data;
}
function getTodayDate() {
    var today = new Date();
    var dd = String(today.getDate()).padStart(2, '0');
    var mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
    var yyyy = today.getFullYear();
    
        return mm + '/' + dd + '/' + yyyy;
   
}
function validateNumber(s) {
    var numberRegex = /^\s*[+-]?(\d+|\d*\.\d+|\d+\.\d*)([Ee][+-]?\d+)?\s*$/
   
    return numberRegex.test(s);

}
function getStringDate(date, type = 1) {
   
    var dd = String(date.getDate()).padStart(2, '0');
    var mm = String(date.getMonth() + 1).padStart(2, '0'); //January is 0!
    var yyyy = date.getFullYear();

    if (type == 1) {

        return mm + '/' + dd + '/' + yyyy;
    }
    if (type == 2) {
        return yyyy + '-' + mm + '-' + dd;
    }
}
function removeObjectId(d) {
    if (typeof (d) == "object")
        return d;
    d = d.replace(/ObjectId\("/g, '"')//
    d = d.replace(/ISODate\("/g, '"')
    d = d.replace(/new Date\(/g, '')
    d = d.replace(/"\)/g, '"');
    d = d.replace(/NumberLong\(/g, '');//this is because if we get the file details in the json
    d = d.replace(/\)/g, '');
    //NumberLong(39284),
    return d;
}

function getDaysFromBegining(d) {
    var date1 = new Date("01/01/2023");
    var Difference_In_Time = d.getTime() - date1.getTime();
    return Difference_In_Time / (1000 * 3600 * 24);
}

function parseDate(obj) {
    if (obj == null)
        return "--";
    if (obj.date == null)
        return obj;
    return obj.date + "/" + obj.month + "/" + obj.year;
}

function parseCustomDate(obj) {
    if (obj == null)
        return "--";
    return `${obj.getDate()}/${obj.getMonth()+1}/${obj.getFullYear()}`;
}

function parseUTCCustomDate(obj) {
    if (obj == null)
        return "--";
    return `${obj.getUTCDate()}/${obj.getUTCMonth() + 1}/${obj.getUTCFullYear()}`;
}

function toMMDDYYYY(d) {
    var s = d.split('/');
    return new Date(`${s[1]}/${s[0]}/${s[2]}`);
}

function parseGender(gender) {
    if (gender == null)
        return "--";
    switch (gender) {
        case "0":
            return "Not Defined";
        case "1":
            return "Male";
        case "2":
            return "Female";
        case "3":
            return "Others";
    }
    return "Not Defined";
}

function parseRegularDate(dateString) {
    if (!dateString || dateString.trim() === "") {
        return "";
    }

    var delimiter = dateString.includes('-') ? '-' : '/';
    var dateParts = dateString.split(delimiter);

    if (dateParts.length === 2 || dateParts.length === 1) {
        return dateString;
    }

    var parsedDate = new Date(dateString);

    if (isNaN(parsedDate.getTime())) {
        return "";
    }

    var month = parsedDate.getMonth() + 1;
    var day = parsedDate.getDate();
    var year = parsedDate.getFullYear();

    month = month.toString().padStart(2, '0');
    day = day.toString().padStart(2, '0');
    return `${month}/${day}/${year}`;
}
function getURLParams(name) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(name);
}

function parseRegularDate1(obj) {
    if (obj == null)
        return "--";
    var d = new Date(obj);
    return d.getDate() + "-" + (d.getMonth() + 1) + "-" + d.getFullYear();
}

function parseUTCDate(obj) {
    if (obj == null)
        return "--";
    var d = new Date(obj);
    return d.getUTCDate() + "-" + (d.getUTCMonth() + 1) + "-" + d.getUTCFullYear();
}

function loadDDL(d, obj,ffield,sfield, defaultText) {//call this after branch API has sent the data
    $(obj).empty();
    $(obj).append($("<option></option>").attr("value", "-1").text(defaultText));
    for (let i = 0; i <= d.length - 1; i++) {
        var text = d[i][ffield];
        if (sfield != null)
            text += " " + d[i][sfield];
        $(obj).append($("<option></option>").attr("value", d[i]["_id"]).text(text));
    }
    $('.select2').select2();
}

function parseTime(obj) {
    if (obj == "")
        return "00:00";
    var time = "";
    if (obj.hour < 10)
        time = "0";
    time += obj.hour + ":";
    if (obj.minute < 10)
        time += "0";
    time += obj.minute;
    return time;
}

function init() {
    var script = 'installs/config.js'
    $.getScript(script, function () {
        $.holdReady(false);
    });

}

function deleteMultiple(deleteCallback, currXobni) {
    var selectedRec = currXobni.getSelectedRecords();
    if (selectedRec.length > 0) {
        deleteCallback(selectedRec, selectedRec.length);
    } else {
        common.FireToast('top-right', 'white', { popup: 'colored-toast' }, 5000, true, 'error', 'No item selected!');
        return;
    }
}
function getUserType(val) {

    val = Number(val)
    switch (val) {
        case 1:
            return "Admin";
            break;
        case 2:
            return "Project Manager";
            break;
        case 3:
            return "Level 1 Head";
            break;
        case 4:
            return "Level 1";
            break;
        case 5:
            return "Level 2 Head";
            break;   
        case 6:
            return "Level 2";
            break;
        case 7:
            return "Level 3 Head";
            break;
        case 8:
            return "Level 3";
            break;
        case 9:
            return "DM Analyst";
            break;
        case 10:
            return "DM Head";
            break;
        case 11:
            return "DMT";
            break;
        default:
    }
}


//var mmApiEndpoint = 'Common/LoginMindMatrix';
function hideLoader() {
    const loader = document.getElementById("loader");
    loader.classList.add("d-none");
}
//function redirectToMM() {
//    try {
//        sessionStorage.removeItem("childTab");
//        $("#custom-text-loader").show();
//        var currToken = token.parseJwt();
//        if (!currToken) {
//            console.error('User object not found in localStorage');
//            return;
//        }
//        var formdata = {
//            externalId: currToken.userId,
//            email: currToken.Email,
//            firstName: currToken.FirstName,
//            lastName: currToken.LastName,
//        };

//        common.postApi(mmApiEndpoint, JSON.stringify(formdata), function (response) {
//            try {
//                if (isValidUrl(response)) {
//                    // Redirecting to the received URL
//                    window.location.href = response;
//                } else {
//                    throw new Error('Invalid URL received from the server');
//                }
//            } catch (error) {
//                handleError(error);
//            }
//        });
//    } catch (error) {
//        handleError(error);
//    }
//}

// Function to handle errors
function handleError(error) {
    common.showAlert('Failed', `Failed To Login In MindMatrix`, 'error', null, null, 2000, null);
    $("#custom-text-loader").hide();
}

// Function to check if a string is a valid URL
function isValidUrl(url) {
    // Regular expression for URL validation
    var urlPattern = /^(http|https):\/\/[^ "]+$/;
    return urlPattern.test(url);
}

var common = {
    postApi: function (fn, _data, callback, errfn) {
        $.ajax({
            type: "POST",
            url: `${installs.apiUrl}/${fn}`,
            //beforeSend: function (xhr) {
            //    xhr.setRequestHeader("Authorization", `Bearer ${localStorage.getItem("accessToken")}`);
            //},
            headers: { "Authorization": `Bearer ${localStorage.getItem("accessToken")}` },
            data: _data,
            contentType: 'application/json',
            success: function (d) {
                callback(d);
            },
            error: function (req, status, error) {
                if (typeof(errfn) == "function")
                    errfn(req);
            }
        });
    },
    postApiWithFormData: function (fn, _data, callback, errfn) {
        $.ajax({
            type: "POST",
            url: `${installs.apiUrl}/${fn}`,
            headers: { "Authorization": `Bearer ${localStorage.getItem("accessToken")}` },
            data: _data,
            processData: false,
            contentType: false, 
            success: function (d) {
                callback(d);
            },
            error: function (req, status, error) {
                if (typeof (errfn) == "function")
                    errfn(error);
            }
        });
    },
    postApiFormData: function (fn, formData, callback, errfn) {
        $.ajax({
            type: "POST",
            url: `${installs.apiUrl}/${fn}`,
            headers: {
                "Authorization": `Bearer ${localStorage.getItem("accessToken")}`
            },
            data: formData,
            processData: false,
            contentType: false,
            success: function (d) {
                callback(d);
            },
            error: function (req, status, error) {
                if (typeof (errfn) === "function") {
                    errfn(error);
                }
            }
        });
    },

    getApi: function (fn, callback) {
        $.ajax({
            type: "GET",
            url: `${installs.apiUrl}/${fn}`,
            beforeSend: function (xhr) {
                xhr.setRequestHeader("Authorization", `Bearer ${localStorage.getItem("accessToken")}`);
            },
            success: function (msg) {
                if (!Array.isArray(msg) && !$.isPlainObject(msg))
                    msg = JSON.parse(msg);

                callback(msg);
            },
            error: function (req, status, error) {
                console.log(error);
            }
        });
    },

    formateDateTime: function (input) {
        var d = new Date(input);
        return (this.appendPrefix(2, '0', d.getDate()) + "/" + this.appendPrefix(2, '0', (d.getMonth() + 1)) + "/" + d.getFullYear() + " " + this.appendPrefix(2, '0', d.getHours()) + ":" + this.appendPrefix(2, '0', d.getMinutes()));
    },
    showAlert: function (title, text, type, yesBtn, noBtn, timer,toast, fn) {
        showConfirmButton = true;
        showCancel = true;
        if (timer == null)
            timer = 1500;
        if (yesBtn == null)
            showConfirmButton = false;
        if (noBtn == null)
            showCancel = false;
        if (noBtn == null)
            showCancel = false;
        if (toast == null)
            toast = false;
        Swal.fire({
            title: title,
            text: text,
            icon: type,
            toast: toast,
            showConfirmButton: showConfirmButton, 
            confirmButtonText: yesBtn,
            showCancelButton: showCancel,
            cancelButtonText: noBtn,
            timer
        }).then((result) => {
            if (fn != null)
                fn(result);
        })
    },
    FireToast: function (position, iconColor, customClass, timer, timerProgressBar, icon, title) {
        if (position == null)
            position = 'top-right';
        if (iconColor == null)
            iconColor = 'white';
        if (customClass == null)
            customClass = {
                popup: 'colored-toast'
            };
        if (timer == null)
            timer = 1500;
        if (timerProgressBar == null)
            timerProgressBar = true;
        if (title == null)
            title = 'Success';
        if (icon == null)
            icon = 'success';

        const Toast = Swal.mixin({
            toast: true,
            position,
            iconColor,
            customClass,
            showConfirmButton: false,
            timer,
            timerProgressBar,
            didOpen: (toast) => {
                toast.addEventListener('mouseenter', Swal.stopTimer)
                toast.addEventListener('mouseleave', Swal.resumeTimer)
                toast.addEventListener('click', () => Swal.close())
            }
        })
        Toast.fire({
            icon,
            title, 
        })
    },
    FireToastr: function (title = 'Success', message = '', position = 'toast-bottom-right', icon = 'success', closeButton = false, progressBar = true, timer = 5000) {
        // Set Toastr options
        toastr.options = {
            closeButton: closeButton,
            progressBar: progressBar,
            positionClass: position,
            timeOut: timer,
            extendedTimeOut: "2000",
            showDuration: "300",
            hideDuration: "1000",
            showEasing: "swing",
            hideEasing: "linear",
            showMethod: "fadeIn",
            hideMethod: "fadeOut",
            allowHtml: true
        };

        toastr[icon](message, title);
    },
    setupTooltip: function (selector, defaultContent, onclick = false, contentChange = '', followCursor = false, placement = 'top') {
        tippy(selector, {
            content: defaultContent,
            arrow: true,
            followCursor,
            duration: [100, null],
            placement,
            hideOnClick: false,
            onShow(instance) {
                if (onclick) {
                    const button = instance.reference;
                    if (!button._originalOnClick) {
                        button._originalOnClick = button.onclick;
                    }
                    button.onclick = (event) => {
                        if (button._originalOnClick) {
                            button._originalOnClick.call(button, event);
                        }
                        instance.setContent(contentChange);
                        setTimeout(() => {
                            instance.setContent(defaultContent);
                        }, 1000);
                    };
                }
            },
            onHidden(instance) {
                if (onclick) {
                    const button = instance.reference;
                    if (button._originalOnClick) {
                        button.onclick = button._originalOnClick;
                        delete button._originalOnClick;
                    }
                }
            }
        });
    },

    donothing: function () {
        return;
    },
    disableButton: function (btn) {
        $(btn).removeClass($(btn).data('enableclass')).addClass('bg-martini').text($(btn).data('disabletext')).attr('disabled', 'disabled');
    },
    enableButton: function (btn) {
        $(btn).removeClass('bg-martini').addClass($(btn).data('enableclass')).text($(btn).data('actualtext')).removeAttr('disabled');
    },
    validateLogin: function () {
        var j = new Date(localStorage.getItem("loginTime"));
        var isSignedIn = localStorage.getItem("keepMeSignedIn") || 'false';
        var seconds = Math.floor((new Date() - j) / 1000);
        if (!isNaN(seconds)) {//seconds found
            if (seconds > installs.sessionLogout && isSignedIn.toLowerCase() == 'false') {//valid for two hours, this needs to be driven from the config
                var k = common.showAlert('Login Expired!', 'Your login has expired, we will take you to login page.', 'info', 'Ok', null, 0,null, function (response) {
                    if (response.isConfirmed) {
                        localStorage.removeItem("loginTime");
                        localStorage.removeItem("accessToken");
                        localStorage.removeItem("keepMeSignedIn");
                        location.href = "login.html";
                    }
                });
            } else {
                console.log('It\'s a valid login');
                return true;
            }
        } else {//there was some problem with the accessToken, hence taking back to login page.
            var k = common.showAlert('Login Expired!', 'There seems some problem with your login info, you need to login again.', 'info', 'Ok', null, 0, function (response) {
                if (response.isConfirmed) {
                    location.href = "login.html";
                }
            });
        }
    },
    arrayFilter: function (arr, attr, val) {
        var filter = arr.filter(d => eval(`d.${attr}`) == val);//get the object from objectArray
        if (filter.length == 0)//the API is already added in the caching table
            return null;
        return filter;
    },
    renderDate: function (modalId) {

        const commonOptions = {
            language: {
                days: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
                daysShort: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
                daysMin: ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'],
                months: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
                monthsShort: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
                today: 'Today',
                clear: 'Clear',
                firstDay: 0
            },
            onSelect: function (fd, d, calendar) {
                calendar.hide();
            },
            onShow: function (currEvent) {
                $(currEvent.el).addClass('activeDatePicker');
            },
            onHide: function (currEvent) {
                $(currEvent.el).removeClass('activeDatePicker');
            },
        };
        // Datepicker for full calendar with year
        $(`#${modalId}`).find('.air-datepicker[data-date-format="yyyy"]').datepicker({
            ...commonOptions
        });

        // Datepicker for month and day only
        $(`#${modalId}`).find('.air-datepicker:not([data-date-format]):not([data-isonlymonthday])').datepicker({
            ...commonOptions,
            dateFormat: 'mm/dd/yyyy',
            view: 'days',
        });

        // Datepicker for month and day only with restricted year range
        $(`#${modalId}`).find('.air-datepicker[data-isonlymonthday="true"]').datepicker({
            ...commonOptions,
            dateFormat: 'dd/mm',
            view: 'months',
            //minDate: new Date(),
            maxDate: new Date(new Date().getFullYear(), 11, 31),
        });
    },
    currentActiveMfor : null,
    hideUploadBtnFn: function () {
        var currNewMrof = lastArrElm(mrofArr).Mrof;
        var containerId = currNewMrof.containerId;
        var fileUploadContent = $(`#${containerId}`).find('#file-upload-content');

        // Hide the file upload content
        fileUploadContent.hide();

        // Define a function to handle file upload changes
        function handleFileUploadChange() {
            var file = $(this).prop('files')[0];
            var currNewMrof = lastArrElm(mrofArr).Mrof;
            currNewMrof.uploadfiles(file);
        }

        // Attach the change event handler
        fileUploadContent.change(handleFileUploadChange);
    },

    generateRandomPassword: function () {
        const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#";
        const minLength = 6; // Minimum password length
        const maxLength = 6; // Maximum password length

        // Generate a random length between minLength and maxLength
        const length = Math.floor(Math.random() * (maxLength - minLength + 1)) + minLength;

        let password = "";

        for (let i = 0; i < length; i++) {
            const randomIndex = Math.floor(Math.random() * charset.length);
            password += charset.charAt(randomIndex);
        }

        return password;
    },
    toggleElems: function (elementIds, action) {
        var { containerId } = lastArrElm(mrofArr).Mrof;
        elementIds.forEach(function (elementId) {
            var $ele = $("#" + containerId).find("#" + elementId);
            var selector = $ele.parent("div.form-group");
            if (selector.length == 0) selector = $ele.parent().parent("div.form-group");
            if (action === 'show') {
                selector.show();
            } else if (action === 'hide') {
                selector.hide();
            }
        });
    },
    ToggleFields:(elementIds, value) => {
        elementIds.forEach(elementId => {
            var element = $("#" + elementId);
            element.attr('disabled', value);
        });
    },
    EmptyFieldValues:(elementIds) => {
        elementIds.forEach(elementId => {
            var element = $("#" + elementId);
            element.val('');
        });
    },
    unselect2val: function (elementIds) {
        elementIds.forEach(function (elementId) {
            $("#" + elementId).select2('destroy').find('option').prop('selected', false).end().select2();
        });
    }
}

var enums = {
    Gender: [{ "number": 1, "name": "Male" }, { "number": 2, "name": "Female" }, { "number": 3, "name": "Others" }],

    PaymentStatus: [{ "number": 1, "name": "Paid" }, { "number": 2, "name": "Pending" }, { "number": 3, "name": "Late" }],
    Months: [{ "number": 1, "name": "Jan" }, { "number": 2, "name": "Feb" }, { "number": 3, "name": "Mar" }, { "number": 4, "name": "Apr" }, { "number": 5, "name": "May" }, { "number": 6, "name": "Jun" }, { "number": 7, "name": "Jul" }, { "number": 8, "name": "Aug" }, { "number": 9, "name": "Sep" }, { "number": 10, "name": "Oct" }, { "number": 11, "name": "Nov" }, { "number": 12, "name": "Dec" }],
    ThumbIcons: [{ "key": ".xlsx", "thumb": "excel.png" }, { "key": ".pdf", "thumb": "pdf.png" }, { "key": ".docx", "thumb": "word.png" }],
    getEnum: function (eType, eVal) {
        var obj = null;
        switch (eType) {
            case "gender":
                obj = lookup(this.Gender, "number", parseInt(eVal));
                break;
            case "dutystatus":
                obj = lookup(this.DutyStatus, "number", parseInt(eVal));
                break;
            case "persona":
                obj = lookup(this.Persona, "number", parseInt(eVal));
                break;
            case "paymentstatus":
                obj = lookup(this.PaymentStatus, "number", parseInt(eVal));
                break;
            case "months":
                obj = lookup(this.Months, "number", parseInt(eVal));
                break;
            case "expensepaymentstatus":
                obj = lookup(this.ExpensePaymentStatus, "number", parseInt(eVal));
                break;
            case "fees":
                obj = lookup(this.FeesPaymentStatus, "number", parseInt(eVal));
                break;
            case "thumbs":
                obj = lookup(this.ThumbIcons, "key", eVal);
                break;
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
            case "gender":
                obj = lookup(this.Gender, "name", eVal);
                break;
        }
        if (obj == undefined) {
            var obj = [];
            obj["number"] = 0;
        }
        return obj;
    },

}
var partnerOptions = [];
var prospectingOptions = [];
var inboundOptions = [];
loadPartnerOptions();
function loadPartnerOptions() {
    getDropdownOptions(ClientBranchCompanyCommonDropDowns).then((res) =>{
        partnerOptions = res.PartnerLeadSourceDetails;
        prospectingOptions = res.ProspectingLeadSourceDetails;
        inboundOptions = res.InboundLeadSourceDetails;
    });
}
var clientreferralOptions = [
    { "label": "Select Option", val: "" },
    { "label": "Yes", val: "Yes" },
    { "label": "No", val: "No" },
];


var MyWorkTaskIdOptions = [
    { "label": "Select Task ID", val: "" },
    { "label": TaskStatus.absM, val: "1" },
    { "label": TaskStatus.absMf, val: "2" },
    { "label": TaskStatus.absMc, val: "3" },
    { "label": TaskStatus.absAi, val: "4" },
    { "label": TaskStatus.absAiF, val: "5" },
    { "label": TaskStatus.absAiC, val: "6" },
];



var defaultOptions = [
    { "label": "Select Option", val: "1", Name: 'None' },
];

var accountManager = [
    { "label": "Select Account Manager", val: "" },
    { "label": "Edwin John", val: "Edwin John" }
]

var statusArray = [
    { "levelStatus": "Level 1 Assigned", val: "1" },
    { "levelStatus": "Level 2 Assigned", val: "2" },
    { "levelStatus": "Level 3 Assigned", val: "3" }
]

var levelEnum = {
    levelOne: "Level_1",
    levelTwo: "Level_2",
    levelThree: "Level_3"
};


function handleImageBrokage(ele) {
    $(ele).hide();
    $(ele).siblings("span").show();
}

function adjustDatepickerPosition() {
    var datepickerInstance = $('input[type="text"].air-datepicker.activeDatePicker');
    if (datepickerInstance.length) {
        // Example of how to adjust the position manually
        var offset = datepickerInstance.offset();
        // Adjust the datepicker position to stay within view
        $('.datepicker.active').css({
            top: offset.top + datepickerInstance.outerHeight() + 15,
            left: offset.left
        });
    }
    return false;
}
$(`#modal`).on('scroll', function (event) {
    adjustDatepickerPosition(); // Call the function to adjust position
});


function setSelectMaxlength(containerId) {
    $(containerId + ' .select2[data-maxselection="true"]').select2({
        width: '100%',
        maximumSelectionLength: 2
    });
}

// this function loads the states according to the selected country in add/edit forms.
function handleFunctionState(e) {
    var defaultState = "", eleState = "", field = "";
    if ($(e).attr("id") == "ddl-Country") {
        defaultState = "Select State";
        eleState = "ddl-State";
        field = "State";
    } else if ($(e).attr("id") == "ddl-HqCountry") {
        defaultState = "Select HQ State";
        eleState = "ddl-HqState";
        field = "HqState";
    } else {
        return;
    }
    return new Promise(async (resolve, reject) => {
        var currMrof = lastArrElm(mrofArr).Mrof;
        var data = $(e).val()?.trim().toLowerCase();
        if (!data) {
            reject(false);
            return;
        }
        var options = { Id: "", "StateName": defaultState, "CountryId": "" };
        var formdata = { "id": data };
        common.postApi("Common/GetAllStatesByCountryId", JSON.stringify(formdata), function (res) {
            common.unselect2val([eleState]);
            const resData = [options, ...res];
            currMrof.rebind(field, resData, `#${currMrof.containerId}`);
            resolve(res);
        }, function (error) {
            reject(false);
        });
    });
}


function handleTabNavigation(tab, tabList, callbackFn, defaultPage, defaultPath) {
    if (Object.values(tabList).includes(tab)) {
        callbackFn($("#" + tab));
    } else {
        core.loadPage(defaultPage, defaultPath, 'new user form', () => { }, 'mainSection');
    }
}
function toggleFutureDatesInDatePicker($datePicker, disableFutureDates) {
    $($datePicker).datepicker({
        maxDate: disableFutureDates ? new Date() : null
    });
}

function generateDDOptions(data) {
    var ddoptions = '';
    data.forEach((item) => {
        ddoptions += `<option value="${item.val}">${item.label}</option>`;
    });
    return ddoptions;
};

function fetchTotalLeaseCnt(currEvent) {
    var currEvent = $(currEvent);
    currEvent.addClass("fa-spin");
    var currProjId = currEvent.closest('tr').attr('data-recordid');
    var api = `Project/GetLeaseCountByProj/${currProjId}`;

    common.getApi(api, (d) => {
        if (d != null) {
            var td = currEvent.closest("td");
            td.attr("title", d);
            td.contents().first().replaceWith(d + " ");
        }
        currEvent.removeClass("fa-spin");
    });
}
function responsiveGrid(api, rowIdx, columns) {
    const settings = api.settings()[0];
    const columnDefs = settings.aoColumns;
    const tableName = settings.oInit.tableName;
    const row = api.row(rowIdx).node();
    const recordId = $(row).data('recordid');
    let detailContent = '<ul>';

    columnDefs.forEach((column, i) => {
        if (!column.bVisible) {
            const columnData = api.cell(rowIdx, i).data();
            const cellNode = api.cell(rowIdx, i).node();
            const cellHtml = $(cellNode).html();
            const label = column.label || column.title;

            switch (column.title) {
                case 'Action':
                    detailContent += `<li><span class="dtr-title float-start">${column.title}:</span> 
                                      <span class="dtr-data dropAlign">${Mustache.render($("#grid-kebab-action-event").html(), { IsFreeze: false, Id: recordId })}</span></li>`;
                    break;

                case ' ':
                    if (tableName === 'all-project-Grid') {
                        detailContent += `<button onclick="projectGrid.addAi('${recordId}', this)" type="button" class="btn btn-primary btn-primary-light-bg">Add to AI <i class="fas mg-l-10"></i></button> 
                                          &nbsp; 
                                          <button onclick="projectGrid.addgroup('${recordId}')" type="button" class="btn btn-primary">Add Group <i class="fas mg-l-10"></i></button> &nbsp;`;
                    }
                    break;

                case 'Status':
                    detailContent += `<li><span class="dtr-title">${column.title}:</span> 
                                      <span class="dtr-data">${cellHtml}</span></li>`;
                    break;

                default:
                    detailContent += `<li><span class="dtr-title">${column.title}:</span> 
                                      <span class="dtr-data">${columnData}</span></li>`;
                    break;
            }
        }
    });

    detailContent += '</ul>';
    return detailContent;
}



function addLoaderToCustomPopup($ele,cls) {
    $ele.prepend($("#custom-popup-loader").html());
    $ele.addClass(cls);
}
function removeCustomPopupLoader($ele, $modal, cls, toDisplay = false) {
    $ele.find(".loader-custom").remove();
    if (toDisplay) $modal.css("display", "block");
    $ele.removeClass(cls);
}

