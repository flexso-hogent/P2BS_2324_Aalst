sap.ui.define(
    ["sap/ui/core/mvc/Controller","sap/ui/model/json/JSONModel"],
    /**
     * @param {typeof sap.ui.core.mvc.Controller} Controller
     */
    function (Controller, JSONModel) {
      "use strict";
  
      return Controller.extend("flexso.controller.Register", {
        onInit: function () {
            var oRootPath = jQuery.sap.getModulePath(
                "flexso", 
                "/images/Flexso.png"
                );
            
            var oImageModel = new JSONModel({
                path: oRootPath
            });
            this.getView().setModel(oImageModel, "imageModel");
        },
      });
    }
  );
  