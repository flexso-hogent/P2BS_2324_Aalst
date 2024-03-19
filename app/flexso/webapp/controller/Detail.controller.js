// Detail Controller
sap.ui.define(["sap/ui/core/mvc/Controller"], function (Controller) {
  "use strict";

  return Controller.extend("flexso.controller.Detail", {
    onInit: function () {
      var router = this.getOwnerComponent().getRouter();
      router
        .getRoute("details")
        .attachPatternMatched(this._onObjectMatched, this);
    },

    _onObjectMatched: function (event) {
      var id = event.getParameter("arguments").id;
      // Fetch data for the detail view based on the id
      // Update the detail view with the fetched data
    },
  });
});
