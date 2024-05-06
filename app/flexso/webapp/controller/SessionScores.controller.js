sap.ui.define(
  [
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/m/MessageToast",
    "sap/ui/core/UIComponent",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
  ],
  /**
   * @param {typeof sap.ui.core.mvc.Controller} Controller
   **/
  function (
    Controller,
    JSONModel,
    MessageToast,
    UIComponent,
    Filter,
    FilterOperator
  ) {
    "use strict";

    return Controller.extend("flexso.controller.SessionScores", {
      onInit: function () {
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

        var oEvents = {
          Event: "",
          Location: "",
          startDate: null,
          endDate: null,
          Description: "",
        };
        var oModel = new JSONModel(oEvents);
        this.getView().setModel(oModel, "events");
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
      },
      onShowreviews: function(oEvent) {
        var oSelectedItem = oEvent.getSource().getParent().getParent();
        console.log("Selected Item: " + oSelectedItem);
        var oBindingContext = oSelectedItem.getBindingContext("sessionModel");
        console.log("Binding Context: " + oBindingContext);
        var sSessionTitle = oBindingContext.getProperty("title");
        console.log("Session Title: " + sSessionTitle);
        var oComponent = this.getOwnerComponent();
        console.log("Session Title: " + sSessionTitle);
        oComponent.getRouter().navTo("reviews", {
            sessionTitle: sSessionTitle
        });
      },
    
    

    
      onProfileButtonClick: function () {
        var oRouter = UIComponent.getRouterFor(this);
        oRouter.navTo("profile");
      },

      onSearch: function (oEvent) {
        var aFilters = [];
        var sQuery = oEvent.getSource().getValue().toLowerCase(); // Convert sQuery to lowercase
        if (sQuery && sQuery.length > 0) {
          var nameFilter = new Filter({
            path: "name",
            operator: FilterOperator.Contains,
            value1: sQuery,
            caseSensitive: false, // Set caseSensitive to false
          });
          var locationFilter = new Filter({
            path: "location",
            operator: FilterOperator.Contains,
            value1: sQuery,
            caseSensitive: false, // Set caseSensitive to false
          });

          // Combine both filters with logical OR
          var combinedFilter = new Filter({
            filters: [nameFilter, locationFilter],
            and: false, // Logical OR
          });

          aFilters.push(combinedFilter);
        }

        var oTable = this.getView().byId("eventTable");
        var oBinding = oTable.getBinding("items");
        oBinding.filter(aFilters, "Application");

        var event = this.getView().byId("eventZoekenInput").getValue();
        if (event === "") {
          oTable.setVisible(true);
          var oSessionsList = this.getView().byId("sessionsList");
          oSessionsList.setVisible(false);
        }
      },
      // implement this press="onShowreviews"

      onSessionSelect: function (oEvent) {
        var oSelectedItem = oEvent.getSource();
        var sTitel = oSelectedItem.getCells()[0].getText();
        var sEventID = oSelectedItem.getBindingContext().getProperty("eventID");

        var sEndDate = oSelectedItem.getCells()[3].getText();
        var oCurrentDate = new Date();

        if (sEndDate > oCurrentDate) {
          sap.m.MessageToast.show(
            this.getView()
              .getModel("i18n")
              .getProperty("SessionScoresEventNotFinisched")
          );
        } else {
          var oSearchField = this.getView().byId("eventZoekenInput");
          oSearchField.setValue(sTitel);

          var oTable = this.getView().byId("eventTable");
          oTable.setVisible(false);

          var oSessionsList = this.getView().byId("sessionsList");
          oSessionsList.setVisible(true);
          this.loadSessions(sEventID);
        }
      },

      loadData: function () {
        var that = this;
        jQuery.ajax({
          url: "http://localhost:4004/odata/v4/catalog/Events",
          dataType: "json",
          success: function (data) {
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
          },
          error: function (xhr, status, error) {
            MessageToast.show(
              this.getView().getModel("i18n").getProperty("fetchdate") + error
            );
          },
        });
      },

      loadSessions: function (eventID) {
        var that = this;
        jQuery.ajax({
          url: "http://localhost:4004/odata/v4/catalog/Sessions",
          dataType: "json",
          success: function (data) {
            var filteredSessions = data.value.filter(function (session) {
              return session.eventID === eventID;
            });

            var promises = filteredSessions.map(function (session) {
              return new Promise(function (resolve, reject) {
                jQuery.ajax({
                  url: "http://localhost:4004/odata/v4/catalog/Feedback",
                  dataType: "json",
                  data: {
                    $filter: "SessionTitle eq '" + session.title + "'",
                  },
                  success: function (feedbackData) {
                    var totalRating = 0;
                    var feedbackCount = feedbackData.value.length; // Store feedback count
                    var maxScore = 5;
                    if (feedbackCount > 0) {
                      totalRating = feedbackData.value.reduce(function (
                        accumulator,
                        currentValue
                      ) {
                        return accumulator + currentValue.Rating;
                      },
                      0);
                      session.averageRating = Math.round(
                        (totalRating / feedbackCount / maxScore) * 100
                      );
                    } else {
                      session.averageRating = 0;
                    }
                    session.feedbackCount = feedbackCount; // Add feedback count to session
                    resolve(session);
                  },
                  error: function (xhr, status, error) {
                    reject(error);
                  },
                });
              });
            });

            Promise.all(promises)
              .then(function (sessionsWithRating) {
                var sessions = sessionsWithRating.map(function (session) {
                  return {
                    sessionID: session.sessionID,
                    title: session.title,
                    startDate: session.startDate,
                    startTime: session.startTime,
                    endDate: session.endDate,
                    endTime: session.endTime,
                    location: session.room,
                    speaker: session.speaker,
                    totalSeats: session.totalSeats,
                    description: session.description,
                    averageRating: session.averageRating,
                    feedbackCount: session.feedbackCount, // Include feedback count
                  };
                });

                var sessionModel = new JSONModel(sessions);
                that.getView().setModel(sessionModel, "sessionModel");
              })
              .catch(function (error) {
                MessageToast.show(
                  this.getView()
                    .getModel("i18n")
                    .getProperty("fetchdatesession") + error
                );
              });
          },
          error: function (xhr, status, error) {
            MessageToast.show(
              this.getView().getModel("i18n").getProperty("fetchdatesession") +
                error
            );
          },
        });
      },
    });
  }
);
