sap.ui.define(
  [
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/m/MessageToast",
    "sap/ui/core/UIComponent",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/ui/model/odata/v2/ODataModel",
  ],
  /**
   * @param {typeof sap.ui.core.mvc.Controller} Controller
   */
  function (Controller, JSONModel, MessageToast, UIComponent, Filter, FilterOperator, ODataModel) {
    "use strict";

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

        // var oDataModel = new ODataModel(
        //   "http://localhost:4004/odata/v2/catalog/",
        //   {
        //     json: true,
        //   }
        // );

        // oDataModel.read("/Sessions", {
        //   success: function (oData) {
        //     var oModel = new JSONModel(oData.results);
        //     this.getView().setModel(oModel, "sessionsModel");
        //   }.bind(this),
        // });

        var oSession = {
          Titel: "",
          Date: null,
          Time: null,
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

      onFeedback: function () {
        var that = this;
        var loginView = sap.ui.view({
          viewName: "flexso.view.Login",
          type: sap.ui.core.mvc.ViewType.XML,
        });
        oRouter = UIComponent.getRouterFor(this);
        var oLoginController = oRouter.getViews().byId("flexso.view.Login").getController();
        var username = oLoginController.getView().byId("usernameInput").getValue();

        var sessie = this.getView().byId("sessieZoekenInput").getValue();
        var oRatingIndicator = this.getView().byId("feedbackRating");
        var oTextArea = this.getView().byId("reviewTextArea");
        // var username = sap.ui.getCore().byId("loginPage").getController().username;
        ID = 1;
        var feedbackData = {
          FeedbackID: "fb"+ ID,
          Username: username,
          SessionTitle: sessie,
          Rating: oRatingIndicator.getValue(),
          Review: oTextArea.getValue(),
          FeedbackDate: new Date().toISOString() 
        };

        //var oDataModel = new ODataModel("http://localhost:4004/odata/v2/catalog/");

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
                success: function () {
                  MessageToast.show("Bedankt voor uw feedback!");
                  setTimeout(
                    function () {
                      var oRouter = UIComponent.getRouterFor(this);
                      oRouter.navTo("home");
                    }.bind(this),
                    1000);
                    ID++;
                },
                error: function (xhr, status, error) {
                  MessageToast.show("Er is een fout opgetreden bij het versturen van feedback: " + error);
                }
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
                  }.bind(this),
                  1000);
              },
              error: function (xhr, status, error) {
                MessageToast.show("Er is een fout opgetreden bij het versturen van feedback: " + error);
              }
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

      onSessionSelect: function(oEvent) {
        var oSelectedItem = oEvent.getSource();
        var sTitel = oSelectedItem.getCells()[0].getText();



        // datum en tijd ophalen van geselecteerde item
        var sDate = oSelectedItem.getCells()[1].getText();
        var sTime = oSelectedItem.getCells()[2].getText();

        var oSelectedDateTime = new Date(sDate + " " + sTime);
        var oCurrentDateTime = new Date();

        if (oSelectedDateTime > oCurrentDateTime) {
          MessageToast.show("Deze sessie moet nog plaatsvinden");
        } else {
          var oSearchField = this.getView().byId("sessieZoekenInput");
          oSearchField.setValue(sTitel);
        }

        
      }
    });
  }
);
