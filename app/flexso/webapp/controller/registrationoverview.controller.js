sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/m/MessageToast"
], function(Controller, JSONModel, MessageToast) {
    "use strict";

    return Controller.extend("flexso.controller.registrationoverview", {
        onInit: function () {
            console.log("Initialization of registration overview page...");
            this.loadData();
            // Maak de lijst standaard zichtbaar
            var oParticipantsList = this.getView().byId("participantsList");
            oParticipantsList.setVisible(true);
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
                            Name: event.name
                        };
                    });

                    var eventModel = new JSONModel(filteredEvents);
                    that.getView().setModel(eventModel, "eventModel");

                    var oSelect = that.getView().byId("sessionSelect");
                    oSelect.removeAllItems();
                    filteredEvents.forEach(function (event) {
                        oSelect.addItem(new sap.ui.core.Item({
                            key: event.eventID,
                            text: event.Name
                        }));
                    });
                    
                    if (filteredEvents.length > 0) {
                        var defaultEventID = filteredEvents[0].eventID;
                        that.loadSessions(defaultEventID);
                    }
                },
                error: function (xhr, status, error) {
                    console.error("Error fetching event data:", error);
                    MessageToast.show("Error fetching event data: " + error);
                },
            });
        },

        onSessionSelectChange: function(oEvent) {
            console.log("Session selection changed...");
            var selectedEventId = oEvent.getParameter("selectedItem").getKey();
            this.loadSessions(selectedEventId);
            // Roep de functie aan om geregistreerde deelnemers te laden voor de nieuwe sessie
            this.loadRegisteredParticipants(selectedEventId);
        },
        

        loadSessions: function(eventID) {
            console.log("Loading sessions for event ID:", eventID);
            var that = this;
            jQuery.ajax({
                url: "http://localhost:4004/odata/v4/catalog/Sessions",
                dataType: "json",
                data: {
                    "$filter": "eventID eq '" + eventID + "'",
                },
                success: function(data) {
                    console.log("Sessions loaded successfully:", data);
                    var sessions = data.value.map(function(session) {
                        return {
                            sessionID: session.sessionID,
                            title: session.title
                        };
                    });
        
                    var sessionModel = new JSONModel(sessions);
                    that.getView().setModel(sessionModel, "sessionModel");
        
                    var oSessionSelect = that.getView().byId("sessionSelect1");
                    // Alleen items toevoegen als er sessies zijn
                    if (sessions.length > 0) {
                        oSessionSelect.removeAllItems();
                        sessions.forEach(function(session) {
                            var oItem = new sap.ui.core.Item({
                                key: session.sessionID,
                                text: session.title
                            });
                            oSessionSelect.addItem(oItem);
                        });
                        
                        // Selecteer de eerste sessie automatisch
                        oSessionSelect.setSelectedItem(oSessionSelect.getItems()[0]);
        
                        // Laad de gegevens van de automatisch geselecteerde sessie
                        that.onSessionSelectChange({
                            getParameter: function() {
                                return {
                                    selectedItem: oSessionSelect.getItems()[0]
                                };
                            }
                        });
                    }
                },
                error: function(xhr, status, error) {
                    console.error("Error fetching session data:", error);
                    MessageToast.show("Error fetching session data: " + error);
                },
            });
        },
        
        
        
        loadRegisteredParticipants: function(sessionID) {
            console.log("Loading registered participants for session ID:", sessionID);
            var that = this;
        
            // Verwijder eerst het bestaande participantModel
            var oParticipantModel = that.getView().getModel("participantModel");
            if (oParticipantModel) {
                oParticipantModel.destroy();
            }
        
            jQuery.ajax({
                url: "http://localhost:4004/odata/v4/catalog/registerdOnASession",
                dataType: "json",
                data: {
                    $filter: "sessionID eq " + sessionID,
                    $select: "firstname,lastname,email"
                },
                success: function(data) {
                    console.log("Registered participants data loaded successfully:", data);
                    if (data && data.value && data.value.length > 0) {
                        var participants = data.value.map(function(participant) {
                            return {
                                firstname: participant.firstname,
                                lastname: participant.lastname,
                                email: participant.email
                            };
                        });
        
                        var participantModel = new JSONModel(participants);
                        that.getView().setModel(participantModel, "participantModel");
                    } else {
                        // Maak een leeg participantModel aan als er geen geregistreerde deelnemers zijn
                        var participantModel = new JSONModel([]);
                        that.getView().setModel(participantModel, "participantModel");
                    }
        
                    // Update de modelbinding
                    var oParticipantsList = that.getView().byId("participantsList");
                    oParticipantsList.bindItems({
                        path: "participantModel>/",
                        template: new sap.m.ObjectListItem({
                            title: {
                                parts: ["participantModel>firstname", "participantModel>lastname"],
                                formatter: function(firstname, lastname) {
                                    return firstname + " " + lastname;
                                }
                            },
                            type: "Active",
                            attributes: [
                                new sap.m.ObjectAttribute({
                                    title: "Email",
                                    text: "{participantModel>email}"
                                })
                            ]
                        })
                    });
        
                    // Toon lijst met deelnemers of houd zichtbaar indien leeg
                    oParticipantsList.setVisible(true);
                },
                error: function(xhr, status, error) {
                    console.error("Error fetching participant data:", error);
                    MessageToast.show("Error fetching participant data: " + error);
                },
            });
        },
        
        onSearch: function(oEvent) {
            var sQuery = oEvent.getParameter("query");
            var oFilter = new sap.ui.model.Filter({
                filters: [
                    new sap.ui.model.Filter("firstname", sap.ui.model.FilterOperator.Contains, sQuery),
                    new sap.ui.model.Filter("lastname", sap.ui.model.FilterOperator.Contains, sQuery)
                ],
                and: false
            });
            var oBinding = this.getView().byId("participantsList").getBinding("items");
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
        
    
    });
});