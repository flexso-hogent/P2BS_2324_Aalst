sap.ui.define(
  [
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/m/MessageToast",
    "sap/ui/core/UIComponent",
    "sap/ui/core/routing/History",
  ],
  function (Controller, JSONModel, MessageToast, UIComponent, History) {
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

        //Stay logged in button
        var stayLoggedIn = localStorage.getItem("stayLoggedIn");
        if (stayLoggedIn && stayLoggedIn === "true") {
          this.getView().byId("stayLoggedInCheckbox").setSelected(true);
        }
      },

      onLoginPress: function () {
        var username = this.getView().byId("usernameInput").getValue();
        var password = this.getView().byId("passwordInput").getValue();
        var stayLoggedIn = this.getView()
          .byId("stayLoggedInCheckbox")
          .getSelected();

        if (username === "admin" && password === "admin") {
          MessageToast.show("Login successful");
          setTimeout(
            function () {
              var oRouter = UIComponent.getRouterFor(this);
              oRouter.navTo("detail");
            }.bind(this),
            1000
          );

          localStorage.setItem("stayLoggedIn", stayLoggedIn);
        } else {
          MessageToast.show("Invalid credentials. Please try again.");
        }
      },

      onRegisterPress: function () {
        var oRouter = UIComponent.getRouterFor(this);
        oRouter.navTo("register");
      },

      onForgotPasswordPress: function () {
        MessageToast.show("Forgot password pressed");
      },
    });
  }
);
