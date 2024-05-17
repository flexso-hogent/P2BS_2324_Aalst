sap.ui.define(
  [
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/m/MessageToast",
    "sap/ui/core/UIComponent",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
  ],
  function (
    Controller,
    JSONModel,
    MessageToast,
    UIComponent,
    Filter,
    FilterOperator
  ) {
    "use strict";

    return Controller.extend("flexso.controller.feedback", {
      feedbackSessions: [],

      onInit: function () {
        this.fetchFeedbackSessions();

        var oRootPath = jQuery.sap.getModulePath(
          "flexso",
          "/images/Flexso.png"
        );
        var oProfileImagePath = jQuery.sap.getModulePath(
          "flexso",
          "/images/profile.jpg"
        );
        var oImageModel = new JSONModel({
          path: oRootPath,
          profileImagePath: oProfileImagePath,
        });

        this.getView().setModel(oImageModel, "imageModel");

        var oSession = {
          Titel: "",
          startDate: null,
          endDate: null,
          startTime: null,
          endTime: null,
          Speaker: "",
        };
        var oModel = new JSONModel(oSession);
        this.getView().setModel(oModel, "form");

        // Voeg model toe voor alle sessies
        var oSessionsModel = new JSONModel([]);
        this.getView().setModel(oSessionsModel, "allSessions");

        var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
        oRouter.getRoute("feedback").attachMatched(this._onRouteMatched, this);
      },

      _onRouteMatched: function (oEvent) {
        var sSessionTitle = oEvent.getParameter("arguments").sessionTitle;
        console.log("Session title: " + sSessionTitle);
        var oSearchField = this.getView().byId("sessieZoekenInput");
        var oTable = this.getView().byId("sessionTable");

        if (oSearchField) {
          oSearchField.setValue(sSessionTitle);
          oTable.setVisible(false);
        } else {
          console.log("Search field not found");
        }
      },

      fetchFeedbackSessions: function () {
        var loggedInUserEmail = localStorage.getItem("email"); // Ensure this is securely managed in real applications

        this.fetchExistingFeedback(
          function (existingFeedback) {
            var feedbackTitles = existingFeedback.map(function (feedback) {
              return feedback.SessionTitle;
            });

            // Assuming your service endpoint URL is correct and set up to return sessions
            var sessionsURL =
              "http://localhost:4004/odata/v4/catalog/registerdOnASession?$filter=email eq '" +
              loggedInUserEmail +
              "'";

            $.ajax({
              url: sessionsURL,
              type: "GET",
              success: function (data) {
                var today = new Date();
                today.setHours(0, 0, 0, 0); // Reset time part for date comparison

                // Filter sessions to exclude those for which the user has already given feedback and future sessions
                var relevantSessions = data.value.filter(function (session) {
                  var sessionEndDate = new Date(session.endDate);
                  sessionEndDate.setHours(0, 0, 0, 0);
                  return (
                    !feedbackTitles.includes(session.title) &&
                    sessionEndDate < today
                  );
                });

                // Update the model with the relevant sessions
                var allSessionsModel = new JSONModel(relevantSessions);
                this.getView().setModel(allSessionsModel, "allSessions");
              }.bind(this),
              error: function (xhr, status, error) {
                MessageToast.show(
                  this.getView()
                    .getModel("i18n")
                    .getProperty("errorFetchFeedbacksessions") + error
                );
              },
            });
          }.bind(this)
        );
      },

      onAfterRendering: function () {
        // Filter de tabel op afgelopen sessies na het renderen van de view
        console.log("onAfterRendering");
        this.filterPastSessions();
      },

      onSwitchToEnglish: function () {
        var oResourceModel = this.getView().getModel("i18n");
        oResourceModel.sLocale = "en";
        sap.ui.getCore().getConfiguration().setLanguage("en");
        this.getView().getModel("i18n").refresh();
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
      fetchExistingFeedback: function (callback) {
        var loggedInUserEmail = localStorage.getItem("email");

        $.ajax({
          url:
            "http://localhost:4004/odata/v4/catalog/Feedback?$filter=Username eq '" +
            loggedInUserEmail +
            "'",
          type: "GET",
          success: function (data) {
            callback(data.value);
          },
          error: function (xhr, status, error) {
            MessageToast.show(
              this.getView()
                .getModel("i18n")
                .getProperty("errorFetchFeedback") + error
            );
          }.bind(this),
        });
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

        // Reload the page instantly
        window.location.reload(true); // Pass true to reload the page from the server, bypassing the cache
      },

      onProfileButtonClick: function () {
        var oRouter = UIComponent.getRouterFor(this);
        oRouter.navTo("profile");
      },
      onFeedback: function () {
        // Check if the user has already given feedback for the selected session
        var sessie = this.getView().byId("sessieZoekenInput").getValue();
        if (this.feedbackSessions.includes(sessie)) {
          sap.m.MessageBox.error(
            this.getView().getModel("i18n").getProperty("feedbackalready")
          );
          return; // Exit the function if feedback already given
        }
        // Feedback submission logic with AJAX
        var loggedInUserEmail = localStorage.getItem("email");
        var sessie = this.getView().byId("sessieZoekenInput").getValue();
        var oRatingIndicator = this.getView().byId("feedbackRating");
        var oTextArea = this.getView().byId("reviewTextArea");

        var feedbackData = {
          Username: loggedInUserEmail,
          SessionTitle: sessie,
          Rating: oRatingIndicator.getValue(),
          Review: oTextArea.getValue(),
          FeedbackDate: new Date().toISOString(),
        };

        if (sessie === "") {
          sap.m.MessageBox.error(
            this.getView().getModel("i18n").getProperty("feedbackErrorSession")
          );
        } else if (oRatingIndicator.getValue() === 0) {
          sap.m.MessageBox.error(
            this.getView().getModel("i18n").getProperty("feedbackErrorRating")
          );
        } else if (
          oRatingIndicator.getValue() <= 2 &&
          oTextArea.getValue().trim() === ""
        ) {
          sap.m.MessageBox.error(
            this.getView().getModel("i18n").getProperty("feedbackError")
          );
        } else {
          $.ajax({
            url: "http://localhost:4004/odata/v4/catalog/Feedback",
            type: "POST",
            contentType: "application/json",
            data: JSON.stringify(feedbackData),
            success: function (data) {
              MessageToast.show(
                this.getView().getModel("i18n").getProperty("Thankyoufeedback")
              );
              setTimeout(
                function () {
                  var oRouter = UIComponent.getRouterFor(this);
                  oRouter.navTo("home");
                  // Reload the page
                  window.location.reload(true); // Pass true to reload the page from the server, bypassing the cache
                }.bind(this),
                1500
              ); // Wait for 1.5 seconds (1500 milliseconds) before navigating
            }.bind(this),

            error: function (xhr, status, error) {
              sap.m.MessageBox.error(
                this.getView().getModel("i18n").getProperty("standardError")
              );
            },
          });
        }
      },

      filterPastSessions: function () {
        console.log("Filtering past sessions...");
        var oCurrentDateTime = new Date();
        oCurrentDateTime.setHours(0, 0, 0, 0);
        console.log("Current date and time: " + oCurrentDateTime);
        var oTable = this.getView().byId("sessionTable");
        var oBinding = oTable.getBinding("items");

        var currentDay = oCurrentDateTime.getDate();
        var currentMonth = oCurrentDateTime.getMonth() + 1;
        var currentYear = oCurrentDateTime.getFullYear();

        var formattedCurrentDate =
          currentYear +
          "-" +
          (currentMonth < 10 ? "0" : "") +
          currentMonth +
          "-" +
          (currentDay < 10 ? "0" : "") +
          currentDay;

        var pastSessionsFilter = new Filter({
          path: "endDate",
          operator: FilterOperator.LT, // Minder dan (Less Than)
          value1: formattedCurrentDate,
        });

        var combinedFilter = new Filter({
          filters: [pastSessionsFilter],
          and: true, // Alle filters moeten waar zijn
        });

        oBinding.filter(combinedFilter); // Use combinedFilter instead of pastSessionsFilter
      },

      onSearch: function (oEvent) {
        var aFilters = [];
        var sQuery = oEvent.getSource().getValue().toLowerCase();
        if (sQuery && sQuery.length > 0) {
          var filter = new Filter({
            path: "title",
            operator: FilterOperator.Contains,
            value1: sQuery,
            caseSensitive: false, // Set caseSensitive to false
          });
          aFilters.push(filter);
        }

        // Apply filter for past sessions
        var oCurrentDateTime = new Date();
        oCurrentDateTime.setHours(0, 0, 0, 0);
        var currentDay = oCurrentDateTime.getDate();
        var currentMonth = oCurrentDateTime.getMonth() + 1;
        var currentYear = oCurrentDateTime.getFullYear();
        var formattedCurrentDate =
          currentYear +
          "-" +
          (currentMonth < 10 ? "0" : "") +
          currentMonth +
          "-" +
          (currentDay < 10 ? "0" : "") +
          currentDay;

        var pastSessionsFilter = new Filter({
          path: "endDate",
          operator: FilterOperator.LT,
          value1: formattedCurrentDate,
        });

        var oTable = this.getView().byId("sessionTable");
        var oBinding = oTable.getBinding("items");
        aFilters.push(pastSessionsFilter); // Add past sessions filter to existing filters
        oBinding.filter(aFilters, "Application");

        var sessie = this.getView().byId("sessieZoekenInput").getValue();
        if (sessie === "") {
          oTable.setVisible(true);
        }
      },

      onSessionSelect: function (oEvent) {
        var oSelectedItem = oEvent.getSource();
        var sTitel = oSelectedItem.getCells()[0].getText();

        var sEndDate = oSelectedItem.getCells()[2].getText();
        var sEndTime = oSelectedItem.getCells()[4].getText();

        var oSelectedDateTime = new Date(sEndDate + " " + sEndTime);
        var oCurrentDateTime = new Date();

        if (oSelectedDateTime > oCurrentDateTime) {
          sap.m.MessageBox.error(
            this.getView().getModel("i18n").getProperty("SessiePlaatsvinden")
          );
        } else {
          var oSearchField = this.getView().byId("sessieZoekenInput");
          oSearchField.setValue(sTitel);

          var oTable = this.getView().byId("sessionTable");
          oTable.setVisible(false);
        }
      },
      onBackToHome: function () {
        var oRouter = UIComponent.getRouterFor(this);
        oRouter.navTo("home");
      },
    });
  }
);
