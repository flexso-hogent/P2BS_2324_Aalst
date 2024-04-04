sap.ui.define(
  [
    "sap/ui/core/mvc/Controller",
    "sap/m/MessageToast",
    "sap/ui/core/UIComponent",
  ],
  function (Controller, MessageToast, UIComponent) {
    "use strict";

    return Controller.extend("flexso.controller.UpdateProfile", {
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
        if (sRouteName === "updateProfile") {
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
                company: userData.company,
                street: userData.street,
                hnumber: userData.hnumber,
                city: userData.city,
                country: userData.country,
                zip: userData.zip,
                phone: userData.phone,
                gender: userData.gender,
                bdate: userData.bdate,
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
        var updatedUserData = {
          email: this.getView().byId("emailInput").getValue(),
          company: this.getView().byId("companyInput").getValue(),
          street: this.getView().byId("streetInput").getValue(),
          hnumber: parseInt(this.getView().byId("hnumberInput").getValue()),
          city: this.getView().byId("cityInput").getValue(),
          country: this.getView().byId("countryInput").getValue(),
          zip: parseInt(this.getView().byId("zipInput").getValue()),
          phone: parseInt(this.getView().byId("phoneInput").getValue()),
          gender: this.getView().byId("genderInput").getSelectedKey(),
          bdate: this.getView()
            .byId("bdateInput")
            .getDateValue()
            .toISOString()
            .split("T")[0],
        };

        var userId;
        $.ajax({
          url: "http://localhost:4004/odata/v4/catalog/Users",
          type: "GET",
          data: { $filter: "email eq '" + updatedUserData.email + "'" },
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
            setTimeout(function () {
              that.loadUserData();

              // Navigate back to the profile page after the delay
              var oRouter = UIComponent.getRouterFor(that);
              oRouter.navTo("profile");
            }, 1500); // 1.5 seconds delay
          },
          error: function (xhr, status, error) {
            MessageToast.show("Failed to update profile: " + error);
          },
        });
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
      onBackToHome: function () {
        var oRouter = UIComponent.getRouterFor(this);
        oRouter.navTo("home");
      },

      onProfileButtonClick: function () {
        var oRouter = UIComponent.getRouterFor(this);
        oRouter.navTo("profile");
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
      onDropdownPress: function (oEvent) {
        var oButton = oEvent.getSource();
        var oPopover = this.getView().byId("popover");
        if (!oPopover.isOpen()) {
          oPopover.openBy(oButton);
        } else {
          oPopover.close();
        }
      },
    });
  }
);
