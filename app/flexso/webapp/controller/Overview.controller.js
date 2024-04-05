sap.ui.define(
  [
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/m/MessageToast",
    "sap/ui/core/UIComponent",
  ],
  function (Controller, JSONModel, MessageToast, UIComponent) {
    "use strict";

    return Controller.extend("flexso.controller.Overview", {
      _selectedEvent: null,

      onInit: function () {
        this.loadData();
        var oProfileImagePath = jQuery.sap.getModulePath(
          "flexso",
          "/images/profile.jpg"
        );
        var oImageModel = new JSONModel({
          profileImagePath: oProfileImagePath,
        });

        this.getView().setModel(oImageModel, "imageModel");

        // Verberg de sessies standaard
        var oSessionsBox = this.getView().byId("sessionsBox");
        oSessionsBox.setVisible(false);
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

      onViewSessionsPress: function (oEvent) {
        var oSelectedListItem = oEvent.getSource().getParent();
        var oEventModel = oSelectedListItem
          .getBindingContext("eventModel")
          .getObject();
        var eventID = oEventModel.eventID;

        if (eventID) {
          this.loadSessions(eventID);
          var oSessionsBox = this.getView().byId("sessionsBox");
          oSessionsBox.setVisible(true);
        } else {
          MessageToast.show("EventID is not defined.");
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
                STime: event.startTime,
                ETime: event.endTime,
                location: event.location,
                totalSeats: event.totalSeats,
                speaker: event.speaker,
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

      loadSessions: function (eventID) {
        var that = this;
        jQuery.ajax({
          url: "http://localhost:4004/odata/v4/catalog/Sessions",
          dataType: "json",
          success: function (data) {
            var filteredSessions = data.value.filter(function (session) {
              return session.eventID === eventID;
            });

            var sessions = filteredSessions.map(function (session) {
              return {
                sessionID: session.sessionID,
                title: session.title,
                startDate: session.startDate,
                startTime: session.startTime,
                endDate: session.endDate,
                endTime: session.endTime,
                location: session.room,
                speaker: session.speaker,
                totalSeats: session.totalSeats,
                description: session.description,
              };
            });

            var sessionModel = new JSONModel(sessions);
            that.getView().setModel(sessionModel, "sessionModel");

            var oSessionInfoBox = that.getView().byId("sessionInfoBox");
            oSessionInfoBox.setVisible(true);
          },
          error: function (xhr, status, error) {
            MessageToast.show("Error fetching session data: " + error);
          },
        });
      },

      onExpandSessionsPress: function () {
        var oSessionsBox = this.getView().byId("sessionsBox");
        var oExpandSessionsButton = this.getView().byId("expandSessionsButton");

        if (oSessionsBox.getVisible()) {
          oSessionsBox.setVisible(false);
          oExpandSessionsButton.setIcon("sap-icon://slim-arrow-left");
        }
      },

      onSearchLiveChange: function (oEvent) {
        var sQuery = oEvent.getParameter("newValue");
        this.filterEvents(sQuery);
      },

      filterEvents: function (sQuery) {
        var oList = this.getView().byId("overviewListP");
        var oBinding = oList.getBinding("items");
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

      onRegisterPress: function (oEvent) {
        var oSessionContext = oEvent
          .getSource()
          .getBindingContext("sessionModel");
        if (oSessionContext) {
          var oSessionData = oSessionContext.getObject();
          localStorage.setItem("title", oSessionData.title);
          localStorage.setItem("startDate", oSessionData.startDate);
          localStorage.setItem("endDate", oSessionData.endDate);
          localStorage.setItem("startTime", oSessionData.startTime);
          localStorage.setItem("endTime", oSessionData.endTime);
          localStorage.setItem("location", oSessionData.location);
          localStorage.setItem("speaker", oSessionData.speaker);
          localStorage.setItem("totalSeats", oSessionData.totalSeats);
          localStorage.setItem("description", oSessionData.description);
          localStorage.setItem("sessionID", oSessionData.sessionID);
          localStorage.setItem("eventID", oSessionData.eventID);

          var oRouter = UIComponent.getRouterFor(this);
          oRouter.navTo("Registersession");
        } else {
          MessageToast.show("Select a session to register.");
        }
      },
    });
  }
);
