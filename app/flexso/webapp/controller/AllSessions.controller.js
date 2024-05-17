sap.ui.define(
  [
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/m/MessageToast",
  ],
  function (Controller, JSONModel, MessageToast) {
    "use strict";

    return Controller.extend("flexso.controller.AllSessions", {
      onInit: function () {
        // Fetch all registered sessions data
        this.fetchAllRegisteredSessions();
        var oDeviceModel = new sap.ui.model.json.JSONModel({
          isPhone: sap.ui.Device.system.phone,
          isDesktop: sap.ui.Device.system.desktop,
        });
        oDeviceModel.setDefaultBindingMode("OneWay");
        this.getView().setModel(oDeviceModel, "device");
      },

      extractImageURL: function (sHTML) {
        var oParser = new DOMParser();
        var oDoc = oParser.parseFromString(sHTML, "text/html");
        var oImg = oDoc.querySelector("img");
        return oImg ? oImg.src : "";
      },

      isSessionInPast: function (endDate) {
        var today = new Date();
        var sessionEndDate = new Date(endDate);
        return sessionEndDate < today;
      },

      fetchAllRegisteredSessions: function () {
        var userEmail = localStorage.getItem("email");

        if (!userEmail) {
          MessageToast.show(
            this.getView()
              .getModel("i18n")
              .getProperty("UPeventEmailLocalStorage")
          );
          return;
        }

        var sessionServiceURL =
          "http://localhost:4004/odata/v4/catalog/registerdOnASession?$filter=email eq '" +
          userEmail +
          "'";

        $.ajax({
          url: sessionServiceURL,
          type: "GET",
          success: function (data) {
            if (data && data.value && data.value.length > 0) {
              var pastSessions = data.value.filter(function (session) {
                return this.isSessionInPast(session.endDate);
              }, this);

              // Fetch feedback data and add it to each session
              this.fetchExistingFeedback(
                function (existingFeedback) {
                  pastSessions.forEach(function (session) {
                    session.hasFeedback = existingFeedback.some(function (
                      feedback
                    ) {
                      return feedback.SessionTitle === session.title;
                    });
                  });

                  var reversedData = pastSessions.reverse();
                  var oModel = new JSONModel(reversedData);
                  this.getView().setModel(oModel, "allSessionsModel");
                }.bind(this)
              );
            } else {
              MessageToast.show(
                this.getView()
                  .getModel("i18n")
                  .getProperty("noRegisteredSessions")
              );
            }
          }.bind(this),
          error: function (xhr, status, error) {
            MessageToast.show(
              this.getView()
                .getModel("i18n")
                .getProperty("errorFetchRegisteredSession") + error
            );
          },
        });
      },

      fetchExistingFeedback: function (callback) {
        var userEmail = localStorage.getItem("email");

        $.ajax({
          url:
            "http://localhost:4004/odata/v4/catalog/Feedback?$filter=Username eq '" +
            userEmail +
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
        var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
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
                var oRouter = sap.ui.core.UIComponent.getRouterFor(that);
                oRouter.navTo("login");
              }
            },
          }
        );
      },

      onBackToHome: function () {
        var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
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

      onSearch: function (oEvent) {
        var sQuery = oEvent.getParameter("newValue");
        var oFilter = new sap.ui.model.Filter({
          filters: [
            new sap.ui.model.Filter(
              "title",
              sap.ui.model.FilterOperator.Contains,
              sQuery
            ),
            new sap.ui.model.Filter(
              "naam",
              sap.ui.model.FilterOperator.Contains,
              sQuery
            ),
            new sap.ui.model.Filter(
              "room",
              sap.ui.model.FilterOperator.Contains,
              sQuery
            ),
            new sap.ui.model.Filter(
              "startDate",
              sap.ui.model.FilterOperator.Contains,
              sQuery
            ),
            new sap.ui.model.Filter(
              "endDate",
              sap.ui.model.FilterOperator.Contains,
              sQuery
            ),
            new sap.ui.model.Filter(
              "startTime",
              sap.ui.model.FilterOperator.Contains,
              sQuery
            ),
            new sap.ui.model.Filter(
              "endTime",
              sap.ui.model.FilterOperator.Contains,
              sQuery
            ),
          ],
          and: false,
        });
        var oBinding = this.getView().byId("_IDGenTable1").getBinding("items");
        oBinding.filter([oFilter]);
      },

      goToFeedbackDirect: function (oEvent) {
        var oSelectedItem = oEvent
          .getSource()
          .getBindingContext("allSessionsModel")
          .getObject();
        var sSessionEndDate = oSelectedItem.endDate;
        var sSessionEndTime = oSelectedItem.endTime;
        var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
        var sCurrentDateTime = new Date();

        var sSessionEndDateTimeString = sSessionEndDate + " " + sSessionEndTime;

        var oSessionEndDateTime = new Date(sSessionEndDateTimeString);

        if (sCurrentDateTime > oSessionEndDateTime) {
          var sSessionTitle = oSelectedItem.title;
          oRouter.navTo("feedback", {
            sessionTitle: sSessionTitle,
          });
        } else {
          sap.m.MessageBox.error(
            this.getView().getModel("i18n").getProperty("feedbackSubmission")
          );
        }
      },
    });
  }
);
