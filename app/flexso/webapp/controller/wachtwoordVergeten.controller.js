sap.ui.define(
  [
    "sap/ui/core/mvc/Controller",
    "sap/m/MessageToast",
    "sap/ui/core/UIComponent",
  ],
  function (Controller, MessageToast, UIComponent) {
    "use strict";

    return Controller.extend("flexso.controller.wachtwoordVergeten", {
      onInit: function () {},

      onSendPasswordResetEmail: function () {
        var that = this; // Capture the reference to the controller instance
        var emailInput = this.getView().byId("emailInput");
        var userEmail = emailInput.getValue();

        // Validate email format
        if (!this.isValidEmail(userEmail)) {
          MessageToast.show("Please enter a valid email address.");
          return;
        }

        // Check if the email exists in the database
        this.checkEmailExists(userEmail, that);
      },

      isValidEmail: function (email) {
        // Regular expression to validate email format
        var emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
      },

      checkEmailExists: function (email, controller) {
        $.ajax({
          url: "http://localhost:4004/odata/v4/catalog/Users",
          method: "GET",
          data: { $filter: "email eq '" + email + "'" },
          success: function (response) {
            if (response && response.value && response.value.length > 0) {
              $.ajax({
                url: "http://localhost:4004/odata/v4/catalog/PasswordReset",
                method: "POST",
                contentType: "application/json",
                data: JSON.stringify({ userEmail: email }),
                success: function (response) {
                  MessageToast.show("Password reset email sent to: " + email);

                  setTimeout(function () {
                    var oRouter = UIComponent.getRouterFor(
                      controller.getView()
                    );
                    oRouter.navTo("login");
                  }, 2000);
                },
                error: function (error) {
                  MessageToast.show("Failed to send password reset email.");
                  console.error("Error:", error);
                },
              });
            } else {
              MessageToast.show("You are not registered yet.");
            }
          },
          error: function (error) {
            MessageToast.show("Failed to check email existence.");
            console.error("Error:", error);
          },
        });
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
