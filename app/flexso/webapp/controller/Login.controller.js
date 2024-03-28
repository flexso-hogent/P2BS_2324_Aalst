sap.ui.define(
  [
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/m/MessageToast",
    "sap/ui/core/UIComponent",
    "sap/ui/model/odata/v2/ODataModel",
  ],
  function (Controller, JSONModel, MessageToast, UIComponent, ODataModel) {
    "use strict";

    return Controller.extend("flexso.controller.Login", {
      onInit: function () {
        var oRootPath = jQuery.sap.getModulePath(
          "flexso",
          "/images/Flexso.png"
        );
        var oProfileImagePath = jQuery.sap.getModulePath(
          "flexso",
          "/images/profile.jpg"
        );
        var oImageModel = new JSONModel({
          path: oRootPath,
          profileImagePath: oProfileImagePath,
        });

        this.getView().setModel(oImageModel, "imageModel");

        //Stay logged in button
        var stayLoggedIn = localStorage.getItem("stayLoggedIn");
        if (stayLoggedIn && stayLoggedIn === "true") {
          this.getView().byId("stayLoggedInCheckbox").setSelected(true);
        }
      },

      onLoginPress: async function () {
        var username = this.getView().byId("usernameInput").getValue();
        var password = this.getView().byId("passwordInput").getValue();
        var stayLoggedIn = this.getView()
          .byId("stayLoggedInCheckbox")
          .getSelected();

        var oDataModel = new ODataModel(
          "http://localhost:4004/odata/v2/catalog/",
          { json: true }
        );

        try {
          var data = await new Promise((resolve, reject) => {
            oDataModel.read("/Users", {
              filters: [
                new sap.ui.model.Filter(
                  "email",
                  sap.ui.model.FilterOperator.EQ,
                  username
                ),
              ],
              success: function (data) {
                resolve(data);
              },
              error: function (xhr, status, error) {
                reject(error);
              },
            });
          });

          if (data.results && data.results.length > 0) {
            var user = data.results[0];
            var hashedPassword = await this.sha256(password);

            if (user.password === hashedPassword) {
              MessageToast.show("Login successful");

              // Store user information in local storage
              localStorage.setItem("email", user.email);
              localStorage.setItem("firstname", user.firstname);
              localStorage.setItem("lastname", user.lastname);
              localStorage.setItem("role", user.role);
              localStorage.setItem("company", user.company);
              localStorage.setItem("userID", user.ID);
              localStorage.setItem("bdate", user.bdate);
              localStorage.setItem("street", user.street);
              localStorage.setItem("hnumber", user.hnumber);
              localStorage.setItem("city", user.city);
              localStorage.setItem("country", user.country);
              localStorage.setItem("zip", user.zip);
              localStorage.setItem("phone", user.phone);
              localStorage.setItem("gender", user.gender);
              localStorage.setItem("stayLoggedIn", stayLoggedIn);

              setTimeout(() => {
                var oRouter = UIComponent.getRouterFor(this);
                oRouter.navTo("home");
              }, 1000);
            } else {
              MessageToast.show("User or password is wrong. Please try again.");
            }
          } else {
            MessageToast.show(
              "User or password is wrong. Please register first."
            );
          }
        } catch (error) {
          MessageToast.show("Error checking user existence: " + error);
        }
      },
      sha256: function (message) {
        // Convert message to ArrayBuffer
        var buffer = new TextEncoder().encode(message);
        // Hash the ArrayBuffer
        return crypto.subtle.digest("SHA-256", buffer).then(function (hash) {
          return Array.prototype.map
            .call(new Uint8Array(hash), function (x) {
              return ("00" + x.toString(16)).slice(-2);
            })
            .join("");
        });
      },

      onRegisterPress: function () {
        var oRouter = UIComponent.getRouterFor(this);
        oRouter.navTo("register");
      },

      onForgotPasswordPress: function () {
        var oRouter = UIComponent.getRouterFor(this);
        oRouter.navTo("wachtwoordVergeten");
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
    });
  }
);
