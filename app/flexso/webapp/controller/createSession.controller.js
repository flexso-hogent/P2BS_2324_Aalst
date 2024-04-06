sap.ui.define(
  [
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/m/MessageToast",
    "sap/ui/core/UIComponent",
  ],
  function (Controller, JSONModel, MessageToast, UIComponent) {
    "use strict";

    return Controller.extend("flexso.controller.CreateSession", {
      onInit: function () {
        this.loadData();
      },

      loadData: function () {
        var that = this;
        jQuery.ajax({
          url: "http://localhost:4004/odata/v4/catalog/Events",
          dataType: "json",
          success: function (data) {
            var filteredEvents = data.value.map(function (event) {
              return {
                eventID: event.eventID,
                Name: event.name,
                SDate: event.startDate,
                EDate: event.endDate,
                location: event.location,
                description: event.description,
              };
            });

            var eventModel = new JSONModel(filteredEvents);
            that.getView().setModel(eventModel, "eventModel");
          },
          error: function (xhr, status, error) {
            MessageToast.show("Error fetching data: " + error);
          },
        });
      },

      formatDate: function (dateString) {
        var date = new Date(dateString);
        var year = date.getFullYear();
        var month = String(date.getMonth() + 1).padStart(2, "0");
        var day = String(date.getDate()).padStart(2, "0");
        var formattedDate = year + "-" + month + "-" + day;
        return formattedDate;
      },

      onCreateSession: function () {
        var oView = this.getView();
        var oSessionData = {
          sessionID: 0,
          title: oView.byId("_IDGenInput1").getValue(),
          startDate: this.formatDate(
            oView.byId("_IDGenDatePicker1").getValue()
          ),
          endDate: this.formatDate(oView.byId("_IDGenDatePicker2").getValue()),
          startTime: this.formatTime(
            oView.byId("_IDGenTimePicker1").getValue()
          ),
          endTime: this.formatTime(oView.byId("_IDGenTimePicker2").getValue()),
          room: oView.byId("_IDGenInput2").getValue(),
          description: oView.byId("_IDGenInput3").getValue(),
          speaker: oView.byId("_IDGenInput4").getValue(),
          totalSeats: parseInt(oView.byId("_IDGenInput5").getValue()), // Parse totalSeats to ensure it's a number
          eventID: this.generateGUID(), // Generate a new GUID
        };

        var that = this; // Preserve reference to the controller

        jQuery.ajax({
          url: "http://localhost:4004/odata/v4/catalog/Sessions",
          method: "POST",
          contentType: "application/json",
          data: JSON.stringify(oSessionData),
          success: function () {
            MessageToast.show("Session creation successful!");
            setTimeout(function () {
              var oRouter = sap.ui.core.UIComponent.getRouterFor(that);
              oRouter.navTo("home");
            }, 1000);
          },
          error: function () {
            MessageToast.show("Error creating session!");
          },
        });
      },

      generateGUID: function () {
        // Function to generate a new GUID
        var guid = "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(
          /[xy]/g,
          function (c) {
            var r = (Math.random() * 16) | 0,
              v = c == "x" ? r : (r & 0x3) | 0x8;
            return v.toString(16);
          }
        );
        return guid;
      },

      formatTime: function (timeString) {
        // Assuming timeString is in format "hh:mm AM/PM"
        var parts = timeString.split(" ");
        var timeParts = parts[0].split(":");
        var hour = parseInt(timeParts[0]);
        var minute = parseInt(timeParts[1]);
        var period = parts[1];

        if (period === "PM" && hour < 12) {
          hour += 12;
        } else if (period === "AM" && hour === 12) {
          hour = 0;
        }

        var formattedTime =
          hour.toString().padStart(2, "0") + ":" + timeParts[1] + ":00";
        return formattedTime;
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

      onDropdownPress: function (oEvent) {
        var oButton = oEvent.getSource();
        var oPopover = this.getView().byId("popover");

        if (!oPopover.isOpen()) {
          oPopover.openBy(oButton);
        } else {
          oPopover.close();
        }
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
    });
  }
);
