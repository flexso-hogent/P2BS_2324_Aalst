sap.ui.define(
  [
    "sap/ui/core/mvc/Controller",
    "sap/ui/core/UIComponent",
    "sap/ui/model/json/JSONModel",
  ],
  function (Controller, UIComponent, JSONModel) {
    "use strict";

    return Controller.extend("flexso.controller.Editevent", {
      onInit: function () {
        var Event = {
          eventID: localStorage.getItem("eventID"),
          title: localStorage.getItem("title"),
          startDate: localStorage.getItem("startDate"),
          endDate: localStorage.getItem("endDate"),
          location: localStorage.getItem("location"),
          description: localStorage.getItem("description"),
        };

        // Create a JSON model and set session data
        var eventModel = new JSONModel(Event);
        this.getView().setModel(eventModel, "eventModel");
      },

      onBackToHome: function () {
        var oRouter = UIComponent.getRouterFor(this);
        oRouter.navTo("home");
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

      onSavePress: function () {
        var eventID = this.getView()
          .getModel("eventModel")
          .getProperty("/eventID");
        var updatedEventData = {
          title: this.getView().getModel("eventModel").getProperty("/title"),
          startDate: this.getView()
            .getModel("eventModel")
            .getProperty("/startDate"),
          endDate: this.getView()
            .getModel("eventModel")
            .getProperty("/endDate"),

          description: this.getView()
            .getModel("eventModel")
            .getProperty("/description"),
        };

        var that = this;
        // Send the PATCH request
        $.ajax({
          url: "http://localhost:4004/odata/v4/catalog/Events(" + eventID + ")",
          type: "PATCH",
          contentType: "application/json",
          data: JSON.stringify(updatedEventData),
          success: function (response) {
            if (response) {
              MessageBox.success("Event updated successfully", {
                onClose: function () {
                  var oRouter = UIComponent.getRouterFor(that);
                  oRouter.navTo("overview", {}, true /*without history*/);
                  window.location.reload();
                },
              });
            }
          },

          error: function (xhr, status, error) {
            console.error("Error updating event:", error);
            MessageBox.error("Error updating event");
          },
        });
      },
    });
  }
);
