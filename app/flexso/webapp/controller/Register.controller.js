sap.ui.define(
  [
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/m/MessageToast",
    "sap/ui/core/UIComponent",
  ],
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
        var that = this;

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
          return;
        }

        if (password !== passwordRepeat) {
          MessageToast.show("Passwords do not match!");
          return;
        }

        if (
          [email, company, role, password, passwordRepeat].some(
            (field) => !field
          )
        ) {
          MessageToast.show("Please fill in all fields!");
          return;
        }

        jQuery.ajax({
          url: "http://localhost:4004/odata/v4/catalog/Users",
          method: "GET",
          data: { $filter: "email eq '" + email + "'" },
          success: function (response) {
            if (response && response.value && response.value.length > 0) {
              MessageToast.show("Registratie gefaald! Probeer opnieuw.");
            } else {
              var requestData = {
                name: email,
                email: email,
                company: company,
                role: role,
                password: password,
              };

              jQuery.ajax({
                url: "http://localhost:4004/odata/v4/catalog/Users",
                method: "POST",
                contentType: "application/json",
                data: JSON.stringify(requestData),
                success: function () {
                  MessageToast.show("Registration successful!");
                  setTimeout(function () {
                    var oRouter = UIComponent.getRouterFor(that);
                    oRouter.navTo("login");
                  }, 1000);
                },
                error: function (error) {
                  MessageToast.show("Registration failed: " + error);
                },
              });
            }
          },
          error: function (xhr, status, error) {
            // Handle error while checking user existence
            MessageToast.show("Error checking user existence: " + error);
          },
        });
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
