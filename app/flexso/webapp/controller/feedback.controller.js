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
   */
  function (
    Controller,
    JSONModel,
    MessageToast,
    UIComponent,
    Filter,
    FilterOperator
  ) {
    "use strict";

    function generateUUID() {
      var dt = new Date().getTime();
      var uuid = "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(
        /[xy]/g,
        function (c) {
          var r = (dt + Math.random() * 16) % 16 | 0;
          dt = Math.floor(dt / 16);
          return (c === "x" ? r : (r & 0x3) | 0x8).toString(16);
        }
      );
      return uuid;
    }

    var feedbackIDCounter = parseInt(localStorage.getItem("feedbackIDCounter"));

    function generateFeedbackId() {
      var feedbackID = "fb" + feedbackIDCounter;
      feedbackIDCounter++;
      localStorage.setItem("feedbackIDCounter", feedbackIDCounter);
      return feedbackID;
    }

    return Controller.extend("flexso.controller.feedback", {
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
      onProfilePressed: function () {
        var oRouter = UIComponent.getRouterFor(this);
        oRouter.navTo("profile");
      },
      onFeedback: function () {
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
          MessageToast.show("Gelieve een sessie in te geven");
        } else if (oRatingIndicator.getValue() === 0) {
          MessageToast.show("Gelieve een rating in te geven");
        } else {
          if (oRatingIndicator.getValue() <= 2) {
            if (oTextArea.getValue() === "") {
              MessageToast.show("Gelieve een review in te geven");
            } else {
              $.ajax({
                url: "http://localhost:4004/odata/v4/catalog/Feedback",
                type: "POST",
                contentType: "application/json",
                data: JSON.stringify(feedbackData),
                success: function (data) {
                  MessageToast.show("Bedankt voor uw feedback!");
                  setTimeout(
                    function () {
                      var oRouter = UIComponent.getRouterFor(this);
                      oRouter.navTo("home");

                      window.location.reload();
                    }.bind(this),
                    1000
                  );
                }.bind(this),
                error: function (xhr, status, error) {
                  MessageToast.show(
                    "Er is een fout opgetreden bij het versturen van feedback: " +
                      error
                  );
                },
              });
            }
          } else {
            $.ajax({
              url: "http://localhost:4004/odata/v4/catalog/Feedback",
              type: "POST",
              contentType: "application/json",
              data: JSON.stringify(feedbackData),
              success: function (data) {
                MessageToast.show("Bedankt voor uw feedback!");
                setTimeout(
                  function () {
                    var oRouter = UIComponent.getRouterFor(this);
                    oRouter.navTo("home");
                    setTimeout(
                      function () {
                        var oRouter = UIComponent.getRouterFor(this);
                        oRouter.navTo("home");

                        window.location.reload();
                      }.bind(this),
                      1000
                    );
                  }.bind(this),
                  1000
                );
              }.bind(this),
              error: function (xhr, status, error) {
                MessageToast.show(
                  "Er is een fout opgetreden bij het versturen van feedback: " +
                    error
                );
              },
            });
          }
        }
      },

      onSearch: function (oEvent) {
        var aFilters = [];
        var sQuery = oEvent.getSource().getValue();
        if (sQuery && sQuery.length > 0) {
          var filter = new Filter("title", FilterOperator.Contains, sQuery);
          aFilters.push(filter);
        }

        var oTable = this.getView().byId("sessionTable");
        var oBinding = oTable.getBinding("items");
        oBinding.filter(aFilters, "Application");
      },

      onSessionSelect: function (oEvent) {
        var oSelectedItem = oEvent.getSource();
        var sTitel = oSelectedItem.getCells()[0].getText();

        var sEndDate = oSelectedItem.getCells()[2].getText();
        var sEndTime = oSelectedItem.getCells()[4].getText();

        var oSelectedDateTime = new Date(sEndDate + " " + sEndTime);
        var oCurrentDateTime = new Date();

        if (oSelectedDateTime > oCurrentDateTime) {
          MessageToast.show("Deze sessie moet nog plaatsvinden");
        } else {
          var oSearchField = this.getView().byId("sessieZoekenInput");
          oSearchField.setValue(sTitel);
        }
      },
    });
  }
);
