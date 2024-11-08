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
        this.getView().byId("searchEvent").setValue(oEventName);

        var oDeviceModel = new sap.ui.model.json.JSONModel({
          isTouch: sap.ui.Device.support.touch,
          isNoTouch: !sap.ui.Device.support.touch,
          isPhone: sap.ui.Device.system.phone,
          isNoPhone: !sap.ui.Device.system.phone,
        });
        oDeviceModel.setDefaultBindingMode("OneWay");
        this.getView().setModel(oDeviceModel, "device");

        var oEventName = localStorage.getItem("eventName");
        var oSearchEvent = this.getView().byId("searchEvent");
        oSearchEvent.setValue(oEventName);

        sap.ui.getCore().applyChanges();

        var oTable = this.getView().byId("_IDGenTable1");
        if (oEventName && oTable) {
          oTable.setVisible(false);
        }

        sap.ui.getCore().applyChanges();

        var oRootPath = jQuery.sap.getModulePath(
          "flexso",
          "/images/Flexso.png"
        );

        var oSearchField = this.getView().byId("searchEvent");
        if (oSearchField) {
          oSearchField.attachSearch(
            function (oEvent) {
              var sQuery = oEvent.getParameter("query");
              if (!sQuery) {
                var oTable = this.getView().byId("_IDGenTable1");
                if (oTable) {
                  oTable.setVisible(true);
                }
              }
            }.bind(this)
          );
        }

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
      onItemPress: function (oEvent) {
        var oClickedItem = oEvent.getParameter("listItem");
        var oClickedItemContext = oClickedItem.getBindingContext("eventModel");
        var sClickedItemName = oClickedItemContext.getProperty("Name");

        var oComboBox = this.getView().byId("searchEvent");
        if (oComboBox) {
          oComboBox.setValue(sClickedItemName);
        }

        // Hide the table
        var oTable = this.getView().byId("_IDGenTable1"); // replace "yourTableId" with the actual id of your table
        if (oTable) {
          oTable.setVisible(false);
        }
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
        var that = this; // Sla de huidige scope op in een variabele

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
            that.getView().setModel(eventModel, "eventModel"); // Gebruik 'that' om de juiste scope te behouden
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

        // Get selected event data
        var sSelectedEvent = oView.byId("searchEvent").getValue();
        var oTable = oView.byId("_IDGenTable1");
        var oSelectedItem = oTable.getSelectedItem();
        var oEventModel = oView.getModel("eventModel");

        var eventID, oEvent;
        if (oSelectedItem) {
          eventID = oSelectedItem
            .getBindingContext("eventModel")
            .getProperty("eventID");
          oEvent = oEventModel.getProperty("/").find(function (event) {
            return event.eventID == eventID;
          });
        } else if (sSelectedEvent) {
          oEvent = oEventModel.getProperty("/").find(function (event) {
            return event.Name === sSelectedEvent;
          });
          if (oEvent) {
            eventID = oEvent.eventID;
          }
        }

        if (!eventID || !oEvent) {
          sap.m.MessageBox.error(
            this.getView().getModel("i18n").getProperty("feedbackSelectEvent")
          );
          return;
        }

        // Convert eventID to string
        eventID = eventID.toString();

        // Validate start date and end date
        var startDate = oView.byId("_IDGenDatePicker1").getValue();
        var endDate = oView.byId("_IDGenDatePicker2").getValue();
        var formattedStartDate = this.formatDate(startDate);
        var formattedEndDate = this.formatDate(endDate);

        if (!startDate || !endDate) {
          sap.m.MessageBox.error("Please select both start date and end date.");
          return;
        }

        // Check if start date is before end date
        if (new Date(formattedStartDate) > new Date(formattedEndDate)) {
          sap.m.MessageBox.error(
            this.getView().getModel("i18n").getProperty("feedbackDate")
          );
          return;
        }

        // Additional validation: session dates must be within the event dates
        if (
          new Date(formattedStartDate) <
            new Date(this.formatDate(oEvent.SDate)) ||
          new Date(formattedEndDate) > new Date(this.formatDate(oEvent.EDate))
        ) {
          sap.m.MessageBox.error(
            this.getView().getModel("i18n").getProperty("sessionDateError") +
              " " +
              this.formatDate(oEvent.SDate) +
              " " +
              this.getView().getModel("i18n").getProperty("between") +
              " " +
              this.formatDate(oEvent.EDate)
          );
          return;
        }

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
              naam: oView.byId("_IDGenInput").getValue(),
              speaker: oView.byId("_IDGenInput4").getValue() || "", // Making speaker field optional
              totalSeats: parseInt(oView.byId("_IDGenInput5").getValue()),
              eventID: eventID, // Use the selected event ID as string
            };

            // Post the new session data to the backend
            jQuery.ajax({
              url: "http://localhost:4004/odata/v4/catalog/Sessions",
              method: "POST",
              contentType: "application/json",
              data: JSON.stringify(oSessionData),
              success: function () {
                MessageToast.show(
                  that.getView().getModel("i18n").getProperty("sessieCreate")
                );
                setTimeout(function () {
                  var oRouter = sap.ui.core.UIComponent.getRouterFor(that);
                  oRouter.navTo("home");
                }, 1000);
              },
              error: function () {
                sap.MessageBox.error(
                  that
                    .getView()
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
