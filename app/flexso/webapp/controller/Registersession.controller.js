sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel"
], function (Controller, JSONModel) {
    "use strict";

    return Controller.extend("flexso.controller.Registersession", {
        onInit: function () {
            var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
            oRouter.getRoute("Registersession").attachMatched(this._onRouteMatched, this);
        },

        _onRouteMatched: function (oEvent) {
            var sSessionData = oEvent.getParameter("arguments").sessionData;
            var oSessionData = JSON.parse(decodeURIComponent(sSessionData));
            var oSessionModel = new sap.ui.model.json.JSONModel(oSessionData);
            this.getView().setModel(oSessionModel, "sessionModel");

            // Haal de ingelogde gebruiker op
            var loggedInUserEmail = localStorage.getItem("email");
            var loggedInUserFirstName = localStorage.getItem("firstname");
            var loggedInUserSecondName = localStorage.getItem("lastname");
            var loggedInUserID= localStorage.getItem("userID");

            // Mocking user data for demonstration purposes
            var oUserData = {
              userID: loggedInUserID,
              Username: loggedInUserFirstName + " " + loggedInUserSecondName,
             
            };
            var oUserModel = new JSONModel(oUserData);
            this.getView().setModel(oUserModel, "userData");

        },

        onRegisterPress: function () {
            var oSessionModel = this.getView().getModel("sessionModel");
            var oUserData = this.getView().getModel("userData");

            var oRegistrationData = {
                registrationDate: new Date(),
                sessionID: oSessionModel.getProperty("/sessionID"), // Aannemend dat sessionID beschikbaar is in de sessiemodel
                userID: oUserData.getProperty("/userID"),
                eventID: oSessionModel.getProperty("/eventID"), // Aannemend dat eventID beschikbaar is in de sessiemodel
                Username: oUserData.getProperty("/Username"),
                SessionTitle: oSessionModel.getProperty("/title"),
                Rating: "", // Leeg omdat de gebruiker dit nog niet heeft ingevuld
                Review: "", // Leeg omdat de gebruiker dit nog niet heeft ingevuld
                FeedbackDate: "" // Leeg omdat de gebruiker dit nog niet heeft ingevuld
            };

            this._sendRegistrationToBackend(oRegistrationData);
        },

        _sendRegistrationToBackend: function (oRegistrationData) {
          // Hier komt dan de techniek om het in de database te zetten
          // maar dit lukt mij niet voor een of andere reden 
        }      
    });
});
