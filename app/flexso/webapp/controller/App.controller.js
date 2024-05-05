sap.ui.define(
  ["sap/ui/core/mvc/Controller"],
  /**
   * @param {typeof sap.ui.core.mvc.Controller} Controller
   */
  function (Controller) {
    "use strict";

    return Controller.extend("flexso.controller.App", {
      onInit: function () {
        this.getOwnerComponent().getRouter().initialize();
        this.getOwnerComponent().getRouter().navTo("List");
      },
      onSwitchToFrench: function () {
        var oResourceModel = this.getView().getModel("i18n");
        oResourceModel.sLocale = "fr";
        sap.ui.getCore().getConfiguration().setLanguage("fr");
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
    });
  }
);
