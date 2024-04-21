sap.ui.define(
  [
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/m/MessageToast",
  ],
  function (Controller, JSONModel, MessageToast) {
    "use strict";

    return Controller.extend("flexso.controller.AllSessions", {
      onInit: function () {
        // Fetch all registered sessions data
        this.fetchAllRegisteredSessions();
      },
      fetchAllRegisteredSessions: function () {
        // Get the logged-in user's email address from localStorage
        var userEmail = localStorage.getItem("email");

        // Check if user email is available
        if (!userEmail) {
          MessageToast.show("User email not found in localStorage");
          return;
        }

        // Construct the service URL with the filter
        var sessionServiceURL =
          "http://localhost:4004/odata/v4/catalog/registerdOnASession?$filter=email eq '" +
          userEmail +
          "'";

        // Make an AJAX request to fetch the registered sessions data
        $.ajax({
          url: sessionServiceURL,
          type: "GET",
          success: function (data) {
            // Check if data is available
            if (data && data.value && data.value.length > 0) {
              // Reverse the fetched sessions data
              var reversedData = data.value.reverse();
              // Update the model with the reversed fetched sessions for the logged-in user
              var oModel = new JSONModel(reversedData);
              this.getView().setModel(oModel, "allSessionsModel");
            } else {
              // No sessions found for the logged-in user
              MessageToast.show(
                "No registered sessions found for the logged-in user"
              );
            }
          }.bind(this),
          error: function (xhr, status, error) {
            // Handle error case
            MessageToast.show(
              "Error fetching registered sessions data: " + error
            );
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
      onProfileButtonClick: function () {
        var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
        oRouter.navTo("profile");
      },
      onLogoutPress: function () {
        var that = this;
        sap.m.MessageBox.confirm("Are you sure you want to log out?", {
          title: "Confirm",
          onClose: function (oAction) {
            if (oAction === sap.m.MessageBox.Action.OK) {
              localStorage.clear();
              var oRouter = sap.ui.core.UIComponent.getRouterFor(that);
              oRouter.navTo("login");
            }
          },
        });
      },

      onBackToHome: function () {
        var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
        oRouter.navTo("home");
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

      onSearch: function (oEvent) {
        var sQuery = oEvent.getParameter("newValue");
        var oFilter = new sap.ui.model.Filter({
          filters: [
            new sap.ui.model.Filter(
              "title",
              sap.ui.model.FilterOperator.Contains,
              sQuery
            ),
            new sap.ui.model.Filter(
              "speaker",
              sap.ui.model.FilterOperator.Contains,
              sQuery
            ),
            new sap.ui.model.Filter(
              "room",
              sap.ui.model.FilterOperator.Contains,
              sQuery
            ),
            new sap.ui.model.Filter(
              "startDate",
              sap.ui.model.FilterOperator.Contains,
              sQuery
            ),
            new sap.ui.model.Filter(
              "endDate",
              sap.ui.model.FilterOperator.Contains,
              sQuery
            ),
            new sap.ui.model.Filter(
              "startTime",
              sap.ui.model.FilterOperator.Contains,
              sQuery
            ),
            new sap.ui.model.Filter(
              "endTime",
              sap.ui.model.FilterOperator.Contains,
              sQuery
            ),
          ],
          and: false,
        });
        var oBinding = this.getView().byId("_IDGenTable1").getBinding("items");
        oBinding.filter([oFilter]);
      },

      onExportToOutlookPress: function (oEvent) {
        var oSessionData = oEvent
          .getSource()
          .getBindingContext("allSessionsModel")
          .getObject(); // Get session data from the button's context

        // Generate ICS content for the selected session
        var icalContent = this.generateICalContent([oSessionData]);

        // Trigger file download with the generated ICS content
        this.downloadICSFile(icalContent, "calendar_event.ics");
      },

      // Generate ICS content from session data
      generateICalContent: function (sessions) {
        var icalContent = "BEGIN:VCALENDAR\r\nVERSION:2.0\r\n";

        sessions.forEach(function (session) {
          icalContent += "BEGIN:VEVENT\r\n";
          icalContent += "SUMMARY:" + session.title + "\r\n";
          icalContent +=
            "DTSTART:" + session.startDate + "T" + session.startTime + "\r\n";
          icalContent +=
            "DTEND:" + session.endDate + "T" + session.endTime + "\r\n";
          // Add description
          icalContent += "DESCRIPTION:" + session.description + "\r\n";
          icalContent += "END:VEVENT\r\n";
        });

        icalContent += "END:VCALENDAR\r\n";

        return icalContent;
      },

      // Download ICS file
      downloadICSFile: function (content, filename) {
        var blob = new Blob([content], { type: "text/calendar;charset=utf-8" });
        var url = window.URL.createObjectURL(blob);
        var a = document.createElement("a");
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      },
      goToFeedbackDirect: function () {
        var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
        oRouter.navTo("feedback");
      },
      onLeaveSession: function (oEvent) {
        var oSelectedItem = oEvent
          .getSource()
          .getBindingContext("allSessionsModel")
          .getObject();
        var sSessionId = oSelectedItem.sessionID; // Assuming the property name is sessionID
        var sSessionTitle = oSelectedItem.title; // Assuming the property name is title

        var that = this; // Preserve reference to the controller

        // Confirmation dialog
        sap.m.MessageBox.confirm(
          "Are you sure you want to leave session '" + sSessionTitle + "'?",
          {
            title: "Confirm",
            actions: [
              sap.m.MessageBox.Action.OK,
              sap.m.MessageBox.Action.CANCEL,
            ],
            onClose: function (oAction) {
              if (oAction === sap.m.MessageBox.Action.OK) {
                // User confirmed deletion, proceed with AJAX call
                $.ajax({
                  url:
                    "http://localhost:4004/odata/v4/catalog/registerdOnASession(" +
                    sSessionId +
                    ")",
                  type: "DELETE",
                  success: function (data) {
                    // Assuming successful deletion response returns some data
                    // Update your UI accordingly, for example, remove the item from the model
                    var oModel = that.getView().getModel("allSessionsModel");
                    var aSessions = oModel.getProperty("/");
                    var nIndex = aSessions.findIndex(function (oSession) {
                      return oSession.sessionID === sSessionId;
                    });
                    if (nIndex !== -1) {
                      aSessions.splice(nIndex, 1);
                      oModel.setProperty("/", aSessions);
                    }
                    sap.m.MessageToast.show("Session left successfully");
                    // Reload the page after 1.5 seconds (1500 milliseconds)
                    setTimeout(function () {
                      window.location.reload();
                    }, 500);
                  },
                  error: function (xhr, status, error) {
                    // Handle error
                    sap.m.MessageToast.show(
                      "Error occurred while leaving session: " + error
                    );
                  },
                });
              }
            },
          }
        );
      },
    });
  }
);
