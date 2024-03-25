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

        // Assuming you are using jQuery.ajax for making AJAX requests
        jQuery.ajax({
          url: "http://localhost:4004/odata/v4/catalog/Users",
          method: "GET",
          data: { $filter: "email eq '" + username + "'" }, // Filter users by email
          success: function (response) {
            if (response && response.value && response.value.length > 0) {
              // User exists, check password
              var user = response.value[0];
              if (user.password === password) {
                MessageToast.show("Login successful");
                localStorage.setItem("stayLoggedIn", stayLoggedIn);

                // Navigate to home page
                setTimeout(
                  function () {
                    var oRouter = UIComponent.getRouterFor(this);
                    oRouter.navTo("profile");
                  }.bind(this),
                  1000
                );
              } else {
                MessageToast.show("Invalid credentials. Please try again.");
              }
            } else {
              // User does not exist
              MessageToast.show("User does not exist. Please register first.");
            }
          }.bind(this), // Bind the outer 'this' context to access UIComponent
          error: function (error) {
            // Handle error while checking user existence
            MessageToast.show("Error checking user existence: " + error);
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
      // onProfileButtonClick: function () {
      //   var oRouter = UIComponent.getRouterFor(this);
      //   oRouter.navTo("profile");
      // },
    });
  }
);
