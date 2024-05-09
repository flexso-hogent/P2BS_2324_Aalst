sap.ui.define(
  [
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/ui/core/UIComponent",
    "sap/m/MessageBox",
    "sap/ui/core/routing/History",
    "sap/m/MessageToast",
  ],
  function (
    Controller,
    JSONModel,
    UIComponent,
    MessageBox,
    History,
    MessageToast
  ) {
    "use strict";

    return Controller.extend("flexso.controller.EditSession", {
      onInit: function () {
        // Retrieve session data from local storage
        var sessionData = {
          sessionID: localStorage.getItem("sessionID"),
          title: localStorage.getItem("title"),
          startDate: localStorage.getItem("startDate"),
          endDate: localStorage.getItem("endDate"),
          startTime: localStorage.getItem("startTime"),
          endTime: localStorage.getItem("endTime"),
          room: localStorage.getItem("room"),
          speaker: localStorage.getItem("speaker"),
          totalSeats: localStorage.getItem("totalSeats"),
          description: localStorage.getItem("description"),
          naam: localStorage.getItem("naam"),
        };

        // Create a JSON model and set session data
        var sessionModel = new JSONModel(sessionData);
        this.getView().setModel(sessionModel, "sessionModel");
      },
      onSavePress: function () {
        var sessionID = this.getView()
          .getModel("sessionModel")
          .getProperty("/sessionID");
        var updatedSessionData = {
          title: this.getView().getModel("sessionModel").getProperty("/title"),
          startDate: this.getView()
            .getModel("sessionModel")
            .getProperty("/startDate"),
          endDate: this.getView()
            .getModel("sessionModel")
            .getProperty("/endDate"),
          startTime: this.getView()
            .getModel("sessionModel")
            .getProperty("/startTime"),
          endTime: this.getView()
            .getModel("sessionModel")
            .getProperty("/endTime"),
          room: this.getView().getModel("sessionModel").getProperty("/room"),
          description: this.getView()
            .getModel("sessionModel")
            .getProperty("/description"),
          speaker: this.getView()
            .getModel("sessionModel")
            .getProperty("/speaker"),
          naam: this.getView().getModel("sessionModel").getProperty("/naam"),
          totalSeats: parseInt(
            this.getView().getModel("sessionModel").getProperty("/totalSeats"),
            10
          ),
          eventID: this.getView()
            .getModel("sessionModel")
            .getProperty("/eventID"),
        };

        var that = this;
        // Send the PATCH request
        $.ajax({
          url:
            "http://localhost:4004/odata/v4/catalog/Sessions(" +
            sessionID +
            ")",
          type: "PATCH",
          contentType: "application/json",
          data: JSON.stringify(updatedSessionData),
          success: function (response) {
            if (response) {
              MessageBox.success("Session updated successfully", {
                onClose: function () {
                  var oRouter = UIComponent.getRouterFor(that);
                  oRouter.navTo("overview", {}, true /*without history*/);
                  window.location.reload();
                },
              });
            }
          },

          // setTimeout(
          //   function () {
          //     var oRouter = UIComponent.getRouterFor(that);
          //     oRouter.navTo("overview", {}, true /*without history*/);
          //   }.bind(that),
          //   1500
          // );

          error: function (xhr, status, error) {
            console.error("Error updating session:", error);
            MessageBox.error("Error updating session");
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
      onProfileButtonClick: function () {
        var oRouter = UIComponent.getRouterFor(this);
        oRouter.navTo("profile");
      },
      onLogoutPress: function () {
        var that = this;
        sap.m.MessageBox.confirm(
          this.getView().getModel("i18n").getProperty("logout"),
          {
            title: "Confirm",
            onClose: function (oAction) {
              if (oAction === sap.m.MessageBox.Action.OK) {
                localStorage.clear();
                var oRouter = UIComponent.getRouterFor(that);
                oRouter.navTo("login");
              }
            },
          }
        );

        sap.m.MessageBox.confirm(
          this.getView().getModel("i18n").getProperty("logout"),
          {
            title: "Confirm",
            onClose: function (oAction) {
              if (oAction === sap.m.MessageBox.Action.OK) {
                localStorage.clear();
                var oRouter = UIComponent.getRouterFor(that);
                oRouter.navTo("login");
              }
            },
          }
        );
      },
    });
  }
);
