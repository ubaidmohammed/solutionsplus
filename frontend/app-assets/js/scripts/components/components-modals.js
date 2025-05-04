/*=========================================================================================
    File Name: components-modal.js
    Description: Modals are streamlined, but flexible, dialog prompts with the minimum
				required functionality and smart defaults.
    ----------------------------------------------------------------------------------------
    Item Name: Vuexy  - Vuejs, HTML & Laravel Admin Dashboard Template
    Author: Pixinvent
    Author URL: hhttp://www.themeforest.net/user/pixinvent
==========================================================================================*/
(function (window, document, $) {
  'use strict';

  /******************/
  // Modal events //
  /******************/

  // onShow event
    var showModalTrigger = document.getElementById('modalwindow');

  var showModal = new bootstrap.Modal(showModalTrigger, {
    title: 'Modal Show Event',
    trigger: 'click',
    placement: 'right'
  });

})(window, document, jQuery);
