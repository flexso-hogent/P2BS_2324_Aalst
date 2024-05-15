sap.ui.define(
  [
    "sap/ui/core/mvc/Controller",
    "sap/ui/core/UIComponent",
    "sap/ui/model/json/JSONModel",
    "sap/m/MessageBox",
  ],
  function (Controller, UIComponent, JSONModel, MessageBox) {
    "use strict";

    return Controller.extend("flexso.controller.Editevent", {
      onInit: function () {
        var oRouter = UIComponent.getRouterFor(this);
        oRouter
          .getRoute("Editevent")
          .attachPatternMatched(this._onObjectMatched, this);
      },

      _onObjectMatched: function (oEvent) {
        var sEventId = oEvent.getParameter("arguments").eventId;
        console.log("Raw Event ID from route:", sEventId);

        var iEventId = parseInt(sEventId, 10);
        console.log("Converted Event ID:", iEventId);

        if (isNaN(iEventId)) {
          console.error("Failed to convert Event ID to integer:", sEventId);
          MessageBox.error("Invalid Event ID provided.");
          return;
        }

        var Event = {
          eventID: iEventId,
          title: localStorage.getItem("title"),
          startDate: this.formatDate(localStorage.getItem("startDate")),
          endDate: this.formatDate(localStorage.getItem("endDate")),
          location: localStorage.getItem("location"),
          description: localStorage.getItem("description"),
        };

        var eventModel = new JSONModel(Event);
        this.getView().setModel(eventModel, "eventModel");
      },

      onSavePress: function () {
        var oBundle = this.getView().getModel("i18n").getResourceBundle();
        var sConfirmText2 = oBundle.getText("updateeventconfirm");
        var seventdelted2 = oBundle.getText("updatedevent");

        var eventModel = this.getView().getModel("eventModel");
        var eventID = eventModel.getProperty("/eventID");

        var updatedEventData = {
          name: eventModel.getProperty("/title"),
          startDate: this.formatDate(eventModel.getProperty("/startDate")),
          endDate: this.formatDate(eventModel.getProperty("/endDate")),
          location: eventModel.getProperty("/location"),
          description: eventModel.getProperty("/description"),
        };

        console.log(
          "Final data being sent to server:",
          JSON.stringify(updatedEventData)
        );

        var that = this;
        MessageBox.confirm(sConfirmText2, {
          title: "Confirm",
          actions: [MessageBox.Action.OK, MessageBox.Action.CANCEL],
          onClose: function (oAction) {
            if (oAction === MessageBox.Action.OK) {
              $.ajax({
                url:
                  "http://localhost:4004/odata/v4/catalog/Events(" +
                  eventID +
                  ")",
                type: "PATCH",
                contentType: "application/json",
                data: JSON.stringify(updatedEventData),
                success: function () {
                  MessageBox.success(seventdelted2, {
                    onClose: function () {
                      var oRouter = UIComponent.getRouterFor(that);
                      oRouter.navTo("overview", {});
                      window.location.reload();
                    },
                  });
                },
                error: function (xhr, status, error) {
                  console.error(
                    "Error updating event:",
                    xhr.responseText,
                    status,
                    error
                  );
                },
              });
            }
          },
        });
      },

      formatDate: function (dateString) {
        if (!dateString) {
          return null;
        }
        var date = new Date(dateString);
        var year = date.getFullYear();
        var month = String(date.getMonth() + 1).padStart(2, "0");
        var day = String(date.getDate()).padStart(2, "0");
        return year + "-" + month + "-" + day;
      },

      onDeletePress: function () {
        var oBundle = this.getView().getModel("i18n").getResourceBundle();
        var sConfirmText = oBundle.getText("deleteeventconfirm");
        var seventdelted = oBundle.getText("eventdeleted");
        var eventID = this.getView()
          .getModel("eventModel")
          .getProperty("/eventID");
        console.log("Event ID on delete:", eventID);

        var that = this;
        MessageBox.confirm(sConfirmText, {
          title: "Confirm",
          actions: [MessageBox.Action.OK, MessageBox.Action.CANCEL],
          onClose: function (oAction) {
            if (oAction === MessageBox.Action.OK) {
              $.ajax({
                url:
                  "http://localhost:4004/odata/v4/catalog/Events(" +
                  eventID +
                  ")",
                type: "DELETE",
                contentType: "application/json",
                success: function () {
                  MessageBox.success(seventdelted, {
                    onClose: function () {
                      var oRouter = UIComponent.getRouterFor(that);
                      oRouter.navTo("overview", {});
                      window.location.reload();
                    },
                  });
                },
                error: function (xhr, status, error) {
                  console.error("Error deleting event:", error);
                  MessageBox.error("Error deleting event");
                },
              });
            }
          },
        });
      },

      onBackToHome: function () {
        var oRouter = UIComponent.getRouterFor(this);
        oRouter.navTo("home");
      },

      onDropdownPress: function (oEvent) {
        var oButton = oEvent.getSource();
        var oPopover = this.getView().byId("popover");

        if (!oPopover) {
          oPopover = sap.ui.xmlfragment(
            this.getView().getId(),
            "flexso.fragment.Popover",
            this
          );
          this.getView().addDependent(oPopover);
        }
        oPopover.openBy(oButton);
      },

      onSwitchToEnglish: function () {
        sap.ui.getCore().getConfiguration().setLanguage("en");
        this.getView().getModel("i18n").refresh();
      },

      onSwitchToDutch: function () {
        sap.ui.getCore().getConfiguration().setLanguage("nl");
        this.getView().getModel("i18n").refresh();
      },

      onProfileButtonClick: function () {
        var oRouter = UIComponent.getRouterFor(this);
        oRouter.navTo("profile");
      },

      onLogoutPress: function () {
        var that = this;
        MessageBox.confirm(
          this.getView().getModel("i18n").getProperty("logout"),
          {
            title: "Confirm",
            onClose: function (oAction) {
              if (oAction === MessageBox.Action.OK) {
                localStorage.clear();
                var oRouter = UIComponent.getRouterFor(that);
                oRouter.navTo("login");
              }
            },
          }
        );
      },

      onBackPress: function () {
        var oRouter = UIComponent.getRouterFor(this);
        oRouter.navTo("overview", {}, true);
      },
    });
  }
);
