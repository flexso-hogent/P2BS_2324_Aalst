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
              username
            ),
          ],
          success: function (data) {
            if (data.results && data.results.length > 0) {
              var user = data.results[0];
              if (user.password === password) {
                MessageToast.show("Login successful");
                localStorage.setItem("stayLoggedIn", stayLoggedIn);

                setTimeout(
                  function () {
                    var oRouter = UIComponent.getRouterFor(this);
                    oRouter.navTo("profile");
                  }.bind(this),
                  1000
                );
              } else {
                MessageToast.show(
                  "User or password is wrong. Please try again."
                );
              }
            } else {
              MessageToast.show(
                "User or password is wrong. Please register first."
              );
            }
          }.bind(this),
          error: function (error) {
            MessageToast.show(
              "Error checking user existence: " + error.responseText
            );
          },
        });
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
    });
  }
);
