var faults = {
    addNew: function () {
        modal.size = "modal-lg"
        modal.success = incidents.save;
        modal.title = "Add New Fault";
        modal.load('faults/new-fault.html');
    },
    save: function () {
        console.log('Hello Ubaid');
    }

}