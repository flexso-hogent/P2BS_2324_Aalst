sap.ui.define(
  [
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/m/MessageToast",
    "jquery.sap.global", // Import jQuery
  ],
  function (Controller, JSONModel, MessageToast, jQuery) {
    "use strict";

    return Controller.extend("flexso.controller.Overview", {
      onInit: function () {
        this.loadData();
      },
      loadData: function () {
        var that = this;
        jQuery.ajax({
          url: "http://localhost:4004/odata/v4/catalog/Events",
          dataType: "json",
          success: function (data) {
            var events = data.value;
            var eventModel = new JSONModel(events);
            that.getView().setModel(eventModel, "eventModel");
          },
          error: function (xhr, status, error) {
            MessageToast.show("Error fetching data: " + error);
          },
        });
      },
    });
  }
);
