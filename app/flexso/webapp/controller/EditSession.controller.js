sap.ui.define(
  [
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/ui/core/UIComponent",
    "sap/m/MessageBox",
    "sap/ui/core/routing/History",
    "sap/m/MessageToast",
  ],
  function (
    Controller,
    JSONModel,
    UIComponent,
    MessageBox,
    History,
    MessageToast
  ) {
    "use strict";

    return Controller.extend("flexso.controller.EditSession", {
      onInit: function () {
        // Retrieve session data from local storage
        var sessionData = {
          sessionID: localStorage.getItem("sessionID"),
          title: localStorage.getItem("title"),
          startDate: localStorage.getItem("startDate"),
          endDate: localStorage.getItem("endDate"),
          startTime: localStorage.getItem("startTime"),
          endTime: localStorage.getItem("endTime"),
          room: localStorage.getItem("room"),
          speaker: localStorage.getItem("speaker"),
          totalSeats: localStorage.getItem("totalSeats"),
          description: localStorage.getItem("description"),
          naam: localStorage.getItem("naam"),
        };

        // Create a JSON model and set session data
        var sessionModel = new JSONModel(sessionData);
        this.getView().setModel(sessionModel, "sessionModel");
      },
      onSavePress: function () {
        var sessionModel = this.getView().getModel("sessionModel");
        var sessionID = sessionModel.getProperty("/sessionID");
        var oBundle = this.getView().getModel("i18n").getResourceBundle();
        var sErrorStartDateAfterEndDate = oBundle.getText(
          "errorStartDateAfterEndDate"
        );

        // Function to format date to YYYY-MM-DD
        function formatDate(dateString) {
          var date = new Date(dateString);
          if (isNaN(date)) return null;
          var year = date.getFullYear();
          var month = String(date.getMonth() + 1).padStart(2, "0");
          var day = String(date.getDate()).padStart(2, "0");
          return year + "-" + month + "-" + day;
        }

        // Function to format time to hh:mm:ss
        function formatTime(timeString) {
          var timeComponents = timeString.split(":");
          if (timeComponents.length < 2) return null;
          var time = new Date();
          time.setHours(parseInt(timeComponents[0], 10));
          time.setMinutes(parseInt(timeComponents[1], 10));
          time.setSeconds(0);
          time.setMilliseconds(0);
          return time.toTimeString().split(" ")[0];
        }

        var updatedSessionData = {
          title: sessionModel.getProperty("/title"),
          startDate: formatDate(sessionModel.getProperty("/startDate")),
          endDate: formatDate(sessionModel.getProperty("/endDate")),
          startTime: formatTime(sessionModel.getProperty("/startTime")),
          endTime: formatTime(sessionModel.getProperty("/endTime")),
          room: sessionModel.getProperty("/room"),
          description: sessionModel.getProperty("/description"),
          speaker: sessionModel.getProperty("/speaker"),
          naam: sessionModel.getProperty("/naam"),
          totalSeats: parseInt(sessionModel.getProperty("/totalSeats"), 10),
          eventID: sessionModel.getProperty("/eventID"),
        };

        // Validate start and end dates
        var startDate = new Date(updatedSessionData.startDate);
        var endDate = new Date(updatedSessionData.endDate);
        if (startDate > endDate) {
          MessageBox.error(sErrorStartDateAfterEndDate);
          return;
        }

        var that = this;
        // Send the PATCH request to update session
        $.ajax({
          url:
            "http://localhost:4004/odata/v4/catalog/Sessions(" +
            sessionID +
            ")",
          type: "PATCH",
          contentType: "application/json",
          data: JSON.stringify(updatedSessionData),
          success: function (response) {
            if (response) {
              // Update registered users after updating session
              that.updateRegisteredUsers(sessionID);
            }
          },
          error: function (xhr, status, error) {
            console.error("Error updating session:", error);
            MessageBox.error("Error updating session");
          },
        });
      },

      updateRegisteredUsers: function (sessionID) {
        var that = this;
        // Fetch registered users for this session
        $.ajax({
          url:
            "http://localhost:4004/odata/v4/catalog/registerdOnASession?$filter=sessionID eq " +
            sessionID,
          type: "GET",
          success: function (usersData) {
            // Iterate through each registered user and update them
            usersData.value.forEach(function (user) {
              var updatedUserData = {
                // Update user data as needed
                title: that
                  .getView()
                  .getModel("sessionModel")
                  .getProperty("/title"),
                startDate: formatDate(
                  that
                    .getView()
                    .getModel("sessionModel")
                    .getProperty("/startDate")
                ),
                endDate: formatDate(
                  that
                    .getView()
                    .getModel("sessionModel")
                    .getProperty("/endDate")
                ),
                startTime: formatTime(
                  that
                    .getView()
                    .getModel("sessionModel")
                    .getProperty("/startTime")
                ),
                endTime: formatTime(
                  that
                    .getView()
                    .getModel("sessionModel")
                    .getProperty("/endTime")
                ),
                room: that
                  .getView()
                  .getModel("sessionModel")
                  .getProperty("/room"),
                description: that
                  .getView()
                  .getModel("sessionModel")
                  .getProperty("/description"),
                speaker: that
                  .getView()
                  .getModel("sessionModel")
                  .getProperty("/speaker"),
                naam: that
                  .getView()
                  .getModel("sessionModel")
                  .getProperty("/naam"),
                totalSeats: parseInt(
                  that
                    .getView()
                    .getModel("sessionModel")
                    .getProperty("/totalSeats"),
                  10
                ),
              };

              // Function to format date to YYYY-MM-DD
              function formatDate(dateString) {
                var date = new Date(dateString);
                var year = date.getFullYear();
                var month = String(date.getMonth() + 1).padStart(2, "0");
                var day = String(date.getDate()).padStart(2, "0");
                var formattedDate = year + "-" + month + "-" + day;
                return formattedDate;
              }
              function formatTime(timeString) {
                // Split the time string into hours, minutes, and seconds
                var timeComponents = timeString.split(":");
                // Create a new Date object and set the time components
                var time = new Date();
                time.setHours(parseInt(timeComponents[0], 10));
                time.setMinutes(parseInt(timeComponents[1], 10));
                // Add seconds and milliseconds (assuming they are always 0)
                time.setSeconds(0);
                time.setMilliseconds(0);
                // Format the time as hh:mm:ss.s
                return time.toTimeString().split(" ")[0];
              }
              // Send PATCH request to update each registered user
              $.ajax({
                url:
                  "http://localhost:4004/odata/v4/catalog/registerdOnASession(" +
                  user.sessionID2 +
                  ")",
                type: "PATCH",
                contentType: "application/json",
                data: JSON.stringify(updatedUserData),
                success: function (data) {
                  console.log("Updated user successfully");
                },
                error: function (xhr, status, error) {
                  // Handle error
                  console.error(
                    "Error occurred while updating registered user: " + error
                  );
                },
              });
            });
            // Show success message and navigate after users are updated
            MessageBox.success(
              "Updated session and registered users successfully",
              {
                onClose: function () {
                  var oRouter = that.getOwnerComponent().getRouter();
                  oRouter.navTo("overview", {}, true);
                  window.location.reload();
                },
              }
            );
          },
          error: function (xhr, status, error) {
            // Handle error fetching users
            console.error(
              "Error occurred while fetching registered users: " + error
            );
            MessageBox.error("Error fetching registered users");
          },
        });
      },

      onDeletePress: function () {
        var sessionID = this.getView()
          .getModel("sessionModel")
          .getProperty("/sessionID");
        var that = this;

        // Confirmation dialog for deleting session
        sap.m.MessageBox.confirm(
          "Are you sure you want to delete this session?",
          {
            title: "Confirm",
            actions: [
              sap.m.MessageBox.Action.OK,
              sap.m.MessageBox.Action.CANCEL,
            ],
            onClose: function (oAction) {
              if (oAction === sap.m.MessageBox.Action.OK) {
                // Send the DELETE request to delete the session
                $.ajax({
                  url:
                    "http://localhost:4004/odata/v4/catalog/Sessions(" +
                    sessionID +
                    ")",
                  type: "DELETE",
                  contentType: "application/json",
                  success: function () {
                    // Once the session is deleted, remove registered users
                    that.removeRegisteredUsers(sessionID);
                  },
                  error: function (xhr, status, error) {
                    console.error("Error deleting session:", error);
                    MessageBox.error("Error deleting session");
                  },
                });
              }
            },
          }
        );
      },

      removeRegisteredUsers: function (sessionID) {
        var that = this; // Preserve reference to the controller

        // Fetch registered users for this session
        $.ajax({
          url:
            "http://localhost:4004/odata/v4/catalog/registerdOnASession?$filter=sessionID eq " +
            sessionID,
          type: "GET",
          success: function (usersData) {
            // Iterate through each registered user and remove them
            usersData.value.forEach(function (user) {
              $.ajax({
                url:
                  "http://localhost:4004/odata/v4/catalog/registerdOnASession(" +
                  user.sessionID2 +
                  ")",
                type: "DELETE",
                success: function (data) {
                  console.log("Registered user removed successfully");
                },
                error: function (xhr, status, error) {
                  // Handle error
                  console.error(
                    "Error occurred while removing registered user: " + error
                  );
                },
              });
            });
            // Show success message and navigate after users are removed
            MessageBox.success(
              "Session and registered users deleted successfully",
              {
                onClose: function () {
                  var oRouter = that.getOwnerComponent().getRouter();
                  oRouter.navTo("overview", {}, true);
                  window.location.reload();
                },
              }
            );
          },
          error: function (xhr, status, error) {
            // Handle error
            console.error(
              "Error occurred while fetching registered users: " + error
            );
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
      onBackToHome: function () {
        var oRouter = UIComponent.getRouterFor(this);
        oRouter.navTo("home");
      },
      onProfileButtonClick: function () {
        var oRouter = UIComponent.getRouterFor(this);
        oRouter.navTo("profile");
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
                var oRouter = UIComponent.getRouterFor(that);
                oRouter.navTo("login");
              }
            },
          }
        );

        sap.m.MessageBox.confirm(
          this.getView().getModel("i18n").getProperty("logout"),
          {
            title: "Confirm",
            onClose: function (oAction) {
              if (oAction === sap.m.MessageBox.Action.OK) {
                localStorage.clear();
                var oRouter = UIComponent.getRouterFor(that);
                oRouter.navTo("login");
              }
            },
          }
        );
      },

      onBackPress: function () {
        var oRouter = UIComponent.getRouterFor(this);
        oRouter.navTo("overview", {}, true);
      },
    });
  }
);
