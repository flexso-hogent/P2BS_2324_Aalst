sap.ui.define(
  [
    "sap/ui/core/mvc/Controller",
    "sap/m/MessageToast",
    "sap/ui/core/UIComponent",
    "sap/ui/core/Fragment",
  ],
  function (Controller, MessageToast, UIComponent, Fragment) {
    "use strict";

    return Controller.extend("flexso.controller.PasswordReset", {
      onInit: function () {},

      onSendPasswordResetEmail: function () {
        var that = this;

        sap.m.MessageBox.confirm(
          "Are you sure you want to reset your password?",
          {
            title: "Confirmation",
            onClose: function (oAction) {
              if (oAction === sap.m.MessageBox.Action.OK) {
                var email = that.getView().byId("emailInput").getValue();
                var oldPassword = that
                  .getView()
                  .byId("oldPasswordInput")
                  .getValue();
                var newPassword = that
                  .getView()
                  .byId("newPasswordInput")
                  .getValue();
                var confirmPassword = that
                  .getView()
                  .byId("confirmPasswordInput")
                  .getValue();

                if (
                  !email ||
                  !oldPassword ||
                  !newPassword ||
                  !confirmPassword
                ) {
                  MessageToast.show("Please fill in all fields.");
                  return;
                }

                if (!that.isValidEmail(email)) {
                  MessageToast.show("Please enter a valid email address.");
                  return;
                }

                // Check if new password and confirm password match
                if (newPassword !== confirmPassword) {
                  MessageToast.show(
                    "New password and confirm password do not match."
                  );
                  return;
                }

                // Hash the old password using SHA-256
                that.sha256(oldPassword).then(function (hashedOldPassword) {
                  // Retrieve user data from the database
                  var userDataUrl =
                    "http://localhost:4004/odata/v4/catalog/Users?$filter=email eq '" +
                    email +
                    "' and password eq '" +
                    hashedOldPassword +
                    "'";
                  $.ajax({
                    url: userDataUrl,
                    type: "GET",
                    success: function (data) {
                      if (data.value.length > 0) {
                        // User found, update the password
                        var userId = data.value[0].userID;
                        var updateUserUrl =
                          "http://localhost:4004/odata/v4/catalog/Users(" +
                          userId +
                          ")";
                        // Hash the new password using SHA-256
                        that
                          .sha256(newPassword)
                          .then(function (hashedNewPassword) {
                            $.ajax({
                              url: updateUserUrl,
                              type: "PATCH",
                              contentType: "application/json",
                              data: JSON.stringify({
                                password: hashedNewPassword,
                              }),
                              success: function () {
                                MessageToast.show(
                                  "Password updated successfully"
                                );
                                setTimeout(function () {
                                  var oRouter = UIComponent.getRouterFor(that);
                                  oRouter.navTo("login");
                                }, 1000);
                              },
                              error: function (xhr, status, error) {
                                sap.m.MessageBox.error(
                                  "Failed to update password: " + error
                                );
                              },
                            });
                          });
                      } else {
                        MessageToast.show("Error check your input.");
                      }
                    },
                    error: function (xhr, status, error) {
                      sap.m.MessageBox.error(
                        "Failed to retrieve user data: " + error
                      );
                    },
                  });
                });
              }
            },
          }
        );
      },

      isValidEmail: function (email) {
        var emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
      },

      // Function to hash the password using SHA-256
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

      onDropdownPress: function (oEvent) {
        var oButton = oEvent.getSource();
        var oPopover = this.getView().byId("popover");
        if (!oPopover.isOpen()) {
          oPopover.openBy(oButton);
        } else {
          oPopover.close();
        }
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
        oRouter.navTo("login");
      },
    });
  }
);
