sap.ui.define(
  [
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/m/MessageToast",
    "sap/ui/core/UIComponent",
  ],
  function (Controller, JSONModel, MessageToast, UIComponent) {
    "use strict";

    return Controller.extend("flexso.controller.Profile", {
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

        var oRouter = UIComponent.getRouterFor(this);
        oRouter.attachRoutePatternMatched(this.onRoutePatternMatched, this);
      },

      onRoutePatternMatched: function (oEvent) {
        var sRouteName = oEvent.getParameter("name");
        if (sRouteName === "profile") {
          this.loadUserData();
        }
      },

      loadUserData: function () {
        var that = this;

        // Retrieve logged-in user's email from local storage
        var loggedInUserEmail = localStorage.getItem("email");

        if (!loggedInUserEmail) {
          MessageToast.show("Logged-in user email not found.");
          return;
        }

        var oUserDataModel = new JSONModel({
          email: localStorage.getItem("email"),
          company: localStorage.getItem("company"),
          role: localStorage.getItem("role"),
          userID: localStorage.getItem("userID"),
        });

        that.getView().setModel(oUserDataModel, "userInfo");
      },

      onUpdateProfilePress: function () {
        var that = this;
        var updatedEmail = this.getView().byId("emailInput").getValue();
        var updatedCompany = this.getView().byId("companyInput").getValue();
        var updatedRole = this.getView().byId("roleInput").getValue();

        // Confirmation dialog
        var dialog = new sap.m.Dialog({
          title: "Confirm",
          type: "Message",
          content: new sap.m.Text({
            text: "Are you sure you want to update your profile?",
          }),
          beginButton: new sap.m.Button({
            text: "Yes",
            press: function () {
              // Update user information in local storage
              localStorage.setItem("email", updatedEmail);
              localStorage.setItem("company", updatedCompany);
              localStorage.setItem("role", updatedRole);

              MessageToast.show("Profile updated successfully");

              // Refresh the user data in the view
              that.loadUserData();

              dialog.close();
            },
          }),
          endButton: new sap.m.Button({
            text: "No",
            press: function () {
              dialog.close();
            },
          }),
          afterClose: function () {
            dialog.destroy();
          },
        });

        dialog.open();
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
        oRouter.navTo("home");
      },

      onFeedbackPress: function () {
        var oRouter = UIComponent.getRouterFor(this);
        oRouter.navTo("feedback");
      },
      onLogoutPress: function () {
        var that = this;
        sap.m.MessageBox.confirm("Are you sure you want to log out?", {
          title: "Confirm",
          onClose: function (oAction) {
            if (oAction === sap.m.MessageBox.Action.OK) {
              localStorage.clear();
              var oRouter = UIComponent.getRouterFor(that);
              oRouter.navTo("login");
            }
          },
        });
      },
    });
  }
);
