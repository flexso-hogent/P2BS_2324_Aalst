sap.ui.define(
  [
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/m/MessageToast",
  ],
  function (Controller, JSONModel, MessageToast) {
    "use strict";

    return Controller.extend("flexso.controller.Login", {
      onInit: function () {
        var oRootPath = jQuery.sap.getModulePath(
          "flexso",
          "/images/Flexso.png"
        );
        var oImageModel = new JSONModel({
          path: oRootPath,
        });
        this.getView().setModel(oImageModel, "imageModel");
      },

      onLoginPress: function () {
        MessageToast.show("Login pressed");
      },
      onForgotPasswordPress: function () {
        MessageToast.show("Forgot password pressed");
      },
    });
  }
);
