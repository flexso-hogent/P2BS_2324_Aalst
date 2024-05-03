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
      _tableWidth: "90%",
      _sessionBoxWidth: "10%",

      onInit: function () {
        this.loadData();
        var oProfileImagePath = jQuery.sap.getModulePath(
          "flexso",
          "/images/profile.jpg"
        );
        var oImageModel = new JSONModel({
          profileImagePath: oProfileImagePath,
          role: localStorage.getItem("role"), // Retrieve the role from local storage
        });

        this.getView().setModel(oImageModel, "imageModel");

        // Verberg de sessies standaard
        var oSessionsBox = this.getView().byId("sessionsBox");
        oSessionsBox.setVisible(false);

        this.computeCreateButtonsVisibility();

        // Add listener for changes to the role property
        oImageModel.attachPropertyChange(this.onRoleChange, this);
      },

      onRoleChange: function (oEvent) {
        if (oEvent.getParameter("path") === "/role") {
          this.computeCreateButtonsVisibility();
        }
      },
      computeCreateButtonsVisibility: function () {
        var oImageModel = this.getView().getModel("imageModel");
        var role = oImageModel.getProperty("/role");
        var isAdmin = role === "admin";
        oImageModel.setProperty("/isAdmin", isAdmin);
      },
      onToggleHalfScreen: function () {
        var oEventTable = this.byId("eventTable");
        var oSessionsList = this.byId("sessionsList");
        var oToggleButton = this.byId("toggleButton");

        var bEventTableVisible = oEventTable.getVisible();
        var bSessionsListVisible = oSessionsList.getVisible();

        // Toggle visibility
        oEventTable.setVisible(!bEventTableVisible);
        oSessionsList.setVisible(!bSessionsListVisible);

        // Change button text based on visibility
        if (bEventTableVisible) {
          oToggleButton.setText("Toggle Half-screen");
        } else {
          oToggleButton.setText("Toggle Full-screen");
        }
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
      onSort: function (oEvent) {
        // Waarden van zoekvelden ophalen en opslaan in controller-variabelen
        this._searchQuery = this.getView().byId("sessieZoekenInput").getValue();
        this._locationQuery = this.getView()
          .byId("LocatieZoekenInput")
          .getValue();

        this.bDescending = !this.bDescending;
        this.fnApplyFiltersAndOrdering(); // Filters en sorteerders toepassen
      },

      // Andere methoden...

      // Methode om filters toe te passen
      fnApplyFiltersAndOrdering: function (oEvent) {
        var aFilters = [],
          aSorters = [];

        // Sorteer op startdatum (SDate)
        aSorters.push(new sap.ui.model.Sorter("SDate", this.bDescending));

        if (this._searchQuery) {
          // Filteren op naam als er een zoekopdracht is
          var oFilter = new sap.ui.model.Filter(
            "Name",
            sap.ui.model.FilterOperator.Contains,
            this._searchQuery
          );
          aFilters.push(oFilter);
        }

        if (this._locationQuery) {
          // Filteren op locatie als er een locatiezoekopdracht is
          var oLocationFilter = new sap.ui.model.Filter(
            "location",
            sap.ui.model.FilterOperator.Contains,
            this._locationQuery
          );
          aFilters.push(oLocationFilter);
        }

        // Filters en sorteerders toepassen op de tabelbinding
        this.byId("eventTable")
          .getBinding("items")
          .filter(aFilters)
          .sort(aSorters);
      },

      onViewSessionsPress: function (oEvent) {
        var oSelectedListItem = oEvent.getSource().getParent();
        var oEventModel = oSelectedListItem
          .getBindingContext("eventModel")
          .getObject();
        var eventID = oEventModel.eventID;
        var oSessionsBox = this.getView().byId("sessionsBox");

        // Save the event name
        var eventName = oEventModel.Name;
        localStorage.setItem("eventName", eventName);
        var oSelectedListItem = oEvent.getSource().getParent();
        var oEventModel = oSelectedListItem
          .getBindingContext("eventModel")
          .getObject();
        var eventID = oEventModel.eventID;
        var oSessionsBox = this.getView().byId("sessionsBox");

        if (eventID) {
          this.loadSessions(eventID);
          oSessionsBox.setVisible(true);
          // Adjust layout after showing sessions
          this.adjustLayout("25%");
        } else {
          MessageToast.show(
            this.getView().getModel("i18n").getProperty("EventIDundefined")
          );
        }
      },
      adjustLayout: function (sessionsWidth) {
        var oSplitter = this.getView().byId("_IDGenSplitter1");
        var oTable = this.getView().byId("eventTable");
        var oSessionsBox = this.getView().byId("sessionsBox");

        // Set size of the content areas within the splitter
        oSplitter
          .getContentAreas()[0]
          .setLayoutData(
            new sap.ui.layout.SplitterLayoutData({ size: "auto" })
          );
        oSplitter
          .getContentAreas()[1]
          .setLayoutData(
            new sap.ui.layout.SplitterLayoutData({ size: sessionsWidth })
          );

        // Refresh the splitter after layout change
        oSplitter.invalidate();
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
                room: event.room,
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
            MessageToast.show(
              this.getView().getModel("i18n").getProperty("fetchdate") + error
            );
          },
        });
      },

      loadSessions: function (eventID) {
        var that = this;
        var currentDate = new Date(); // Huidige datum en tijd ophalen

        jQuery.ajax({
          url: "http://localhost:4004/odata/v4/catalog/Sessions",
          dataType: "json",
          success: function (data) {
            var filteredSessions = data.value.filter(function (session) {
              // Datumcontrole (datumcheck)
              var sessionStartDate = new Date(session.startDate);
              return (
                session.eventID === eventID && sessionStartDate >= currentDate
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
                speaker: session.speaker,
                totalSeats: session.totalSeats,
                description: session.description,
              };
            });

            var sessionModel = new JSONModel(sessions);
            that.getView().setModel(sessionModel, "sessionModel");

            // Show sessions box after data is loaded
            var oSessionsBox = that.getView().byId("sessionsBox");
            oSessionsBox.setVisible(true);

            var oSessionInfoBox = that.getView().byId("sessionInfoBox");
            oSessionInfoBox.setVisible(true);
          },
          error: function (xhr, status, error) {
            MessageToast.show(
              this.getView().getModel("i18n").getProperty("fetchdatesession") +
                error
            );
          },
        });
      },

      // Search field for session name
      onSearchLiveChange: function (oEvent) {
        var sQuery = oEvent.getParameter("newValue");
        var sLocationQuery = this.getView()
          .byId("LocatieZoekenInput")
          .getValue(); // Get the value from the location search field
        this.applyFilters(sQuery, sLocationQuery);
      },

      // Search field for location
      onLocatieZoekenLiveChange: function (oEvent) {
        var sLocationQuery = oEvent.getParameter("newValue");
        var sSearchQuery = this.getView().byId("sessieZoekenInput").getValue(); // Get the value from the session name search field
        this.applyFilters(sSearchQuery, sLocationQuery);
      },

      applyFilters: function (sSearchQuery, sLocationQuery) {
        var oTable = this.getView().byId("eventTable");
        var oBinding = oTable.getBinding("items");
        var aFilters = [];

        if (sSearchQuery) {
          var oSearchFilter = new sap.ui.model.Filter(
            "Name",
            sap.ui.model.FilterOperator.Contains,
            sSearchQuery
          );
          aFilters.push(oSearchFilter);
        }

        if (sLocationQuery) {
          var oLocationFilter = new sap.ui.model.Filter(
            "location",
            sap.ui.model.FilterOperator.Contains,
            sLocationQuery
          );
          aFilters.push(oLocationFilter);
        }

        // Apply combined filters to the table binding.
        oBinding.filter(aFilters);
      },
      voegSessieToe: function () {
        var oRouter = sap.ui.core.UIComponent.getRouterFor(this);

        // Get the event name from localStorage
        var eventName = localStorage.getItem("eventName");

        oRouter.navTo("createSession", { eventName: eventName });
        window.location.reload();
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
          localStorage.setItem("room", oSessionData.room);
          localStorage.setItem("speaker", oSessionData.speaker);
          localStorage.setItem("totalSeats", oSessionData.totalSeats);
          localStorage.setItem("description", oSessionData.description);
          localStorage.setItem("sessionID", oSessionData.sessionID);
          localStorage.setItem("eventID", oSessionData.eventID);

          var oRouter = UIComponent.getRouterFor(this);
          oRouter.navTo("Registersession");
        } else {
          MessageToast.show(
            this.getView().getModel("i18n").getProperty("selectSessionRegister")
          );
        }
      },
    });
  }
);
