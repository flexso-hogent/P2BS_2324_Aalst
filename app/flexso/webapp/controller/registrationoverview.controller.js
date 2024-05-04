sap.ui.define([
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
        // Maak de tabel standaard zichtbaar
        var oParticipantsTable = this.getView().byId("participantsTable");
        oParticipantsTable.setVisible(true);
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

      onEventSelectChange: function (oEvent) {
        var sValue = oEvent.getParameter("newValue").trim();
        var oSessionsBox = this.getView().byId("sessionsBox");
        var oEventTable = this.getView().byId("_IDGenTable1");

        // Check if any value is entered in the event selection field
        if (sValue) {
          var oModel = this.getView().getModel("eventModel");
          var selectedEvent = oModel
            .getData()
            .find((event) => event.Name.includes(sValue));

          if (selectedEvent) {
            // If an event is selected, load its sessions and update visibility
            console.log(
              "Event selected: " +
                selectedEvent.Name +
                " with ID: " +
                selectedEvent.eventID
            );
            var selectedEventId = oEvent.getParameter("selectedItem").getKey();
            this.loadSessions(selectedEventId);
            oSessionsBox.setVisible(true);
            oEventTable.setVisible(false);
          } else {
            // If no matching event is found, inform the user and hide sessions box
            console.log("No event found with the name: " + sValue);
            oSessionsBox.setVisible(false);
            oEventTable.setVisible(true);
            MessageToast.show(
              this.getView().getModel("i18n").getProperty("EventNotFound")
            );
          }
        } else {
          // If the input is cleared, show the event table and hide the sessions box
          oSessionsBox.setVisible(false);
          oEventTable.setVisible(true);
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
        var sValue = oEvent.getParameter("newValue");
        var oModel = this.getView().getModel("sessionModel");
        oModel.setProperty("/selectedSession", sValue);

        if (sValue !== "") {
          this.loadRegisteredParticipants(sValue);
          this.byId("_IDGenVBox3").setVisible(true);
        } else {
          this.byId("_IDGenVBox3").setVisible(false);
        }
      },

    

      loadRegisteredParticipants: function(sessionID) {
        // Laad de geregistreerde deelnemers voor de geselecteerde sessie 
        //"http://localhost:4004/odata/v4/catalog/registerdOnASession": hieruit hebben we hun email, firstname, lastname nodig
        // en uit
        //"http://localhost:4004/odata/v4/catalog/Users": hieruit hebben we company, bdate, phone, gender nodig
        // beide tabellen zijn verbonden met userID, zo kan je dus de juist gegevens van elkaar halen 
        // je moet dus uit beide tabellen gegevens halen
        // alles in deze fucntie uitvoeren

        var that = this;
        console.log("Loading participants for session ID:", sessionID);
        jQuery.ajax({
          url: "http://localhost:4004/odata/v4/catalog/registerdOnASession",
          dataType: "json",
          data: {
            $filter: "sessionID eq " + sessionID,
          },
          success: function (data) {
            console.log("Participants loaded successfully:", data);
            var participants = data.value.map(function (participant) {
              return {
                userID: participant.userID,
              };
            });

            var participantModel = new JSONModel(participants);
            that.getView().setModel(participantModel, "participantModel");

            var oParticipantsTable = that.getView().byId("participantsTable");
            oParticipantsTable.setVisible(true);
          },
          error: function (xhr, status, error) {
            console.error("Error fetching participant data:", error);
            MessageToast.show(
              this.getView().getModel("i18n").getProperty("fetchdateparticipant") +
                error
            );
          },
        });

        // Haal de gegevens van de deelnemers op
        var that = this;
        console.log("Loading participant data...");
        jQuery.ajax({
          url: "http://localhost:4004/odata/v4/catalog/Users",
          dataType: "json",
          success: function (data) {
            console.log("Data loaded successfully:", data);
            var participants = data.value.map(function (participant) {
              return {
                userID: participant.userID,
                firstname: participant.firstname,
                lastname: participant.lastname,
                company: participant.company,
                email: participant.email,
                bdate: participant.bdate,
                phone: participant.phone
              };
            });

            var participantModel = new JSONModel(participants);
            that.getView().setModel(participantModel, "participantModel");

            var oParticipantsTable = that.getView().byId("participantsTable");
            oParticipantsTable.setVisible(true);
          }
        });

        // Combineer de gegevens van de deelnemers en de geregistreerde deelnemers
        var combinedData = [];
        var participants = that.getView().getModel("participantModel").getData();
        var registeredParticipants = that.getView().getModel("participantModel").getData();
        participants.forEach(function (participant) {
          var registeredParticipant = registeredParticipants.find(
            (registeredParticipant) => registeredParticipant.userID === participant.userID
          );
          if (registeredParticipant) {
            combinedData.push({
              userID: participant.userID,
              firstname: participant.firstname,
              lastname: participant.lastname,
              company: participant.company,
              email: participant.email,
              bdate: participant.bdate,
              phone: participant.phone
            });
          }
        });

        // Update de tabel met de gecombineerde gegevens
        that.updateParticipantsTable(combinedData);
      
      },

    updateParticipantsTable: function(combinedData) {
        // Maak een JSON-model aan met de gecombineerde gegevens
        var participantModel = new sap.ui.model.json.JSONModel(combinedData);
        // Stel het model in op de tabel
        this.getView().setModel(participantModel, "participantModel");
    },
    
    onLiveSearch: function (oEvent) {
        var sQuery = oEvent.getParameter("newValue");
        var oFilter = new sap.ui.model.Filter({
          filters: [
            new sap.ui.model.Filter(
              "firstname",
              sap.ui.model.FilterOperator.Contains,
              sQuery
            ),
            new sap.ui.model.Filter(
              "lastname",
              sap.ui.model.FilterOperator.Contains,
              sQuery
            ),
            new sap.ui.model.Filter(
              "company",
              sap.ui.model.FilterOperator.Contains,
              sQuery
            ),
            new sap.ui.model.Filter(
              "email",
              sap.ui.model.FilterOperator.Contains,
              sQuery
            ),
            new sap.ui.model.Filter(
              "bdate",
              sap.ui.model.FilterOperator.Contains,
              sQuery
            ),
          ],
          and: false,
        });
        var oBinding = this.getView()
          .byId("participantsTable")
          .getBinding("items");
        oBinding.filter([oFilter]);
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
});
