sap.ui.define(
  [
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/m/MessageToast",
    "sap/ui/core/UIComponent",
    "sap/ui/model/odata/v2/ODataModel",
  ],
  function (Controller, JSONModel, MessageToast, UIComponent, ODataModel) {
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
        // var bdate = this.getView().byId("birthdateInput").getValue();
        var street = this.getView().byId("streetInput").getValue();
        var hnumber = this.getView().byId("hnumberInput").getValue();
        var city = this.getView().byId("cityInput").getValue();
        var country = this.getView().byId("countryInput").getValue();
        var zip = this.getView().byId("zipInput").getValue();
        var phone = this.getView().byId("phoneInput").getValue();
        var gender = this.getView().byId("genderInput").getSelectedKey();

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

        var oDataModel = new ODataModel(
          "http://localhost:4004/odata/v2/catalog/",
          {
            json: true,
          }
        );

        oDataModel.read("/Users", {
          filters: [
            new sap.ui.model.Filter(
              "email",
              sap.ui.model.FilterOperator.EQ,
              email
            ),
          ],
          success: function (data) {
            if (data.results && data.results.length > 0) {
              MessageToast.show("Registration failed! Please try again.");
            } else {
              var requestData = {
                email: email,
                company: company,
                role: role,
                password: password,
                // bdate: bdate,
                street: street,
                hnumber: hnumber,
                city: city,
                country: country,
                zip: zip,
                phone: phone,
                gender: gender,
              };
              oDataModel.create("/Users", requestData, {
                success: function () {
                  MessageToast.show("Registration successful!");
                  setTimeout(function () {
                    var oRouter = UIComponent.getRouterFor(that);
                    oRouter.navTo("login");
                  }, 1000);
                },
                error: function (error) {
                  MessageToast.show(
                    "Registration failed: " + error.responseText
                  );
                },
              });
            }
          },
          error: function (xhr, status, error) {
            MessageToast.show(
              "Error checking user existence: " + error.responseText
            );
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
