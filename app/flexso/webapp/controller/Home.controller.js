sap.ui.define(
  [
    "sap/ui/core/mvc/Controller",
    "sap/ui/core/UIComponent",
    "sap/ui/model/json/JSONModel",
  ],
  function (Controller, UIComponent, JSONModel) {
    "use strict";

    return Controller.extend("flexso.controller.Home", {
      onInit: function () {
        var oProfileImagePath = jQuery.sap.getModulePath(
          "flexso",
          "/images/profile.jpg"
        );
        var oImageModel = new JSONModel({
          profileImagePath: oProfileImagePath,
        });

        this.getView().setModel(oImageModel, "imageModel");
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
    });
  }
);
