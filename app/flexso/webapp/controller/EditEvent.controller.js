sap.ui.define(
  ["sap/ui/core/mvc/Controller", "sap/m/MessageToast"],
  function (Controller, MessageToast) {
    "use strict";

    return Controller.extend("flexso.controller.EditEvent", {
      onSaveEvent: function () {
        // Implement saving logic here
        MessageToast.show(
          this.getView().getModel("i18n").getProperty("eventUpdated")
        );
      },

      onDeleteEvent: function () {
        // Implement deletion logic here
        MessageToast.show(
          this.getView().getModel("i18n").getProperty("eventDeleted")
        );
      },
    });
  }
);
