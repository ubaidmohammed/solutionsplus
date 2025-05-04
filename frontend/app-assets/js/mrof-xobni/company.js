var clientXobni = new XobniNew();
var partnerXobni = new XobniNew();
var vendorXobni = new XobniNew();
var branchXobni = new XobniNew();

var clientGrid = {
    loadList: function (rowIcons,filterData) {
        clientXobni.reset();
        var fields = {
            "fields":
                [
                    {
                        "dbcolumn": "CompanyName",
                        "header": "Name",
                        "showmaxchar": 35,
                        "searchBy": "companyName",
                        "isSorting": true,
                        "render": true,
                    }, {
                        "dbcolumn": "BranchName",
                        "header": "Branch Name",
                        "showmaxchar": 35,
                        "searchBy": "branchCompany.name",
                        "isSorting": true,
                        "render": true,
                    }, {
                        "dbcolumn": "Industry",
                        "header": "Industry",
                        "showmaxchar": 35,
                        "searchBy": "ClientCompany.industry",
                        "isSorting": true,
                        "render": true,
                    }, {
                        "dbcolumn": "CreatedOn",
                        "showmaxchar": 35,
                        "render": true,
                        "header": "Created On",
                        "searchBy": "createdOn",
                        "isSorting": true
                    }, {
                        "dbcolumn": "UpdatedOn",
                        "showmaxchar": 35,
                        "header": "Updated On",
                        "searchBy": "updatedOn",
                        "isSorting": true
                    },
                    {
                        "header": "Action",
                        "templateSource": "#grid-kebab-action-event",
                        "render": true,
                        "isSorting": false
                    }
                ]
        };
        clientXobni.api = "ClientCompany/GetAllClientCompanyGrid";
        clientXobni.columns = fields;
        clientXobni.enableSelectRecord = true;
        clientXobni.isDtreqPagination = true;
        console.log(fields);
        if (rowIcons == null)
            rowIcons = []
        clientXobni.rowIcons = rowIcons;
        clientXobni.assignDataFn = clientGrid.sortRecords;
        clientXobni.init(filterData);
    },
    sortRecords: function (d) {
        clientXobni.data = convertBsonArrayToObject(d);
    },

    editStudent: function (id) {
        core.loadPage('company', 'company/client/addForm.html', 'new user form', () => {
            getDropdownOptions(ClientCompanyDropDowns).then((res) => {
                renderForm(id, 'ClientCompany/GetClientById', 'modal #profile-info-wrap', res);
            });
        }, 'modal .modal-dialog');
    },

    deleteRecord: function (id, cnt = '') {
        common.showAlert('Confirm delete?', `Are you sure you want to delete ${cnt} Client Company?`, 'question', 'Yes', 'Cancel', 0, null, function (response) {
            if (!response.isConfirmed)
                return;
            common.postApi("ClientCompany/Delete", JSON.stringify(id), (e) => DeleteDataFromGrid(e, clientGrid, `${ cnt } Client Deleted Successfully`));
        });
    },

}

var partnerGrid = {
    loadList: function (rowIcons,filterData) {
        partnerXobni.reset();
        var fields = {
            "fields":
                [
                    {
                        "dbcolumn": "CompanyName",
                        "header": "Company Name",
                        "showmaxchar": 35,
                        "searchBy": "companyName",
                        "isSorting": true,
                        "render": true,
                    }, {
                        "dbcolumn": "PartnerType",
                        "header": "Partner Type",
                        "showmaxchar": 35,
                        "searchBy": "partnerType",
                        "isSorting": true,
                        "render": true,
                    }, {
                        "dbcolumn": "CreatedOn",
                        "header": "Created On",
                        "showmaxchar": 35,
                        "searchBy": "createdOn",
                        "render": true,
                        "isSorting": true
                    }, {
                        "dbcolumn": "UpdatedOn",
                        "header": "Updated On",
                        "showmaxchar": 35,
                        "render": true,
                        "searchBy": "updatedOn",
                        "isSorting": true
                    },
                    {
                        "header": "Action",
                        "templateSource": "#grid-kebab-action-event",
                        "render": true,
                        "isSorting": false
                    }
                ]
        };
        partnerXobni.api = `PartnerCompany/GetAllPartnerCompanyGrid`;
        partnerXobni.columns = fields;
        partnerXobni.enableSelectRecord = true;
        partnerXobni.isDtreqPagination = true;
        if (rowIcons == null)
            rowIcons = []
        partnerXobni.rowIcons = rowIcons;
        partnerXobni.assignDataFn = partnerGrid.sortRecords;
        partnerXobni.init(filterData);
    },
    sortRecords: function (d) {
        partnerXobni.data = convertBsonArrayToObject(d);
    },

    editStudent: function (id) {
        core.loadPage('company', 'company/partner/addForm.html', 'new user form', () => {
            getDropdownOptions(PartnerCompanyDropDowns).then((res) => {
                renderForm(id, 'PartnerCompany/GetPartnerById', 'modal #profile-info-wrap',res);
            })
        }, 'modal .modal-dialog');
    },

    deleteRecord: function (id, cnt = '') {
        common.showAlert('Confirm delete?', `Are you sure you want to delete ${cnt} Partner Company?`, 'question', 'Yes', 'Cancel', 0, null, function (response) {
            if (!response.isConfirmed)
                return;
            common.postApi("PartnerCompany/Delete", JSON.stringify(id), (e) => DeleteDataFromGrid(e, partnerGrid, `${cnt} Partner Company Deleted Successfully`));
        });
    },
}

