sap.ui.define(
  [
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/m/MessageToast",
    "sap/ui/core/UIComponent",
  ],
  /**
   * @param {typeof sap.ui.core.mvc.Controller} Controller
   */
  function (Controller, JSONModel, MessageToast, UIComponent) {
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
        var sessie = this.getView().byId("sessieZoekenInput").getValue();
        var oRatingIndicator = this.getView().byId("feedbackRating");
        var oTextArea = this.getView().byId("reviewTextArea");

        if (sessie === "") {
          MessageToast.show("Gelieve een sessie in te geven");
        } else if (oRatingIndicator.getValue() === 0) {
          MessageToast.show("Gelieve een rating in te geven");
        } else {
          if (oRatingIndicator.getValue() <= 2) {
            if (oTextArea.getValue() === "") {
              MessageToast.show("Gelieve een review in te geven");
            } else {
              MessageToast.show("Bedankt voor uw feedback!");
              setTimeout(
                function () {
                  var oRouter = UIComponent.getRouterFor(this);
                  oRouter.navTo("home");
                }.bind(this),
                1000
              );
            }
          } else {
            MessageToast.show("Bedankt voor uw feedback!");
            setTimeout(
              function () {
                var oRouter = UIComponent.getRouterFor(this);
                oRouter.navTo("home");
              }.bind(this),
              1000
            );
          }
        }
      },

      // onSearch: function (eEvent) {
      //   var aFilters = [];
      //   var sQuery = eEvent.getSource().getValue();
      //   if (sQuery && sQuery.length > 0) {
      //     var filter = new Filter("carrID", FilterOperator.Contains, sQuery);
      //     aFilters.push(filter);
      //   }

      //   var oTable = this.byId("idFlightsTable");
      //   var oBinding = oTable.getBinding("items");
      //   oBinding.filter(aFilters, "Application");
      // }
    });
  }
);
