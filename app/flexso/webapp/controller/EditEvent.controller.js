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
        console.log("Raw Event ID from route:", sEventId); // Ensure this log is showing the expected value.

        // Convert to integer, log the result to debug conversion issues
        var iEventId = parseInt(sEventId, 10);
        console.log("Converted Event ID:", iEventId);

        if (isNaN(iEventId)) {
          console.error("Failed to convert Event ID to integer:", sEventId);
          MessageBox.error("Invalid Event ID provided.");
          return; // Stop further execution if ID is not valid
        }

        var Event = {
          eventID: iEventId,
          title: localStorage.getItem("title"),
          startDate: localStorage.getItem("startDate"),
          endDate: localStorage.getItem("endDate"),
          location: localStorage.getItem("location"),
          description: localStorage.getItem("description"),
        };

        var eventModel = new JSONModel(Event);
        this.getView().setModel(eventModel, "eventModel");
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
          location: this.getView()
            .getModel("eventModel")
            .getProperty("/location"),
          description: this.getView()
            .getModel("eventModel")
            .getProperty("/description"),
        };

        console.log(
          "Final data being sent to server:",
          JSON.stringify(updatedEventData)
        );

        var that = this;
        $.ajax({
          url: "http://localhost:4004/odata/v4/catalog/Events(" + eventID + ")",
          type: "PATCH",
          contentType: "application/json",
          data: JSON.stringify({
            name: updatedEventData.title,
            startDate: updatedEventData.startDate,
            endDate: updatedEventData.endDate,
            location: updatedEventData.location,
            description: updatedEventData.description,
          }),
          success: function (response) {
            console.log("Event updated successfully:", response);
            //laat me navigeren naar de overview pagina
            var oRouter = UIComponent.getRouterFor(that);
            oRouter.navTo("overview", {});
            window.location.reload();

            // Additional success handling
          },
          error: function (xhr, status, error) {
            console.error(
              "Error updating event:",
              xhr.responseText,
              status,
              error
            );
            // Additional error handling
          },
        });
      },

      formatDate: function (dateString) {
        var date = new Date(dateString);
        var year = date.getFullYear();
        var month = String(date.getMonth() + 1).padStart(2, "0");
        var day = String(date.getDate()).padStart(2, "0");
        return year + "-" + month + "-" + day;
      },

      onDeletePress: function () {
        var eventID = this.getView()
          .getModel("eventModel")
          .getProperty("/eventID");
        console.log("Event ID on delete:", eventID); // Debugging line to check eventID
        var that = this;
        MessageBox.confirm("Are you sure you want to delete this event?", {
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
                  MessageBox.success("Event deleted successfully", {
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
