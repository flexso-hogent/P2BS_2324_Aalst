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
        var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
        oRouter.getRoute("reviews").attachMatched(this._onRouteMatched, this);
      },

      _onRouteMatched: function (oEvent) {
        var oArgs = oEvent.getParameter("arguments");
        var sSessionID = oArgs.sessionID;
    
        // Fetch reviews for the selected session
        this._fetchReviews(sSessionID);
      },

      _fetchReviews: function (sSessionID) {
        var that = this;
        var aReviewsData = [];
    
        // Fetch reviews for the selected session
        jQuery.ajax({
            url: "http://localhost:4004/odata/v4/catalog/Feedback",
            dataType: "json",
            data: {
                $filter: "SessionID eq '" + sSessionID + "'",
            },
            success: function (data) {
                var aFeedbacks = data.value;
                var promises = [];
    
                // Iterate through each feedback to fetch user details
                aFeedbacks.forEach(function (feedback) {
                    var promise = new Promise(function (resolve, reject) {
                        jQuery.ajax({
                            url: "http://localhost:4004/odata/v4/catalog/Users(" + feedback.userID + ")",
                            dataType: "json",
                            success: function (userData) {
                                var reviewData = {
                                    Username: userData.firstname + " " + userData.lastname,
                                    UserEmail: userData.email,
                                    Rating: feedback.Rating,
                                    Review: feedback.Review,
                                };
                                aReviewsData.push(reviewData);
                                resolve();
                            },
                            error: function (xhr, status, error) {
                                reject(error);
                            },
                        });
                    });
                    promises.push(promise);
                });
    
                // Once all user details are fetched, set the reviews model
                Promise.all(promises)
                    .then(function () {
                        var oReviewsModel = new sap.ui.model.json.JSONModel(aReviewsData);
                        that.getView().setModel(oReviewsModel, "reviews");
                    })
                    .catch(function (error) {
                        sap.m.MessageToast.show("Failed to fetch user details: " + error);
                    });
            },
            error: function (xhr, status, error) {
                sap.m.MessageToast.show("Failed to fetch reviews: " + error);
            },
        });
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
        sap.m.MessageBox.confirm(this.getView().getModel("i18n").getProperty("logout"), {
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
    });
  }
);
