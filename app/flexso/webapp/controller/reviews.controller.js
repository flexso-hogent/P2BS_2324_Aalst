sap.ui.define(
  ["sap/ui/core/mvc/Controller", "sap/ui/model/json/JSONModel"],
  function (Controller, JSONModel) {
    "use strict";

    return Controller.extend("flexso.controller.Reviews", {
      onInit: function () {
        var oModel = new JSONModel({
          reviews: [
            {
              reviewerName: "John Doe",
              reviewText: "Great product!",
              date: "2024-05-01",
            },
            {
              reviewerName: "Jane Smith",
              reviewText: "Could be better.",
              date: "2024-05-02",
            },
          ],
        });
        this.getView().setModel(oModel, "reviews");
      },
    });
  }
);
