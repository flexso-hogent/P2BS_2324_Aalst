sap.ui.define(
  [
    "sap/ui/core/mvc/Controller",
    "sap/ui/core/format/DateFormat",
    "sap/m/MessageToast",
    "sap/ui/core/UIComponent",
  ],
  function (Controller, DateFormat, MessageToast, UIComponent) {
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
        var oImageModel = new sap.ui.model.json.JSONModel({
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
        var loggedInUserEmail = localStorage.getItem("email");
        if (!loggedInUserEmail) {
          MessageToast.show("Logged-in user email not found.");
          return;
        }
        var userDataUrl =
          "http://localhost:4004/odata/v4/catalog/Users?$filter=email eq '" +
          loggedInUserEmail +
          "'";
        $.ajax({
          url: userDataUrl,
          type: "GET",
          success: function (data) {
            if (data.value.length > 0) {
              var userData = data.value[0];
              var oUserDataModel = new sap.ui.model.json.JSONModel({
                email: userData.email,
                firstname: userData.firstname,
                lastname: userData.lastname,
                company: userData.company,
                role: userData.role,
                userID: userData.userID,
                street: userData.street,
                hnumber: userData.hnumber,
                city: userData.city,
                country: userData.country,
                zip: userData.zip,
                phone: userData.phone,
                gender: userData.gender,
                birthdate: userData.bdate,
              });
              that.getView().setModel(oUserDataModel, "userInfo");
            } else {
              MessageToast.show("User data not found.");
            }
          },
          error: function (xhr, status, error) {
            MessageToast.show("Failed to fetch user data: " + error);
          },
        });
      },

      onUpdateProfilePress: function () {
        var that = this;
        var updatedEmail = this.getView().byId("emailInput").getValue();
        var updatedCompany = this.getView().byId("companyInput").getValue();
        var updatedRole = this.getView().byId("roleInput").getValue();
        var updatedStreet = this.getView().byId("streetInput").getValue();
        var updatedHnumber = parseInt(
          this.getView().byId("hnumberInput").getValue()
        );
        var updatedCity = this.getView().byId("cityInput").getValue();
        var updatedCountry = this.getView().byId("countryInput").getValue();
        var updatedZip = parseInt(this.getView().byId("zipInput").getValue());
        var updatedPhone = parseInt(
          this.getView().byId("phoneInput").getValue()
        );
        var updatedGender = this.getView().byId("genderInput").getSelectedKey();
        var dialog = new sap.m.Dialog({
          title: "Confirm",
          type: "Message",
          content: new sap.m.Text({
            text: "Are you sure you want to update your profile?",
          }),
          beginButton: new sap.m.Button({
            text: "Yes",
            press: function () {
              var updatedUserData = {
                email: updatedEmail,
                company: updatedCompany,
                role: updatedRole,
                street: updatedStreet,
                hnumber: updatedHnumber,
                city: updatedCity,
                country: updatedCountry,
                zip: updatedZip,
                phone: updatedPhone,
                gender: updatedGender,
                birthdate: updatedBdate,
              };
              var userId;
              $.ajax({
                url: "http://localhost:4004/odata/v4/catalog/Users",
                type: "GET",
                data: { $filter: "email eq '" + updatedEmail + "'" },
                async: false,
                success: function (data) {
                  if (data.value.length > 0) {
                    userId = data.value[0].userID;
                  } else {
                    MessageToast.show(
                      "User not found with the provided email address"
                    );
                    return;
                  }
                },
                error: function (xhr, status, error) {
                  MessageToast.show("Failed to retrieve user data: " + error);
                  return;
                },
              });
              var updateUserUrl =
                "http://localhost:4004/odata/v4/catalog/Users(" + userId + ")";
              $.ajax({
                url: updateUserUrl,
                type: "PATCH",
                contentType: "application/json",
                data: JSON.stringify(updatedUserData),
                success: function () {
                  MessageToast.show("Profile updated successfully");
                  that.loadUserData();
                },
                error: function (xhr, status, error) {
                  MessageToast.show("Failed to update profile: " + error);
                },
              });
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

      formatDate: function (date) {
        if (!date) {
          return null;
        }
        var oDateFormat = sap.ui.core.format.DateFormat.getDateInstance({
          pattern: "dd MMM yyyy",
        });
        return oDateFormat.format(date);
      },

      onBackToHome: function () {
        var oRouter = UIComponent.getRouterFor(this);
        oRouter.navTo("home");
      },

      onFeedbackPress: function () {
        var oRouter = UIComponent.getRouterFor(this);
        oRouter.navTo("feedback");
      },

      onDropdownPress: function (oEvent) {
        var oButton = oEvent.getSource();
        var oPopover = this.getView().byId("popover");
        if (!oPopover.isOpen()) {
          oPopover.openBy(oButton);
        } else {
          oPopover.close();
        }
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
