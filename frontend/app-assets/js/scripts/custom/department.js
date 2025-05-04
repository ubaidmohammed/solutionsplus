var department = {
    isloadingall: false,
    isLoadedOnDDL: false,
    allDept: null,
    callback: null,
    control: null,
    loadAll: function () {
        common.getApi("Departments/GetAllDepts", department.loadAllSuccess);
    },
    loadAllSuccess: function (d) {
        if (this.isloadingall == true)
            return;
        department.isloadingall = true;
        department.allDept = d;
        incidents.populateDept(department.control);
        if (department.callback != null) {
            department.callback();
            department.callback = null;
        }
    },
    findDept: function (key, val) {
        if (this.allDept == null) {
            this.isloadingall = true;
            this.loadAll();
            return;
        }
        return department.allDept.find((o) => { return o[key] === val })
    }
}