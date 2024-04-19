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
      },

      onTotalSeatsChange: function (oEvent) {
        var oInput = oEvent.getSource();
        var sValue = oInput.getValue();

        // Validate if the input is an integer
        if (!Number.isInteger(Number(sValue))) {
          // If not an integer, reset the value or show an error message
          oInput.setValueState("Error");
          oInput.setValueStateText("Please enter a valid integer value.");
        } else {
          // If valid, remove any validation state
          oInput.setValueState("None");
        }
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
            sap.MessageBox.error("Error fetching data: " + error);
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
        var that = this;

        // Get selected event data from the select box
        var selectedEvent = oView.byId("eventSelect").getSelectedItem();

        if (!selectedEvent) {
          sap.m.MessageBox.error("Please select an event.");
          return;
        }

        // Extract the event ID from the selected event
        var eventID = selectedEvent
          .getBindingContext("eventModel")
          .getProperty("eventID");

        // Proceed with session creation
        // Fetch the latest session ID from the backend
        jQuery.ajax({
          url: "http://localhost:4004/odata/v4/catalog/Sessions?$orderby=sessionID desc&$top=1",
          method: "GET",
          success: function (data) {
            var latestSessionID =
              data.value.length > 0 ? data.value[0].sessionID : 0;
            var newSessionID = latestSessionID + 1;

            // Prepare session data
            var oSessionData = {
              sessionID: newSessionID,
              title: oView.byId("_IDGenInput1").getValue(),
              startDate: that.formatDate(
                oView.byId("_IDGenDatePicker1").getValue()
              ),
              endDate: that.formatDate(
                oView.byId("_IDGenDatePicker2").getValue()
              ),
              startTime: that.formatTime(
                oView.byId("_IDGenTimePicker1").getValue()
              ),
              endTime: that.formatTime(
                oView.byId("_IDGenTimePicker2").getValue()
              ),
              room: oView.byId("_IDGenInput2").getValue(),
              description: oView.byId("_IDGenInput3").getValue(),
              speaker: oView.byId("_IDGenInput4").getValue(),
              totalSeats: parseInt(oView.byId("_IDGenInput5").getValue()),
              eventID: eventID, // Use the selected event ID
            };

            // Check if any required field is empty
            for (var key in oSessionData) {
              if (oSessionData.hasOwnProperty(key) && !oSessionData[key]) {
                sap.m.MessageBox.error("Please fill in all fields correctly.");
                return; // Exit the function if any required field is empty
              }
            }
            // Post the new session data to the backend
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
                sap.MessageBox.error("Error creating session");
              },
            });
          },
          error: function () {
            sap.MessageBox.error("Error fetching session data");
          },
        });
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
