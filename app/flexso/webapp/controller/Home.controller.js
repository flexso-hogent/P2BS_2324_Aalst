sap.ui.define(
  [
    "sap/ui/core/mvc/Controller",
    "sap/ui/core/UIComponent",
    "sap/ui/model/json/JSONModel",
    "sap/m/MessageToast",
  ],
  function (Controller, UIComponent, JSONModel, MessageToast) {
    "use strict";

    return Controller.extend("flexso.controller.Home", {
      onInit: function () {
        var oProfileImagePath = jQuery.sap.getModulePath(
          "flexso",
          "/images/profile.jpg"
        );
        var oImageModel = new JSONModel({
          profileImagePath: oProfileImagePath,
          feedbackData: [], // Initialize an empty array to hold feedback data
        });

        this.getView().setModel(oImageModel, "imageModel");

        // Call a function to fetch feedback data and update the model
        this.fetchFeedbackData();
      },

      // Function to fetch feedback data from the backend
      fetchFeedbackData: function () {
        // Get the logged-in user's email address
        var loggedInUserEmail = localStorage.getItem("email");

        // Replace this with your actual service URL
        var feedbackServiceURL =
          "http://localhost:4004/odata/v4/catalog/Feedback";

        // Construct the filter based on the logged-in user's email
        var filter = "$filter=Username eq '" + loggedInUserEmail + "'";

        // Append the filter to the service URL
        feedbackServiceURL += "?" + filter;

        $.ajax({
          url: feedbackServiceURL,
          type: "GET",
          success: function (data) {
            // Assuming the response data is an array of feedback objects
            // Update the model with the fetched feedback data
            var oModel = this.getView().getModel("imageModel");
            oModel.setProperty("/feedbackData", data.value);
          }.bind(this),
          error: function (xhr, status, error) {
            MessageToast.show("Error fetching feedback data: " + error);
          },
        });
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

      onProfileButtonClick: function () {
        var oRouter = UIComponent.getRouterFor(this);
        oRouter.navTo("profile");
      },

      onFeedbackPress: function () {
        var oRouter = UIComponent.getRouterFor(this);
        oRouter.navTo("feedback");
      },

      onGoToOverviewEventPress: function () {
        var oRouter = UIComponent.getRouterFor(this);
        oRouter.navTo("overview");
      },
      onGoToCreateSessionPress: function () {
        var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
        oRouter.navTo("createEvent");
      },
    });
  }
);
