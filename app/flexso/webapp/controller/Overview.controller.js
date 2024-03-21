sap.ui.define(
  [
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/ui/core/UIComponent",
    "sap/m/MessageToast",
  ],
  function (Controller, JSONModel, UIComponent, MessageToast) {
    "use strict";

    return Controller.extend("flexso.controller.overview", {
      onInit: function () {
        var eventData = [
          {
            eventName: "Event 1",
            eventDate: "2024-04-01",
            description: "Description of Event 1",
          },
          {
            eventName: "Event 2",
            eventDate: "2024-04-15",
            description: "Description of Event 2",
          },
        ];

        var eventModel = new JSONModel(eventData);
        this.getView().setModel(eventModel, "eventModel");
      },

      onEventBlockPress: function (oEvent) {
        var oItem = oEvent.getSource();
        var oBindingContext = oItem.getBindingContext("eventModel");
        var sEventName = oBindingContext.getProperty("eventName");
        var sEventDate = oBindingContext.getProperty("eventDate");
        var sDescription = oBindingContext.getProperty("description");

        MessageToast.show(
          "Event Name: " +
            sEventName +
            "\nEvent Date: " +
            sEventDate +
            "\nDescription: " +
            sDescription
        );

        var oRouter = UIComponent.getRouterFor(this);
        oRouter.navTo("eventDetails", {
          eventName: sEventName,
          eventDate: sEventDate,
          description: sDescription,
        });
      },
    });
  }
);
