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
          role: localStorage.getItem("role"), // Retrieve the role from local storage
        });

        this.getView().setModel(oImageModel, "imageModel");

        // Call a function to fetch feedback data and update the model
        this.fetchFeedbackData();
        this.fetchRegisteredSessionsData();

        // Compute visibility of create buttons based on role
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

      fetchRegisteredSessionsData: function () {
        // Get the logged-in user's email address
        var loggedInUserEmail = localStorage.getItem("email");

        // Replace this with your actual service URL
        var sessionServiceURL =
          "http://localhost:4004/odata/v4/catalog/registerdOnASession";

        // Construct the filter based on the logged-in user's email
        var filter = "?$filter=email eq '" + loggedInUserEmail + "'";

        // Append the filter to the service URL
        sessionServiceURL += filter;

        $.ajax({
          url: sessionServiceURL,
          type: "GET",
          success: function (data) {
            // Assuming the response data is an array of registered session objects
            // Reverse the order of the sessions
            var reversedSessions = data.value.reverse();

            // Take the first two sessions
            var firstTwoSessions = reversedSessions.slice(0, 2);

            // Update the model with the fetched registered session data
            var oModel = this.getView().getModel("imageModel");
            oModel.setProperty("/registeredSessionsData", firstTwoSessions);
          }.bind(this),
          error: function (xhr, status, error) {
            MessageToast.show(
              "Error fetching registered sessions data: " + error
            );
          },
        });
      },

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
            // Reverse the order of the feedback entries
            var reversedFeedback = data.value.reverse();

            // Take the first two feedback entries
            var firstTwoFeedback = reversedFeedback.slice(0, 2);

            // Update the model with the fetched feedback data
            var oModel = this.getView().getModel("imageModel");
            oModel.setProperty("/feedbackData", firstTwoFeedback);
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
      onLogoutPress: function () {
        var that = this;
        sap.m.MessageBox.confirm("Are you sure you want to log out?", {
          title: "Confirm",
          onClose: function (oAction) {
            if (oAction === sap.m.MessageBox.Action.OK) {
              localStorage.clear();
              var oRouter = UIComponent.getRouterFor(that);
              oRouter.navTo("login");
            }
          },
        });
      },

      onGoToOverviewEventPress: function () {
        var oRouter = UIComponent.getRouterFor(this);
        oRouter.navTo("overview");
      },
      onGoToCreateEventPress: function () {
        var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
        oRouter.navTo("createEvent");
      },
      onGoToCreateSessionPress: function () {
        var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
        oRouter.navTo("createSession");
      },

      onGoToEventRegistrationOverview: function () {
        var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
        oRouter.navTo("registrationoverview");
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
      onExportToOutlookPress: function (oEvent) {
        var oListItem = oEvent.getSource().getParent(); // Get the parent list item
        var oSessionData = oListItem
          .getBindingContext("imageModel")
          .getObject(); // Get the session data from the model
        var icalContent = this.generateICalContent([oSessionData]);

        // Trigger file download with the generated ICS content
        this.downloadICSFile(icalContent, "calendar_event.ics");
      },
      onGoToScoreOverview: function () {
        var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
        oRouter.navTo("sessionScores");
      },

      // Function to generate ICS content from session data
      generateICalContent: function (sessions) {
        var icalContent = "BEGIN:VCALENDAR\r\nVERSION:2.0\r\n";

        sessions.forEach(function (session) {
          icalContent += "BEGIN:VEVENT\r\n";
          icalContent += "SUMMARY:" + session.title + "\r\n";
          icalContent +=
            "DTSTART:" + session.startDate + "T" + session.startTime + "\r\n";
          icalContent +=
            "DTEND:" + session.endDate + "T" + session.endTime + "\r\n";
          // Add description
          icalContent += "DESCRIPTION:" + session.description + "\r\n";
          icalContent += "END:VEVENT\r\n";
        });

        icalContent += "END:VCALENDAR\r\n";

        return icalContent;
      },

      // Function to trigger file download with the given content
      downloadICSFile: function (content, filename) {
        var blob = new Blob([content], { type: "text/calendar;charset=utf-8" });
        var url = window.URL.createObjectURL(blob);
        var a = document.createElement("a");
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      },

      onViewAllSessionsPress: function () {
        // Navigate to the view for all registered sessions
        var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
        oRouter.navTo("allSessions");
      },
      onAllFeedbackPress: function () {
        var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
        oRouter.navTo("allFeedback");
      },

      goToFeedbackDirect: function () {
        var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
        oRouter.navTo("feedback");
      },

      goToSchrijfUit: function () {
        sap.m.MessageBox.confirm("Are you sure you want to write out?", {
          title: "Confirm",
          onClose: function (oAction) {
            if (oAction === sap.m.MessageBox.Action.OK) {
              MessageToast.show("You have successfully written out");
            }
          }.bind(this),
        });
      },
    });
  }
);
