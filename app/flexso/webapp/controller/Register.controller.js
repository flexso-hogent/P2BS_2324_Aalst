sap.ui.define(
  [
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/m/MessageToast",
    "sap/ui/core/UIComponent",
  ],
  /**
   * @param {typeof sap.ui.core.mvc.Controller} Controller
   */
  function (Controller, JSONModel, MessageToast, UIComponent) {
    "use strict";

    return Controller.extend("flexso.controller.Register", {
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
      },
      onRegister: function () {
        var email = this.getView().byId("emailInput").getValue();
        var company = this.getView().byId("companyInput").getValue();
        var role = this.getView().byId("roleInput").getValue();
        var password = this.getView().byId("passwordInput").getValue();
        var passwordRepeat = this.getView()
          .byId("confirmPasswordInput")
          .getValue();

        function isValidEmail(email) {
          var emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
          return emailRegex.test(email);
        }

        if (!isValidEmail(email)) {
          MessageToast.show("Invalid email address!");
        }

        if (password !== passwordRepeat) {
          MessageToast.show("passwords do not match!");
        }

        if (
          email === "" ||
          company === "" ||
          role === "" ||
          password === "" ||
          passwordRepeat === ""
        ) {
          MessageToast.show("Please fill in all fields!");
        } else if (isValidEmail(email) && password === passwordRepeat) {
          MessageToast.show("Registration successful!");
          setTimeout(
            function () {
              var oRouter = UIComponent.getRouterFor(this);
              oRouter.navTo("login");
            }.bind(this),
            1000
          );
        }
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
      onBackToHome: function () {
        var oRouter = UIComponent.getRouterFor(this);
        oRouter.navTo("login");
      },
    });
  }
);
