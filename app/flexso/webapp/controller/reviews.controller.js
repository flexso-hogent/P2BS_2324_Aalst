sap.ui.define(
  [
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/m/MessageToast",
    "sap/ui/core/UIComponent",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
  ],
  function (
    Controller,
    JSONModel,
    MessageToast,
    UIComponent,
    Filter,
    FilterOperator
  ) {
    "use strict";

    return Controller.extend("flexso.controller.Reviews", {
      onInit: function () {
        var oRouter = this.getOwnerComponent().getRouter();
        oRouter.getRoute("reviews").attachMatched(this._onRouteMatched, this);
      },

      _onRouteMatched: function (oEvent) {
        var sSessionTitle = oEvent.getParameter("arguments").sessionTitle;
        console.log("Session title:", sSessionTitle);

        // Voer de logica uit om beoordelingen op te halen voor de sessie met de sessie-ID
        this._fetchReviews(sSessionTitle);
      },

      onSwitchToEnglish: function () {
        var oResourceModel = this.getView().getModel("i18n");
        oResourceModel.sLocale = "en";
        sap.ui.getCore().getConfiguration().setLanguage("en");
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

      onLogoutPress: function () {
        var that = this;
        sap.m.MessageBox.confirm(
          this.getView().getModel("i18n").getProperty("logout"),
          {
            title: "Confirm",
            onClose: function (oAction) {
              if (oAction === sap.m.MessageBox.Action.OK) {
                localStorage.clear();
                var oRouter = UIComponent.getRouterFor(that);
                oRouter.navTo("login");
              }
            },
          }
        );
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

        // Reload the page instantly
        window.location.reload(true); // Pass true to reload the page from the server, bypassing the cache
      },

      onProfileButtonClick: function () {
        var oRouter = UIComponent.getRouterFor(this);
        oRouter.navTo("profile");
      },
      _fetchReviews: function (sSessionTitle) {
        var that = this;
        var aReviewsData = [];

        console.log("Fetching reviews for session title: " + sSessionTitle);

        // Fetch reviews for the selected session
        jQuery.ajax({
          url: "http://localhost:4004/odata/v4/catalog/Feedback",
          dataType: "json",
          data: {
            $filter: "SessionTitle eq '" + sSessionTitle + "'",
          },
          success: function (data) {
            console.log("Received reviews data:", data);
            var aFeedbacks = data.value;

            // Iterate through each feedback and push it to the reviews data array
            aFeedbacks.forEach(function (feedback) {
              var reviewData = {
                UserEmail: feedback.Username,
                Rating: feedback.Rating,
                Review: feedback.Review,
              };
              aReviewsData.push(reviewData);
            });

            // Set the reviews model with the collected data
            var oReviewsModel = new sap.ui.model.json.JSONModel(aReviewsData);
            that.getView().setModel(oReviewsModel, "reviews");
          },
          error: function (xhr, status, error) {
            sap.m.MessageToast.show("Failed to fetch reviews: " + error);
          },
        });
      },

      onSortPress: function () {
        var oBinding = this.getView().byId("_IDGenTable1").getBinding("items");
        var oSorter = oBinding.aSorters || [];

        var bDescending = !oSorter[0] || !oSorter[0].bDescending;

        oBinding.sort(
          new sap.ui.model.Sorter({
            path: "Rating",
            descending: bDescending,
            sorter: function (a, b){
              var aRating = a.getProperty("Rating");
              var bRating = b.getProperty("Rating");
              return bRating - aRating;
            },
          })
        );
      },

      onSearch: function (oEvent) {
        var sQuery = oEvent.getParameter("newValue");
        var oFilter = new Filter({
          filters: [
            new Filter(
              "UserEmail",
              FilterOperator.Contains,
              sQuery
            ),
          ],
          and: false,
        });
        var oBinding = this.getView().byId("_IDGenTable1").getBinding("items");
        oBinding.filter([oFilter]);
      },
    });
  }
);
