sap.ui.define(
  [
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/m/MessageToast",
    "sap/ui/core/UIComponent",
  ],
  function (Controller, JSONModel, MessageToast, UIComponent) {
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
        var username = this.getView().byId("usernameInput").getValue();
        var password = this.getView().byId("passwordInput").getValue();

        if (username === "admin" && password === "admin") {
          MessageToast.show("Login successful");

          var oRouter = UIComponent.getRouterFor(this);
          oRouter.navTo("List");
        } else {
          MessageToast.show("Invalid credentials. Please try again.");
        }
      },
      onForgotPasswordPress: function () {
        MessageToast.show("Forgot password pressed");
      },
    });
  }
);
