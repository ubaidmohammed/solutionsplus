addForm.html – Sample code for MROF form structure.

common.js ---  all helping function are in this file.

company.js – Sample implementation for Xobni.

mrof.js – Class-based implementation of MROF.
Initialize using:
const yourMROFName = new Mrof();

Template.html – Contains all PTX templates used across the application.

Xobni.new.js – Enhanced Xobni with server-side pagination support.
To enable it, set:
YourXobni.isDtreqPagination = true;

This script only uses buildCOlumn function from Xobni; the rest of the code is pending updates, which I will update on weekend when I get free time

xobniClass.js – Standard class-based Xobni implementation without server-side pagination.