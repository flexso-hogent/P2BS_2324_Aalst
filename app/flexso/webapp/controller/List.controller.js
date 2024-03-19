// List Controller
sap.ui.define(["sap/ui/core/mvc/Controller"], function (Controller) {
  "use strict";

  return Controller.extend("flexso.controller.List", {
    onListItemPress: function (event) {
      // Handle list item press event
      var selectedItem = event.getSource().getBindingContext().getObject();
      // Navigate to detail view and pass selected item data
      this.getOwnerComponent().getRouter().navTo("details", {
        id: selectedItem.id,
      });
    },
  });
});