var vendorGrid = {
    loadList: function (rowIcons,filterData) {
        vendorXobni.reset();
        var fields = {
            "fields":
                [
                    {
                        "dbcolumn": "CompanyName",
                        "header": "Company Name",
                        "showmaxchar": 35,
                        "searchBy": "companyName",
                        "isSorting": true,
                        "render": true,
                    }, {
                        "dbcolumn": "VendorType",
                        "header": "Vendor Type",
                        "showmaxchar": 35,
                        "searchBy": "vendorType",
                        "isSorting": true,
                        "render": true,
                    }, {
                        "dbcolumn": "CreatedOn",
                        "header": "Created On",
                        "showmaxchar": 35,
                        "render": true,
                        "searchBy": "createdOn",
                        "isSorting": true
                    }, {
                        "dbcolumn": "UpdatedOn",
                        "header": "Updated On",
                        "showmaxchar": 35,
                        "render": true,
                        "searchBy": "updatedOn",
                        "isSorting": true
                    },
                    {
                        "header": "Action",
                        "templateSource": "#grid-kebab-action-event",
                        "render": true,
                        "isSorting": false
                    }
                ]
        };
        vendorXobni.api = `VendorCompany/GetAllVendorCompanyGrid`;
        vendorXobni.columns = fields;
        vendorXobni.enableSelectRecord = true;
        vendorXobni.isDtreqPagination = true;
        console.log(fields);
        if (rowIcons == null)
            rowIcons = []
        vendorXobni.rowIcons = rowIcons;
        vendorXobni.assignDataFn = vendorGrid.sortRecords;
        vendorXobni.init(filterData);
    },
    sortRecords: function (d) {
        vendorXobni.data = convertBsonArrayToObject(d);
    },

    editStudent: function (id) {
        core.loadPage('company', 'company/vendor/addForm.html', 'new user form', () => {
            getDropdownOptions(VendorCompanyDropDowns).then((res) => {
                renderForm(id, 'VendorCompany/GetVendorById', 'modal #profile-info-wrap',res);
            })
        }, 'modal .modal-dialog');
    },

    deleteRecord: function (id, cnt = '') {
        common.showAlert('Confirm delete?', `Are you sure you want to delete ${cnt} Vendor Company?`, 'question', 'Yes', 'Cancel', 0, null, function (response) {
            if (!response.isConfirmed)
                return;
            common.postApi("VendorCompany/Delete", JSON.stringify(id), (e) => DeleteDataFromGrid(e, vendorGrid, `${cnt} Vendor Company Deleted Successfully`));
            
        });
    },

}



var branchGrid = {
    loadList: function (rowIcons) {
        branchXobni.reset();
        var fields = {
            "fields":
                [
                    {
                        "dbcolumn": "Name",
                        "header": "Branch Name",
                        "showmaxchar": 35,
                        "searchBy": "name",
                        "isSorting": true,
                        "render": true,
                    }, {
                        "dbcolumn": "CompanyName",
                        "header": "Company Name",
                        "showmaxchar": 35,
                        "searchBy": "companyName",
                        "isSorting": true,
                        "render": true,
                    }, {
                        "dbcolumn": "CreatedOn",
                        "header": "Created On",
                        "showmaxchar": 35,
                        "render": true,
                        "searchBy": "createdOn",
                        "isSorting": true,
                    }, {
                        "dbcolumn": "UpdatedOn",
                        "header": "Updated On",
                        "showmaxchar": 35,
                        "searchBy": "updatedOn",
                        "render": true,
                        "isSorting": true
                    },
                    {
                        "header": "Action",
                        "templateSource": "#grid-kebab-action-event",
                        "render": true,
                        "isSorting": false
                    }
                ]
        };
        branchXobni.api = `Branch/GetAllBranchCompanyGrid`;
        branchXobni.columns = fields;
        branchXobni.enableSelectRecord = true;
        branchXobni.isDtreqPagination = true;
        console.log(fields);
        if (rowIcons == null)
            rowIcons = []
        branchXobni.rowIcons = rowIcons;
        branchXobni.assignDataFn = branchGrid.sortRecords;
        branchXobni.init();
    },
    sortRecords: function (d) {
        branchXobni.data = convertBsonArrayToObject(d);
    },

    editStudent: function (id) {
        core.loadPage('company', 'company/branch/addForm.html', 'new branch form', () => {
            getDropdownOptions(BranchCompanyDropDowns).then((res) => {
                renderForm(id, 'Branch/GetBranchById', 'modal #profile-info-wrap',res);
            })
        }, 'modal .modal-dialog');
    },

    deleteRecord: function (id, cnt = '') {
        common.showAlert('Confirm delete?', `Are you sure you want to delete ${cnt} Branch Company?`, 'question', 'Yes', 'Cancel', 0, null, function (response) {
            if (!response.isConfirmed) 
                return;
            common.postApi("Branch/Delete", JSON.stringify(id), (e) => DeleteDataFromGrid(e, branchGrid, `${cnt} Branch Deleted Successfully`));
        });
    },
}


