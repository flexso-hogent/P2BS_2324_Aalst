sap.ui.define(
  [
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/m/MessageToast",
  ],
  function (Controller, JSONModel, MessageToast) {
    "use strict";

    return Controller.extend("flexso.controller.AllFeedback", {
      onInit: function () {
        // Fetch feedback data
        this.fetchFeedbackData();
      },
      onSearch: function (oEvent) {
        var sQuery = oEvent.getParameter("newValue");
        var oFilter = new sap.ui.model.Filter({
          filters: [
            new sap.ui.model.Filter(
              "SessionTitle",
              sap.ui.model.FilterOperator.Contains,
              sQuery
            ),
          ],
          and: false,
        });
        var oBinding = this.getView().byId("_IDGenTable1").getBinding("items");
        oBinding.filter([oFilter]);
      },

      fetchFeedbackData: function () {
        // Get the logged-in user's email address
        var loggedInUserEmail = localStorage.getItem("email");

        // Replace this with your actual service URL
        var feedbackServiceURL =
          "http://localhost:4004/odata/v4/catalog/Feedback";

        // Construct the filter based on the logged-in user's email
        var filter = "$filter=Username eq '" + loggedInUserEmail + "'";

        // Append the filter to the service URL
        feedbackServiceURL += "?" + filter;

        $.ajax({
          url: feedbackServiceURL,
          type: "GET",
          success: function (data) {
            // Reverse the order of feedback
            var reversedFeedback = data.value.reverse();

            // Update the model with feedback data
            var oModel = new JSONModel(reversedFeedback);
            this.getView().setModel(oModel, "feedbackModel");
          }.bind(this),
          error: function (xhr, status, error) {
            MessageToast.show( this.getView().getModel("i18n").getProperty("errorFetchFeedbackdata") + error);
          },
        });
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

      onProfileButtonClick: function () {
        var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
        oRouter.navTo("profile");
      },

      onLogoutPress: function () {
        var that = this;
        sap.m.MessageBox.confirm( this.getView().getModel("i18n").getProperty("logout"), {
          title: "Confirm",
          onClose: function (oAction) {
            if (oAction === sap.m.MessageBox.Action.OK) {
              localStorage.clear();
              var oRouter = sap.ui.core.UIComponent.getRouterFor(that);
              oRouter.navTo("login");
            }
          },
        });
      },

      onBackToHome: function () {
        var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
        oRouter.navTo("home");
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
        var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
        oRouter.navTo("home");
      },
      onSortPress: function () {
        // Get the table binding
        var oBinding = this.getView().byId("_IDGenTable1").getBinding("items");

        // Get the current sort settings
        var oSorter = oBinding.aSorters || [];

        // Toggle sorting direction between ascending and descending
        var bDescending = !oSorter[0] || !oSorter[0].bDescending;

        // Apply custom sorting based on the number of stars
        oBinding.sort(
          new sap.ui.model.Sorter({
            path: "Rating",
            descending: bDescending,
            sorter: function (a, b) {
              var aRating = a.getProperty("Rating");
              var bRating = b.getProperty("Rating");
              return bRating - aRating; // Sorting in descending order based on the number of stars
            },
          })
        );
      },
    });
  }
);
