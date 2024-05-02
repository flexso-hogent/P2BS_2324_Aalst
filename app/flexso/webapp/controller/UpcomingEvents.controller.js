sap.ui.define(
  [
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/m/MessageToast",
    "sap/ui/core/UIComponent",
  ],
  function (Controller, JSONModel, MessageToast, UIComponent) {
    "use strict";

    return Controller.extend("flexso.controller.UpcomingEvents", {
      onInit: function () {
        // Fetch upcoming registered sessions data
        this.fetchUpcomingRegisteredSessions();
      },

      onShowFullDescription: function (oEvent) {
        var oButton = oEvent.getSource();
        var oContext = oButton.getBindingContext("upcomingSessionsModel"); // Corrected model name

        if (oContext) {
          var sDescription = oContext.getProperty("description");

          var oDialog = new sap.m.Dialog({
            title: this.getView().getModel("i18n").getProperty("description"),
            content: new sap.m.Text({
              text: sDescription,
            }),
            buttons: [
              new sap.m.Button({
                text: this.getView().getModel("i18n").getProperty("close"),
                press: function () {
                  oDialog.close();
                },
              }),
            ],
          });

          oDialog.open();
        }
      },

      onSortPress: function (oEvent) {
        var oTable = this.getView().byId("upcomingEventsTable");
        var oBinding = oTable.getBinding("items");

        // Get the current sorter (if any) from the binding
        var aSorters = oBinding.aSorters || [];

        // Check if there's already a sorter on the "startDate" field
        var oDateSorter = aSorters.find(function (sorter) {
          return sorter.sPath === "startDate";
        });

        if (oDateSorter) {
          // If there's already a sorter on the date field, toggle its order
          oDateSorter.bDescending = !oDateSorter.bDescending;
        } else {
          // If there's no sorter on the date field, create one in ascending order
          oDateSorter = new sap.ui.model.Sorter("startDate");
          aSorters.push(oDateSorter);
        }

        // Apply the sorters to the binding
        oBinding.sort(aSorters);
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
        var oBinding = this.getView()
          .byId("upcomingEventsTable")
          .getBinding("items");
        oBinding.filter([oFilter]);
      },

      fetchUpcomingRegisteredSessions: function () {
        // Get the logged-in user's email address from localStorage
        var userEmail = localStorage.getItem("email");

        // Check if user email is available
        if (!userEmail) {
          MessageToast.show(
            this.getView()
              .getModel("i18n")
              .getProperty("UPeventEmailLocalStorage")
          );
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
              // Filter out upcoming sessions
              var upcomingSessions = data.value.filter(function (session) {
                return !this.isSessionInPast(session.endDate);
              }, this);

              // Update the model with the upcoming sessions for the logged-in user
              var oModel = new JSONModel(upcomingSessions);
              this.getView().setModel(oModel, "upcomingSessionsModel");
            } else {
              // No sessions found for the logged-in user
              MessageToast.show(
                this.getView()
                  .getModel("i18n")
                  .getProperty("UPeventNoRegistered")
              );
            }
          }.bind(this),
          error: function (xhr, status, error) {
            // Handle error case
            MessageToast.show(
              this.getView().getModel("i18n").getProperty("fetchuserdateSess") +
                error
            );
          },
        });
      },

      isSessionInPast: function (endDate) {
        var today = new Date();
        var sessionEndDate = new Date(endDate);
        return sessionEndDate < today;
      },

      onBackToHome: function () {
        var oRouter = UIComponent.getRouterFor(this);
        oRouter.navTo("home");
      },

      onFeedbackPress: function () {
        var oRouter = UIComponent.getRouterFor(this);
        oRouter.navTo("feedback");
      },
      onProfileButtonClick: function () {
        var oRouter = UIComponent.getRouterFor(this);
        oRouter.navTo("profile");
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
      onLeaveSession: function (oEvent) {
        var oSelectedItem = oEvent
          .getSource()
          .getBindingContext("upcomingSessionsModel")
          .getObject();
        var sSessionId = oSelectedItem.sessionID; // Assuming the property name is sessionID
        var sSessionTitle = oSelectedItem.title; // Assuming the property name is title

        var that = this; // Preserve reference to the controller

        // Confirmation dialog
        sap.m.MessageBox.confirm(
          this.getView().getModel("i18n").getProperty("UPeventLeaveSess") +
            sSessionTitle +
            "'?",

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
                    var oModel = that
                      .getView()
                      .getModel("upcomingSessionsModel");
                    var aSessions = oModel.getProperty("/");
                    var nIndex = aSessions.findIndex(function (oSession) {
                      return oSession.sessionID === sSessionId;
                    });
                    if (nIndex !== -1) {
                      aSessions.splice(nIndex, 1);
                      oModel.setProperty("/", aSessions);
                    }
                    sap.m.MessageToast.show(
                      this.getView()
                        .getModel("i18n")
                        .getProperty("UPeventLeaveSessSucc")
                    );

                    // Reload the page after 1.5 seconds (1500 milliseconds)
                    setTimeout(function () {
                      window.location.reload();
                    }, 500);
                  },
                  error: function (xhr, status, error) {
                    // Handle error
                    sap.m.MessageToast.show(
                      this.getView()
                        .getModel("i18n")
                        .getProperty("UPeventErrorSess") + error
                    );
                  },
                });
              }
            },
          }
        );
      },
      onExportToOutlookPress: function (oEvent) {
        var oSessionData = oEvent
          .getSource()
          .getBindingContext("upcomingSessionsModel")
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

      // Download ICS file.
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
    });
  }
);
