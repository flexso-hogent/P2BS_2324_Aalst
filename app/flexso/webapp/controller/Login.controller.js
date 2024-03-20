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

        var oProfileImagePath = jQuery.sap.getModulePath(
          "flexso",
          "/images/profile.jpg"
        );
        var oImageModel = new JSONModel({
          path: oRootPath,
          profileImagePath: oProfileImagePath,
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
              oRouter.navTo("profile");
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
        var oRouter = UIComponent.getRouterFor(this);
        oRouter.navTo("wachtwoordVergeten");
      },
      onSwitchToEnglish: function () {
        var oResourceModel = this.getView().getModel("i18n");
        oResourceModel.sLocale = "en";
        sap.ui.getCore().getConfiguration().setLanguage("en");
        this.getView().getModel("i18n").refresh();
      },

      onSwitchToDutch: function () {
        var oResourceModel = this.getView().getModel("i18n");
        oResourceModel.sLocale = "nl";
        sap.ui.getCore().getConfiguration().setLanguage("nl");
        this.getView().getModel("i18n").refresh();
      },
      onProfileButtonClick: function () {
        var oRouter = UIComponent.getRouterFor(this);
        oRouter.navTo("profile");
      },
    });
  }
);
