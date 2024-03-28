sap.ui.define(
  [
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/ui/model/resource/ResourceModel",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
  ],
  function (Controller, JSONModel, ResourceModel, Filter, FilterOperator) {
    "use strict";

    return Controller.extend("flexso.controller.Event", {
      onInit: function () {
        var i18nModel = new ResourceModel({
          bundleName: "flexso.i18n.i18n",
        });
        this.getView().setModel(i18nModel, "i18n");

        var imageModel = new JSONModel({
          profileImagePath: "path_to_default_image",
        });
        this.getView().setModel(imageModel, "imageModel");

        var csvFilePath = "db/my.project-Events.csv";
        this._loadCSVData(csvFilePath);
      },

      _loadCSVData: function (filePath) {
        var jsonData = parseCSVData(filePath);
        var eventsModel = new JSONModel();
        eventsModel.setData(jsonData);
        this.getView().setModel(eventsModel, "eventsModel");
      },

      onSwitchToEnglish: function () {},

      onSwitchToDutch: function () {},

      onProfileButtonClick: function () {},

      onCreateEvent: function () {},

      onSearch: function (event) {
        var query = event.getParameter("query");
        var list = this.getView().byId("eventList");
        var binding = list.getBinding("items");
        var filters = [];
        if (query && query.length > 0) {
          var titleFilter = new Filter("title", FilterOperator.Contains, query);
          filters.push(titleFilter);
        }
        binding.filter(filters);
      },

      onFilterChange: function (event) {
        var selectedKey = event.getParameter("selectedItem").getKey();
        var list = this.getView().byId("eventList");
        var binding = list.getBinding("items");
        var filters = [];
        if (selectedKey && selectedKey !== "all") {
          var filter = new Filter(
            "filterProperty",
            FilterOperator.EQ,
            selectedKey
          );
          filters.push(filter);
        }
        binding.filter(filters);
      },

      onEventPress: function (event) {},
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
