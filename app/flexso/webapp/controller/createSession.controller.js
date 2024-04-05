sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/m/MessageToast",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator"
], function(Controller, JSONModel, MessageToast, Filter, FilterOperator) {
    "use strict";

    return Controller.extend("flexso.controller.CreateSession", {
        onInit: function() {
            this.loadData();
        },

        loadData: function() {
            var that = this;
            jQuery.ajax({
                url: "http://localhost:4004/odata/v4/catalog/Events",
                dataType: "json",
                success: function(data) {
                    var filteredEvents = data.value.map(function(event) {
                        return {
                            eventID: event.eventID,
                            Name: event.name,
                            SDate: event.startDate,
                            EDate: event.endDate,
                            location: event.location,
                            description: event.description
                        };
                    });

                    var eventModel = new JSONModel(filteredEvents);
                    that.getView().setModel(eventModel, "eventModel");
                },
                error: function(xhr, status, error) {
                    MessageToast.show("Error fetching data: " + error);
                },
            });
        },

        onCreateSession: function () {
            var oView = this.getView();
            var oSessionData = {
                sessionID: this.generateSessionID(), 
                title: oView.byId("_IDGenInput1").getValue(),
                startDate: oView.byId("_IDGenDatePicker1").getValue(),
                endDate: oView.byId("_IDGenDatePicker2").getValue(),
                startTime: oView.byId("_IDGenTimePicker1").getValue(),
                endTime: oView.byId("_IDGenTimePicker2").getValue(),
                room: oView.byId("_IDGenInput2").getValue(),
                description: oView.byId("_IDGenInput3").getValue(),
                speaker: oView.byId("_IDGenInput4").getValue(),
                totalSeats: parseInt(oView.byId("_IDGenInput5").getValue()), // Parse totalSeats to ensure it's a number
                eventID: oView.byId("eventSelect").getSelectedItem().getKey(),
            };
          
            var that = this; // Preserve reference to the controller
        
            var oDataModel = new sap.ui.model.odata.v2.ODataModel("http://localhost:4004/odata/v4/catalog/");
          
            oDataModel.create("/Sessions", oSessionData, {
                success: function () {
                    MessageToast.show("Session creation successful!");
                    setTimeout(function () {
                        var oRouter = UIComponent.getRouterFor(that);
                        oRouter.navTo("home");
                    }, 1000);
                },
                error: function () {
                    MessageToast.show("Error creating session!");
                }
            });
        },
        
        
        
        
        generateSessionID: function() {
            return "sessionID_" + new Date().getTime(); 
        },
        
        onDropdownPress: function() {

        },

        onBackToHome: function() {
            
        },

        onProfileButtonClick: function() {
            
        },

        onLogoutPress: function() {
            
        }
    });
});
