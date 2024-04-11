sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/m/MessageToast"
], function(Controller, JSONModel, MessageToast) {
    "use strict";

    return Controller.extend("flexso.controller.registrationoverview", {
        onInit: function () {
            this.loadData();
        },

        loadData: function () {
            var that = this;
            jQuery.ajax({
                url: "http://localhost:4004/odata/v4/catalog/Events",
                dataType: "json",
                success: function (data) {
                    console.log("Data loaded successfully:", data);

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

                    // Load session names into select
                    var oSelect = that.getView().byId("sessionSelect");
                    oSelect.removeAllItems();
                    filteredEvents.forEach(function (event) {
                        oSelect.addItem(new sap.ui.core.Item({
                            key: event.eventID,
                            text: event.Name
                        }));
                    });
                },
                error: function (xhr, status, error) {
                    console.error("Error fetching data:", error);
                    MessageToast.show("Error fetching data: " + error);
                },
            });
        },

        onSessionSelectChange: function(oEvent) {
            var selectedSessionId = oEvent.getParameter("selectedItem").getKey();
            this.loadSessions(selectedSessionId);
            this.loadRegisteredParticipants(selectedSessionId);
        },

        loadSessions: function(eventID) {
            console.log("Selected event ID:", eventID);
            var that = this;
            jQuery.ajax({
                url: "http://localhost:4004/odata/v4/catalog/Sessions",
                dataType: "json",
                success: function(data) {
                    var filteredSessions = data.value.filter(function(session) {
                        return session.eventID === eventID;
                    });

                    var sessions = filteredSessions.map(function(session) {
                        return {
                            sessionID: session.sessionID,
                            title: session.title,
                        };
                    });

                    var sessionModel = new JSONModel(sessions);
                    that.getView().setModel(sessionModel, "sessionModel");

                    // Toon sessiebox nadat de gegevens zijn geladen
                    var oSessionsBox = that.getView().byId("sessionsBox");
                    oSessionsBox.setVisible(true);

                    // Voeg items toe aan de select box
                    var oSessionSelect = that.getView().byId("sessionSelect1");
                    oSessionSelect.removeAllItems();
                    sessions.forEach(function(session) {
                        oSessionSelect.addItem(new sap.ui.core.Item({
                            key: session.sessionID,
                            text: session.title
                        }));
                    });
                },
                error: function(xhr, status, error) {
                    MessageToast.show("Error fetching session data: " + error);
                },
            });
        },

        loadRegisteredParticipants: function(sessionID) {
            var that = this;
            jQuery.ajax({
                url: "http://localhost:4004/odata/v4/catalog/registeredOnASession",
                dataType: "json",
                data: {
                    $filter: "sessionID eq " + sessionID,
                    $select: "firstname, lastname, email"
                },
                success: function(data) {
                    var participants = data.value.map(function(participant) {
                        return {
                            firstname: participant.firstname,
                            lastname: participant.lastname,
                            email: participant.email
                        };
                    });

                    var participantModel = new JSONModel(participants);
                    that.getView().setModel(participantModel, "participantModel");

                    // Toon lijst met deelnemers
                    var oParticipantsList = that.getView().byId("participantsList");
                    oParticipantsList.setVisible(true);
                },
                error: function(xhr, status, error) {
                    MessageToast.show("Error fetching participant data: " + error);
                },
            });
        },
    });
});
