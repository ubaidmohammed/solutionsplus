var userDetails = {
    email: 'mohd.ubaid@gmail.com',
    name: 'Mohammed Ubaid',
    objectId: '66dc4e264f17f561a73b75bf',
    thumbnail: '../app-assets/images/portrait/small/avatar-s-12.jpg',
    role: 'Administrator',
}
//user.initials

var menuItems1 = [
    {
        link: 'alert("Hello World");return false;', icon: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-shuffle"><polyline points="16 3 21 3 21 8"></polyline><line x1="4" y1="20" x2="21" y2="3"></line><polyline points="21 16 21 21 16 21"></polyline><line x1="15" y1="15" x2="21" y2="21"></line><line x1="4" y1="4" x2="9" y2="9"></line></svg>',
        label: 'Live Master Sheet', isSelected: true
    },
    { link: 'incidents.loadListPage();return false;', 'icon': '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-shopping-cart"><circle cx="9" cy="21" r="1"></circle><circle cx="20" cy="21" r="1"></circle><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path></svg>', 'label': 'Second Link', isSelected: false }
]
var menuItems = []

var customViews = [
    {
        container: 'page',
        type:'html',
        name: 'dashboard', rows: [
            {
                components: [
                    { type: 'statistics', size: 4, link: 'alert("Hello World");return false;', icon: '<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>', color: 'bg-light-warning', label: '12k', desc: 'Hello World' },
                    { type: 'statistics', size: 4, link: 'alert("Hello World2");return false;', icon: '<path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path><line x1="3" y1="6" x2="21" y2="6"></line><path d="M16 10a4 4 0 0 1-8 0"></path>', color: 'bg-light-danger', label: '97.8k', desc: 'Orders' },
                    { type: 'statistics', size: 4, link: 'alert("Hello World2");return false;', icon: '<path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path><line x1="3" y1="6" x2="21" y2="6"></line><path d="M16 10a4 4 0 0 1-8 0"></path>', color: 'bg-light-danger', label: '97.8k', desc: 'Requests' }
                ]
            },
            {
                components: [
                    {
                        type: 'table', size: 12,
                        link: '__recordId="-1";renderView.render("clientNewRequest");return false;',
                        title: 'All Request(s)',
                        fields: [
                            { "dbcolumn": "month", "header": "Month Name" },
                            { "dbcolumn": "amount", "header": "Amount" },
                            { "dbcolumn": "status", "header": "Fees Status", isBadge: "true" },
                            { "dbcolumn": "feespaiddate", "header": "Payment Date" }
                        ],
                        rowIcons: [{ "icon": "fas fa-cogs", "label": "Edit", "btncolor": "dodger-blue", "fn": "editRecord(\"{{id}}\")" }],
                        data: [{ month: 'January', amount: 154.00, status: 'Paid' }, { month: 'February', amount: 267, status: 'Paid' }]
                    },
                ]
            },
        ]
    },
    {
        container: 'page',
        type:'form',
        name: "clientNewRequest",
        title: "Add New Request",
        fields: [
            {
                "field": "name",//entitry field name, unique name
                "type": "text",
                "inputtype": "text",
                "label": "Expense Name",
                "isrequired": 1,
                "size": 3,
                "error": "Please enter expense name",
            },
            {
                "field": "invoiceId",//entitry field name, unique name
                "type": "text",
                "inputtype": "text",
                "label": "Invoice/Purchase Order Number",
                "size": 3
            }, {
                "field": "exprenseType",//entitry field name, unique name
                "type": "ddl",
                "label": "Select Type of Expense",
                "isrequired": 1,
                "size": 3,
                "error": "Please select expense type",
                "options": [{ "label": "Expense Type", val: "-1" }, { "label": "Salary", val: "1" }, { "label": "Transport", val: "2" },
                { "label": "Maintainance", val: "3" },
                { "label": "Purchase", val: "4" },
                { "label": "Utilities", val: "5" },
                { "label": "Others", val: "6" }]
            },
            {
                "type": "groupheader",
                "headertext": "Salary Details"
            },
            {
                "field": "amount",//entitry field name, unique name
                "type": "text",
                "inputtype": "number",
                "label": "Amount",
                "isrequired": 1,
                "size": 3,
                "error": "Please enter correct amount",
            },
            {
                "field": "phone",//entitry field name, unique name
                "type": "text",
                "inputtype": "text",
                "maxlength": 12,
                "label": "Phone",
                "size": 3
            },
            {
                "field": "email",//entitry field name, unique name
                "type": "text",
                "inputtype": "text",
                "maxlength": 250,
                "label": "Email",
                "size": 3
            }, {
                "field": "paymentStatus",//entitry field name, unique name
                "type": "ddl",
                "label": "Select Payment Status",
                "isrequired": 1,
                "size": 3,
                "error": "Please select payment status",
                "options": [{ "label": "Payment Status", val: "-1" }, { "label": "Paid", val: "1" }, { "label": "Due", val: "2" },
                { "label": "Overdue", val: "3" },
                { "label": "Others", val: "4" }]
            }, {
                "field": "dueDate",//entitry field name, unique name
                "type": "date",
                "label": "Payment Due Date",
                "size": 3
            },
            {
                "field": "photo",//entitry field name, unique name
                "type": "fileupload",
                "filetype": "profilepicture",
                "label": "Upload Photo",
                "size": 3
            },
        ]
    }
]