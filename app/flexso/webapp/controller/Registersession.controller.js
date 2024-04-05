sap.ui.define(
  [
    "sap/ui/core/mvc/Controller",
    "sap/m/MessageToast",
    "sap/ui/core/UIComponent",
    "sap/ui/thirdparty/jquery",
    "sap/ui/model/json/JSONModel",
    "sap/ui/core/format/DateFormat", // Import DateFormat module
  ],
  function (
    Controller,
    MessageToast,
    UIComponent,
    jQuery,
    JSONModel,
    DateFormat
  ) {
    "use strict";

    return Controller.extend("flexso.controller.Registersession", {
      onInit: function () {
        var oRouter = UIComponent.getRouterFor(this);
        oRouter.attachRoutePatternMatched(this.onRoutePatternMatched, this);
      },

      onRoutePatternMatched: function (oEvent) {
        var sRouteName = oEvent.getParameter("name");
        if (sRouteName === "Registersession") {
          this.loadSessionData();
          this.loadUserData();
        }
      },

      formatDate: function (dateString) {
        var oDateFormat = DateFormat.getDateInstance({
          pattern: "yyyy-MM-dd",
        });
        return oDateFormat.format(new Date(dateString));
      },

      loadSessionData: function () {
        // Retrieve session data from localStorage
        var sessionID = parseInt(localStorage.getItem("sessionID")); // Parse as integer
        var title = localStorage.getItem("title");
        var startDate = localStorage.getItem("startDate");
        var endDate = localStorage.getItem("endDate");
        var location = localStorage.getItem("location");
        var speaker = localStorage.getItem("speaker");
        var totalSeats = parseInt(localStorage.getItem("totalSeats"));
        var description = localStorage.getItem("description");
        var startTime = localStorage.getItem("startTime");
        var endTime = localStorage.getItem("endTime");
        var room = localStorage.getItem("room");
        var firstname = localStorage.getItem("firstname");
        var lastname = localStorage.getItem("lastname");
        var email = localStorage.getItem("email");

        // Format start date and end date using formatDate function
        startDate = this.formatDate(startDate);
        endDate = this.formatDate(endDate);

        // Construct a session object from retrieved properties
        var oSessionData = {
          sessionID: sessionID, // Ensure sessionID is parsed as an integer
          title: title,
          startDate: startDate,
          endDate: endDate,
          location: location,
          speaker: speaker,
          totalSeats: totalSeats,
          description: description,
          startTime: startTime,
          endTime: endTime,
          room: room,
          firstname: firstname,
          lastname: lastname,
          email: email,
        };

        // Create a JSON model with the session data
        var oSessionModel = new JSONModel(oSessionData);

        // Set the session model to the view with the name "sessionModel"
        this.getView().setModel(oSessionModel, "sessionModel");
      },

      loadUserData: function () {
        var loggedInUserEmail = localStorage.getItem("email");
        if (!loggedInUserEmail) {
          MessageToast.show("Logged-in user email not found.");
          return;
        }
        var userDataUrl =
          "http://localhost:4004/odata/v4/catalog/Users?$filter=email eq '" +
          loggedInUserEmail +
          "'";
        jQuery.ajax({
          url: userDataUrl,
          type: "GET",
          success: function (data) {
            if (data.value.length > 0) {
              var userData = data.value[0];
              var oUserDataModel = new JSONModel({
                userID: userData.userID,
                email: userData.email,
                firstname: userData.firstname,
                lastname: userData.lastname,
              });
              this.getView().setModel(oUserDataModel, "userData");
            } else {
              MessageToast.show("User data not found.");
            }
          }.bind(this),
          error: function (xhr, status, error) {
            MessageToast.show("Failed to fetch user data: " + error);
          },
        });
      },

      onRegisterPress: function () {
        var oSessionModel = this.getView().getModel("sessionModel");
        var oUserDataModel = this.getView().getModel("userData");

        var oRegistrationData = {
          sessionID: oSessionModel.getProperty("/sessionID"),

          title: oSessionModel.getProperty("/title"),
          startDate: oSessionModel.getProperty("/startDate"),
          endDate: oSessionModel.getProperty("/endDate"),
          startTime: oSessionModel.getProperty("/startTime"),
          endTime: oSessionModel.getProperty("/endTime"),
          room: oSessionModel.getProperty("/room"),
          description: oSessionModel.getProperty("/description"),
          speaker: oSessionModel.getProperty("/speaker"),
          totalSeats: oSessionModel.getProperty("/totalSeats"),
          eventID: oSessionModel.getProperty("/eventID"),
          firstname: oUserDataModel.getProperty("/firstname"),
          lastname: oUserDataModel.getProperty("/lastname"),
          email: oUserDataModel.getProperty("/email"),
        };

        this.sendRegistrationToBackend(oRegistrationData);
      },

      sendRegistrationToBackend: function (oRegistrationData) {
        jQuery.ajax({
          url: "http://localhost:4004/odata/v4/catalog/registerdOnASession",
          type: "POST",
          contentType: "application/json",
          data: JSON.stringify(oRegistrationData),
          success: function () {
            MessageToast.show("Session registered successfully");
          },
          error: function (xhr, status, error) {
            MessageToast.show("Failed to register session: " + error);
          },
        });
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
      onDropdownPress: function (oEvent) {
        var oButton = oEvent.getSource();
        var oPopover = this.getView().byId("popover");
        if (!oPopover.isOpen()) {
          oPopover.openBy(oButton);
        } else {
          oPopover.close();
        }
      },
      onProfileButtonClick: function () {
        var oRouter = UIComponent.getRouterFor(this);
        oRouter.navTo("profile");
      },
      onBackToHome: function () {
        var oRouter = UIComponent.getRouterFor(this);
        oRouter.navTo("home");
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
      OnGoBackPress: function () {
        //clear localstorage of sessions
        localStorage.removeItem("sessionID");
        localStorage.removeItem("title");
        localStorage.removeItem("startDate");
        localStorage.removeItem("endDate");
        localStorage.removeItem("location");
        localStorage.removeItem("speaker");
        localStorage.removeItem("totalSeats");
        localStorage.removeItem("description");
        localStorage.removeItem("startTime");
        localStorage.removeItem("endTime");
        localStorage.removeItem("room");
        localStorage.removeItem("eventID");
        var oRouter = UIComponent.getRouterFor(this);
        oRouter.navTo("overview");
      },
    });
  }
);
