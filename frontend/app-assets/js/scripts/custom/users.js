var user = {
    email: null,
    initials: null,
    name: null,
    id: null,
    allUsers: null,
    loadAll: function () {
        common.getApi("Users/GetAllUsers", user.loadAllSuccess);
    },
    loadAllSuccess: function (d) {
        user.allUsers = d;
    },
    findUsers: function (key, val) {
        return user.allUsers.find((o) => { return o[key] === val })
    },
    reset: function () {
        user.email = null;
        user.initials = null;
        user.name = null;
        user.id = null;
    }, login: function () {
        var obj = {};
        obj["Email"] = $('#login-email').val();
        obj["Password"] = $('#login-password').val();
        var d = JSON.stringify(obj);
        //$.ajax({
        //    type: "POST",
        //    url: `${apiUrl}/Users/ValidateUser`,
        //    data: d,
        //    contentType: 'application/json',
        //    success: function (d) {
        //        user.loginSuccess(d);
        //    },
        //    error: function (req, status, error) {
        //        console.log(error);
        //    }
        //});
        user.loginSuccess(userDetails);
    },
    loginSuccess: function (d) {
        user.removeSession();
        if (d == undefined) {
            common.showAlert("Login failed", "Sorry, the user name and password you have provided doesn't exist", "error");
            return;
        }
        user.email = d.email;
        user.name = d.name;
        user.id = d.objectId;
        user.thumbnail = d.thumbnail;
        user.role = d.role;
        user.updateSession(d);
        window.location.href = 'index.html';
    },
    logout: function () {
        user.removeSession();
        window.location.href = 'login.html';
    },
    validateSession: function () {
        var status = false;
        var d = localStorage.getItem('UserSession');
        if (d == null) {//no session found
            window.location.href = 'login.html';
        }
        d = $.parseJSON(d);
        var sessionTime = new Date(d.dt);
        var now = new Date();
        sessionTime.setMinutes(sessionTime.getMinutes() + 10);//add 10 minutes to session
        if (now < sessionTime) {
            user.updateSession();
            return true;
        }
        window.location.href = 'login.html';
        return status;
    },
    loaduser: function () {
        var d = localStorage.getItem('UserSession');
        if (d == null) {//no session found
            window.location.href = 'login.html';
        }
        d = $.parseJSON(d);
        user.email = d.email;
        user.name = d.name;
        user.id = d.id;
        $('.user-name').html(d.name);
        $('.profile-avatar').attr('src', d.thumbnail);
        $('.user-status').html(d.role);
    },
    updateSession: function (d) {
        d["dt"] = new Date();
        localStorage.setItem('UserSession', JSON.stringify(d));
    }, removeSession: function () {
        localStorage.setItem('UserSession', null);
    }
}