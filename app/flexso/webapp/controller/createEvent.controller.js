sap.ui.define(
  [
    "sap/ui/core/mvc/Controller",
    "sap/ui/core/UIComponent",
    "sap/ui/model/json/JSONModel",
    "sap/m/MessageToast",
    "sap/ui/model/odata/v2/ODataModel",
  ],
  function (Controller, UIComponent, JSONModel, MessageToast, ODataModel) {
    "use strict";

    return Controller.extend("flexso.controller.CreateEvent", {
      onInit: function () {
        var oViewModel = new JSONModel({
          name: "",
          startDate: null,
          endDate: null,
          location: "",
          description: "",
        });
        this.getView().setModel(oViewModel);
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

      onRegisterPress: function () {
        console.log("Register button clicked");
        var oViewModel = this.getView().getModel();
        var oEventData = oViewModel.getData();

        var that = this;

        if (
          !oEventData.name ||
          !oEventData.startDate ||
          !oEventData.endDate ||
          !oEventData.location ||
          !oEventData.description
        ) {
          MessageToast.show("Please fill in all fields.");
          return;
        }

        if (oEventData.startDate) {
          oEventData.startDate = this.formatDate(oEventData.startDate);
        }
        if (oEventData.endDate) {
          oEventData.endDate = this.formatDate(oEventData.endDate);
        }

        var oDataModel = new ODataModel(
          "http://localhost:4004/odata/v2/catalog/",
          {
            json: true,
          }
        );

        oDataModel.read("/Events", {
          filters: [
            new sap.ui.model.Filter(
              "name",
              sap.ui.model.FilterOperator.EQ,
              oEventData.name
            ),
          ],
          success: function (data) {
            if (data.results && data.results.length > 0) {
              MessageToast.show(
                "Event registration failed! Event already exists."
              );
            } else {
              oDataModel.create("/Events", oEventData, {
                success: function () {
                  MessageToast.show("Event registration successful!");
                  setTimeout(function () {
                    var oRouter = UIComponent.getRouterFor(that);
                    oRouter.navTo("home");
                    oViewModel.setData({
                      name: "",
                      startDate: null,
                      endDate: null,
                      location: "",
                      description: "",
                    });
                  }, 1000);
                },
                error: function (error) {
                  MessageToast.show("Event registration failed: ");
                },
              });
            }
          },
          error: function (xhr, status, error) {
            MessageToast.show(
              "Error checking event existence: " + error.responseText
            );
          },
        });
      },

      formatDate: function (dateString) {
        var date = new Date(dateString);
        var year = date.getFullYear();
        var month = String(date.getMonth() + 1).padStart(2, "0");
        var day = String(date.getDate()).padStart(2, "0");
        var formattedDate = year + "-" + month + "-" + day;
        return formattedDate;
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

      onProfileButtonClick: function () {
        var oRouter = UIComponent.getRouterFor(this);
        oRouter.navTo("profile");
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
