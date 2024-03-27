sap.ui.define(
  [
    "sap/ui/core/mvc/Controller",
    "sap/ui/core/UIComponent",
    "sap/ui/model/json/JSONModel",
    "sap/m/MessageToast",
    "sap/ui/model/odata/v2/ODataModel",
  ],
  function (Controller, UIComponent, JSONModel, MessageToast, ODataModel) {
    "use strict";

    return Controller.extend("flexso.controller.CreateEvent", {
      onInit: function () {
        var oViewModel = new JSONModel({
          name: "",
          startDate: null,
          endDate: null,
          location: "",
          description: "",
        });
        this.getView().setModel(oViewModel);
      },

      onSwitchToEnglish: function () {
        var oResourceModel = this.getView().getModel("i18n");
        oResourceModel.setProperty("/locale", "en");
        sap.ui.getCore().getConfiguration().setLanguage("en");
      },

      onSwitchToDutch: function () {
        var oResourceModel = this.getView().getModel("i18n");
        oResourceModel.setProperty("/locale", "nl");
        sap.ui.getCore().getConfiguration().setLanguage("nl");
      },

      onProfileButtonClick: function () {
        var oRouter = UIComponent.getRouterFor(this);
        oRouter.navTo("profile");
      },

      onBackToHome: function () {
        var oRouter = UIComponent.getRouterFor(this);
        oRouter.navTo("home");
      },

      onRegisterPress: function () {
        console.log("Register button clicked"); 
        var oViewModel = this.getView().getModel();
        var oEventData = oViewModel.getData();

        var that = this; /

        // CHATGPT 
        if (oEventData.startDate) {
          oEventData.startDate = this.formatDate(oEventData.startDate);
        }
        if (oEventData.endDate) {
          oEventData.endDate = this.formatDate(oEventData.endDate);
        }

        var oDataModel = new ODataModel(
          "http://localhost:4004/odata/v2/catalog/",
          {
            json: true,
          }
        );

        // kijken of het al in de database zit
        oDataModel.read("/Events", {
          filters: [
            new sap.ui.model.Filter(
              "name",
              sap.ui.model.FilterOperator.EQ,
              oEventData.name
            ),
          ],
          success: function (data) {
            if (data.results && data.results.length > 0) {
              MessageToast.show(
                "Event registration failed! Event already exists."
              );
            } else {
              //als event nog niet bestaat en alles is ingevuld
              oDataModel.create("/Events", oEventData, {
                success: function () {
                  MessageToast.show("Event registration successful!");
                  setTimeout(function () {
                    var oRouter = UIComponent.getRouterFor(that);
                    oRouter.navTo("home");
                    oViewModel.setData({
                      name: "",
                      startDate: null,
                      endDate: null,
                      location: "",
                      description: "",
                    });
                  }, 1000);
                },
                error: function (error) {
                  MessageToast.show("Event registration failed: ");
                },
              });
            }
          },
          error: function (xhr, status, error) {
            MessageToast.show(
              "Error checking event existence: " + error.responseText
            );
          },
        });
      },

      //chatpt code om de datum te formateren van MM/DD/YYYY naar YYYY-MM-DD
      formatDate: function (dateString) {
        // Parse the date string using JavaScript Date object
        var date = new Date(dateString);

        // Extract year, month, and day
        var year = date.getFullYear();
        var month = String(date.getMonth() + 1).padStart(2, "0"); // Month is zero-based
        var day = String(date.getDate()).padStart(2, "0");

        // Format the date as YYYY-MM-DD
        var formattedDate = year + "-" + month + "-" + day;

        return formattedDate;
      },
    });
  }
);
