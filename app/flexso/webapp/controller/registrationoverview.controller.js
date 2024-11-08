sap.ui.define(
  [
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/m/MessageToast",
  ],
  function (Controller, JSONModel, MessageToast) {
    "use strict";

    return Controller.extend("flexso.controller.registrationoverview", {
      onInit: function () {
        console.log("Initialization of registration overview page...");
        this.loadData();
        this.loadGenderData();
        this._aGlobalFilters = [];
        // Maak de tabel standaard zichtbaar
        var oParticipantsTable = this.getView().byId("participantsTable");
        oParticipantsTable.setVisible(true);
        this._bSortDescending = true;
      },

      loadData: function () {
        var that = this;
        console.log("Loading event data...");
        jQuery.ajax({
          url: "http://localhost:4004/odata/v4/catalog/Events",
          dataType: "json",
          success: function (data) {
            console.log("Data loaded successfully:", data);

            var filteredEvents = data.value.map(function (event) {
              return {
                eventID: event.eventID,
                Name: event.name,
              };
            });

            var eventModel = new JSONModel(filteredEvents);
            that.getView().setModel(eventModel, "eventModel");

            var oSelect = that.getView().byId("sessionEventSelect");
            oSelect.removeAllItems();
            filteredEvents.forEach(function (event) {
              oSelect.addItem(
                new sap.ui.core.Item({
                  key: event.eventID,
                  text: event.Name,
                })
              );
            });

            if (filteredEvents.length > 0) {
              var defaultEventID = filteredEvents[0].eventID;
              that.loadSessions(defaultEventID);
            }
          },
          error: function (xhr, status, error) {
            console.error("Error fetching event data:", error);
            MessageToast.show(
              this.getView().getModel("i18n").getProperty("fetchdateevent") +
                error
            );
          },
        });
      },
      loadGenderData: function () {
        var that = this;
        jQuery.ajax({
          url: "http://localhost:4004/odata/v4/catalog/Users",
          method: "GET",
          success: function (data) {
            var uniqueGenders = {};
            data.value.forEach(function (user) {
              if (!uniqueGenders[user.gender]) {
                uniqueGenders[user.gender] = true; // Store unique genders
              }
            });
            var genderModel = new sap.ui.model.json.JSONModel({
              genders: Object.keys(uniqueGenders).map(function (gender) {
                return { key: gender, text: gender }; // Create model data
              }),
            });
            that.getView().setModel(genderModel, "genderModel");
          },
          error: function () {
            sap.m.MessageToast.show("Failed to load gender data.");
          },
        });
      },
      _applyAllFilters: function () {
        var oTable = this.getView().byId("participantsTable");
        var oBinding = oTable.getBinding("items");
        var oCombinedFilter = new sap.ui.model.Filter(
          this._aGlobalFilters,
          true
        );
        oBinding.filter(oCombinedFilter);
      },
      //test

      onEventSelectChange: function (oEvent) {
        var sValue = oEvent.getParameter("newValue").trim();
        var oSessionsBox = this.getView().byId("sessionsBox");
        var oEventTable = this.getView().byId("_IDGenTable1");
        var oParticipantTable = this.getView().byId("participantsTable");

        if (sValue) {
          var oModel = this.getView().getModel("eventModel");
          var selectedEvent = oModel
            .getData()
            .find((event) => event.Name.includes(sValue));
          if (selectedEvent) {
            console.log(
              "Event selected:",
              selectedEvent.Name,
              "with ID:",
              selectedEvent.eventID
            );
            this.loadSessions(selectedEvent.eventID);
            oSessionsBox.setVisible(true);
            oEventTable.setVisible(false);
            // Clear participant model when a new event is selected
            this.getView().setModel(new JSONModel([]), "participantModel");
          } else {
            console.log("No event found with the name:", sValue);
            oSessionsBox.setVisible(false);
            oEventTable.setVisible(true);
            this.getView().setModel(new JSONModel([]), "participantModel");
            MessageToast.show(
              this.getView().getModel("i18n").getProperty("EventNotFound")
            );
          }
        } else {
          oSessionsBox.setVisible(false);
          oEventTable.setVisible(true);
          this.getView().setModel(new JSONModel([]), "participantModel");
          console.log("Input cleared - no event selected.");
        }
      },

      loadSessionsFromEventName: function (eventName) {
        var that = this;
        // Implement AJAX call to fetch sessions related to the event name
        jQuery.ajax({
          url: "http://localhost:4004/odata/v4/catalog/Sessions",
          dataType: "json",
          data: {
            $filter: "eventName eq '" + eventName + "'",
          },
          success: function (data) {
            // Assuming sessionModel is set up to take these entries
            var sessionModel = new JSONModel(data.value);
            that.getView().setModel(sessionModel, "sessionModel");
            that.byId("_IDGenTable2").setVisible(true);
          },
          error: function () {
            that.byId("sessionsBox").setVisible(false);
          },
        });
      },
      updateFilters: function () {
        var aFilters = [];
        var oModel = this.getView().getModel();
        var activeFilters = this.activeFilters;

        Object.keys(activeFilters).forEach(function (key) {
          if (activeFilters[key]) {
            aFilters.push(
              new sap.ui.model.Filter(
                key,
                sap.ui.model.FilterOperator.Contains,
                activeFilters[key]
              )
            );
          }
        });

        var oBinding = this.getView()
          .byId("participantsTable")
          .getBinding("items");
        oBinding.filter(aFilters);
      },

      onItemPress: function (oEvent) {
        var oItem = oEvent.getParameter("listItem");
        var oContext = oItem.getBindingContext("eventModel");
        var sName = oContext.getProperty("Name");

        // Update the value in the SearchField with the name of the pressed item
        this.byId("sessionEventSelect").setValue(sName);

        // Hide the table
        this.byId("_IDGenTable1").setVisible(false);
        this.byId("sessionsBox").setVisible(true);

        // Load sessions related to the selected event
        var selectedEventId = oItem
          .getBindingContext("eventModel")
          .getProperty("eventID");
        this.loadSessions(selectedEventId);

        var oItem = oEvent.getParameter("listItem");
        var oContext = oItem.getBindingContext("participantModel");
        var sFirstname = oContext.getProperty("firstname");
        var sLastname = oContext.getProperty("lastname");
        var sEmail = oContext.getProperty("email");
        var sCompany = oContext.getProperty("company");
        var sBdate = oContext.getProperty("bdate");
        var sPhone = oContext.getProperty("phone");
        var sGender = oContext.getProperty("gender");

        // Update de waarden in de tabel
        this.byId("_IDGenText8").setText(sFirstname + " " + sLastname);
        this.byId("_IDGenText9").setText(sEmail);
        this.byId("_IDGenText10").setText(sCompany);
        this.byId("_IDGenText12").setText(sBdate);
        this.byId("_IDGenText13").setText(sPhone);
        this.byId("_IDGenText14").setText(sGender);
      },

      loadSessions: function (eventID) {
        console.log("Loading sessions for event ID:", eventID);
        var that = this;
        jQuery.ajax({
          url: "http://localhost:4004/odata/v4/catalog/Sessions",
          dataType: "json",
          data: {
            $filter: "eventID eq '" + eventID + "'",
          },
          success: function (data) {
            console.log("Sessions loaded successfully:", data);
            var sessions = data.value.map(function (session) {
              return {
                sessionID: session.sessionID,
                title: session.title,
              };
            });

            var sessionModel = new JSONModel(sessions);
            that.getView().setModel(sessionModel, "sessionModel");

            var oSessionSelect = that.getView().byId("sessionSelect1");
            // Alleen items toevoegen als er sessies zijn
            if (sessions.length > 0) {
              oSessionSelect.removeAllItems();
              sessions.forEach(function (session) {
                var oItem = new sap.ui.core.Item({
                  key: session.sessionID,
                  text: session.title,
                });
                oSessionSelect.addItem(oItem);
              });

              // Selecteer de eerste sessie automatisch.
              oSessionSelect.setSelectedItem(oSessionSelect.getItems()[0]);

              // Laad de gegevens van de automatisch geselecteerde sessie
              that.loadRegisteredParticipants(
                oSessionSelect.getItems()[0].getKey()
              );
            }
          },
          error: function (xhr, status, error) {
            console.error("Error fetching session data:", error);
            MessageToast.show(
              this.getView().getModel("i18n").getProperty("fetchdatesession") +
                error
            );
          },
        });
      },

      onSessionSelectChange: function (oEvent) {
        var selectedSessionID = oEvent.getSource().getSelectedKey();
        var oVBox = this.getView().byId("_IDGenVBox3");
        var oParticipantTable = this.getView().byId("participantsTable");

        if (selectedSessionID) {
          this.loadRegisteredParticipants(selectedSessionID);
          oVBox.setVisible(true);
          // Clear participant model when a new session is selected
          this.getView().setModel(new JSONModel([]), "participantModel");
        } else {
          oVBox.setVisible(false);
          // Clear the table when there is no session selected
          this.getView().setModel(new JSONModel([]), "participantModel");
        }
      },

      loadRegisteredParticipants: function (sessionID) {
        var that = this;
        console.log("Loading participants for session ID:", sessionID);

        jQuery.ajax({
          url: "http://localhost:4004/odata/v4/catalog/registerdOnASession",
          dataType: "json",
          data: { $filter: "sessionID eq " + sessionID },
          success: function (data) {
            var participants = data.value;
            console.log("Participants loaded successfully:", data);
            var participantModel = new JSONModel(data.value);
            that.getView().setModel(participantModel, "participantModel");
            that.getView().getModel("participantModel").refresh();

            // Create a counter to track the completion of user data fetching
            var usersFetched = 0;

            participants.forEach(function (participant) {
              var filter =
                "$filter=firstname eq '" +
                encodeURIComponent(participant.firstname) +
                "' and lastname eq '" +
                encodeURIComponent(participant.lastname) +
                "'";
              jQuery.ajax({
                url: "http://localhost:4004/odata/v4/catalog/Users",
                dataType: "json",
                data: filter,
                success: function (userData) {
                  if (userData.value && userData.value.length > 0) {
                    var user = userData.value[0];

                    // Combine participant and user data
                    participant.company = user.company;
                    participant.bdate = user.bdate;
                    participant.phone = user.phone;
                    participant.gender = user.gender;
                  }

                  // Increment the counter
                  usersFetched++;
                  if (usersFetched === participants.length) {
                    // All users are fetched, now update the model
                    var participantModel = new JSONModel(participants);
                    that
                      .getView()
                      .setModel(participantModel, "participantModel");
                  }
                },
                error: function () {
                  console.error(
                    "Error fetching user details for",
                    participant.firstname,
                    participant.lastname
                  );
                  usersFetched++;
                  if (usersFetched === participants.length) {
                    var participantModel = new JSONModel(participants);
                    that
                      .getView()
                      .setModel(participantModel, "participantModel");
                  }
                },
              });
            });
          },
          error: function (xhr, status, error) {
            console.error("Error fetching participant data:", error);
            MessageToast.show("Error fetching data: " + error);
          },
        });
      },

      updateParticipantsTable: function (combinedData) {
        // Maak een JSON-model aan met de gecombineerde gegevens
        var participantModel = new sap.ui.model.json.JSONModel(combinedData);
        // Stel het model in op de tabel
        this.getView().setModel(participantModel, "participantModel");
      },
      onLiveSearchCompany: function (oEvent) {
        var sQuery2 = oEvent.getParameter("newValue").trim().toLowerCase();
        this._aGlobalFilters = this._aGlobalFilters.filter(
          (f) => f.sPath !== "company"
        );
        if (sQuery2) {
          var oCompanyFilter = new sap.ui.model.Filter(
            "company",
            sap.ui.model.FilterOperator.Contains,
            sQuery2
          );
          this._aGlobalFilters.push(oCompanyFilter);
        }
        this._applyAllFilters();
      },
      onSortBdate: function () {
        var oBinding = this.getView()
          .byId("participantsTable")
          .getBinding("items");
        var oSorter = new sap.ui.model.Sorter("bdate", this._bSortDescending);
        oBinding.sort(oSorter);

        // Toggle the sort order for the next call
        this._bSortDescending = !this._bSortDescending;
        this.applyFilters();
      },

      onLiveSearch: function (oEvent) {
        var sQuery = oEvent.getParameter("newValue").trim();
        var aFilters = [];

        // Split de zoektekst op spaties en filter lege strings
        var searchTerms = sQuery.split(" ").filter(function (term) {
          return term !== "";
        });

        // Maak een filter voor elk zoekterm
        var termFilters = searchTerms.map(function (term) {
          return new sap.ui.model.Filter({
            filters: [
              new sap.ui.model.Filter(
                "firstname",
                sap.ui.model.FilterOperator.Contains,
                term
              ),
              new sap.ui.model.Filter(
                "lastname",
                sap.ui.model.FilterOperator.Contains,
                term
              ),
              new sap.ui.model.Filter(
                "company",
                sap.ui.model.FilterOperator.Contains,
                term
              ),
              new sap.ui.model.Filter(
                "email",
                sap.ui.model.FilterOperator.Contains,
                term
              ),
              new sap.ui.model.Filter(
                "bdate",
                sap.ui.model.FilterOperator.Contains,
                term
              ),
            ],
            and: false,
          });
        });

        // Voeg alle zoekfilters samen
        var oSearchFilter = new sap.ui.model.Filter({
          filters: termFilters,
          and: true,
        });

        // Voeg de geslachtsfilters toe
        this._aGlobalFilters.forEach(function (filter) {
          aFilters.push(filter);
        });

        // Voeg het zoekfilter toe aan de lijst met filters
        if (searchTerms.length > 0) {
          aFilters.push(oSearchFilter);
        }

        // Pas alle filters toe
        var oBinding = this.getView()
          .byId("participantsTable")
          .getBinding("items");
        oBinding.filter(aFilters);
      },

      onChooseGender: function (oEvent) {
        var aSelectedKeys = oEvent.getSource().getSelectedKeys();
        this._aGlobalFilters = this._aGlobalFilters.filter(function (f) {
          return f.sPath !== "gender"; // Verwijder oude geslachtsfilters
        });

        if (aSelectedKeys.length > 0) {
          var aGenderFilters = aSelectedKeys.map(function (key) {
            return new sap.ui.model.Filter(
              "gender",
              sap.ui.model.FilterOperator.EQ,
              key
            );
          });
          var oCombinedGenderFilter = new sap.ui.model.Filter({
            filters: aGenderFilters,
            and: false, // 'Or' conditie voor meerdere geslachten
          });
          this._aGlobalFilters.push(oCombinedGenderFilter);
        }

        this._applyAllFilters(); // Pas alle filters samen toe, inclusief de zoekfilters
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

      formatter: {
        formatDate: function (date) {
          if (!date) {
            return null;
          }
          var oDateFormat = sap.ui.core.format.DateFormat.getDateInstance({
            pattern: "dd MMM yyyy",
          });
          return oDateFormat.format(date);
        },
      },

      onBackToHome: function () {
        var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
        oRouter.navTo("home");
      },
      onProfileButtonClick: function () {
        var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
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

      onLogoutPress: function () {
        var that = this;
        sap.m.MessageBox.confirm(
          this.getView().getModel("i18n").getProperty("logout"),
          {
            title: "Confirm",
            onClose: function (oAction) {
              if (oAction === sap.m.MessageBox.Action.OK) {
                localStorage.clear();
                var oRouter = sap.ui.core.UIComponent.getRouterFor(that);
                oRouter.navTo("login");
              }
            },
          }
        );
      },
    });
  }
);
