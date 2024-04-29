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
        var oEventName = localStorage.getItem("eventName");
        this.getView().byId("searchEvent").setValue(oEventName);
        this.getView().byId("eventComboBox").setValue(oEventName);
        sap.ui.getCore().applyChanges();

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
          oInput.setValueStateText(
            this.getView().getModel("i18n").getProperty("validinteger")
          );
        } else {
          // If valid, remove any validation state
          oInput.setValueState("None");
        }
      },
      onEditPress: function () {
        var oInput = this.getView().byId("eventComboBox");
        var bCurrentEditable = oInput.getEditable();
        oInput.setEditable(!bCurrentEditable);
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
            sap.MessageBox.error(
              this.getView().getModel("i18n").getProperty("fetchdate") + error
            );
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
          sap.m.MessageBox.error(
            this.getView().getModel("i18n").getProperty("feedbackSelectEvent")
          );
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
                // Get the i18n model and retrieve the error message
                var i18nModel = that.getView().getModel("i18n");
                var errorMessage = i18nModel.getProperty(
                  "feedbackCreateSession"
                );
                // Show the error message
                sap.m.MessageBox.error(errorMessage);
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
                MessageToast.show(
                  this.getView().getModel("i18n").getProperty("sessieCreate")
                );
                setTimeout(function () {
                  var oRouter = sap.ui.core.UIComponent.getRouterFor(that);
                  oRouter.navTo("home");
                }, 1000);
              },
              error: function () {
                sap.MessageBox.error(
                  this.getView()
                    .getModel("i18n")
                    .getProperty("sessieCreateError")
                );
              },
            });
          },
          error: function () {
            sap.MessageBox.error(
              this.getView()
                .getModel("i18n")
                .getProperty("sessieCreateFetchError")
            );
          },
        });
      },
      onSearchLiveChange: function (oEvent) {
        var sQuery = oEvent.getParameter("newValue");
        this.filterEvents(sQuery);
      },

      filterEvents: function (sQuery) {
        var oTable = this.getView().byId("_IDGenTable1");
        var oBinding = oTable.getBinding("items");
        var oFilter;

        if (sQuery) {
          oFilter = new sap.ui.model.Filter(
            "Name",
            sap.ui.model.FilterOperator.Contains,
            sQuery
          );
        }

        oBinding.filter(oFilter);
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
