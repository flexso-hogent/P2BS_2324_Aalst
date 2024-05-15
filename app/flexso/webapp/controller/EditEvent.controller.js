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
        var iEventId = parseInt(sEventId, 10);

        if (isNaN(iEventId)) {
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

        this._loadSessions(iEventId);
      },

      _loadSessions: function (eventID) {
        var that = this;
        var currentDate = new Date();

        jQuery.ajax({
          url: "http://localhost:4004/odata/v4/catalog/Sessions",
          dataType: "json",
          success: function (data) {
            var filteredSessions = data.value.filter(function (session) {
              var sessionStartDate = new Date(session.startDate);
              return (
                session.eventID == eventID && sessionStartDate >= currentDate
              );
            });

            var sessions = filteredSessions.map(function (session) {
              return {
                sessionID: session.sessionID,
                title: session.title,
                startDate: session.startDate,
                startTime: session.startTime,
                endDate: session.endDate,
                endTime: session.endTime,
                room: session.room,
                naam: session.naam,
                speaker: session.speaker,
                totalSeats: session.totalSeats,
                description: session.description,
              };
            });

            var sessionModel = new JSONModel(sessions);
            that.getView().setModel(sessionModel, "sessionModel");

            var oSessionsBox = that.getView().byId("sessionsBox");
            oSessionsBox.setVisible(true);

            var oSessionInfoBox = that.getView().byId("sessionInfoBox");
            oSessionInfoBox.setVisible(true);
          },
          error: function (xhr, status, error) {
            MessageBox.show(
              that.getView().getModel("i18n").getProperty("fetchdatesession") +
                error
            );
          },
        });
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

      onDeletePress: function () {
        var oBundle = this.getView().getModel("i18n").getResourceBundle();
        var sConfirmText = oBundle.getText("deleteeventconfirm");
        var seventdelted = oBundle.getText("eventdeleted");
        var eventID = this.getView()
          .getModel("eventModel")
          .getProperty("/eventID");

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
                  that._deleteSessionsAndRegistrations(eventID);
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

      _deleteSessionsAndRegistrations: function (eventID) {
        var that = this;

        jQuery.ajax({
          url: "http://localhost:4004/odata/v4/catalog/Sessions",
          dataType: "json",
          success: function (data) {
            var sessionsToDelete = data.value.filter(function (session) {
              return session.eventID == eventID;
            });

            sessionsToDelete.forEach(function (session) {
              $.ajax({
                url:
                  "http://localhost:4004/odata/v4/catalog/Sessions(" +
                  session.sessionID +
                  ")",
                type: "DELETE",
                contentType: "application/json",
                success: function () {
                  that._deleteRegistrations(session.sessionID);
                },
                error: function (xhr, status, error) {
                  console.error("Error deleting session:", error);
                },
              });
            });
          },
          error: function (xhr, status, error) {
            console.error("Error fetching sessions:", error);
          },
        });
      },

      _deleteRegistrations: function (sessionID) {
        jQuery.ajax({
          url: "http://localhost:4004/odata/v4/catalog/registerdOnASession",
          dataType: "json",
          success: function (data) {
            var registrationsToDelete = data.value.filter(function (
              registration
            ) {
              return registration.sessionID == sessionID;
            });

            registrationsToDelete.forEach(function (registration) {
              $.ajax({
                url:
                  "http://localhost:4004/odata/v4/catalog/registerdOnASession(" +
                  registration.sessionID2 +
                  ")",
                type: "DELETE",
                contentType: "application/json",
                success: function () {
                  console.log("Registration deleted:", registration.sessionID2);
                },
                error: function (xhr, status, error) {
                  console.error("Error deleting registration:", error);
                },
              });
            });
          },
          error: function (xhr, status, error) {
            console.error("Error fetching registrations:", error);
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
