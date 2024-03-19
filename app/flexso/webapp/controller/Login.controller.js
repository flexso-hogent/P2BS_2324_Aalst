sap.ui.define(
  ["sap/ui/core/mvc/Controller", "sap/m/MessageToast"],
  function (Controller, MessageToast) {
    "use strict";

    return Controller.extend("flexso.controller.Login", {
      onLoginPress: function () {
        MessageToast.show("Login pressed");
      },
    });
  }
);
