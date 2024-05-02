sap.ui.define(
  [
    "sap/ui/core/mvc/Controller",
    "sap/m/MessageToast",
    "sap/m/MessageBox",
    "sap/ui/core/UIComponent",
    "sap/ui/core/Fragment",
  ],
  function (Controller, MessageToast, MessageBox, UIComponent, Fragment) {
    "use strict";

    return Controller.extend("flexso.controller.PasswordReset", {
      onInit: function () {},

      togglePasswordVisibility: function (oEvent) {
        var sButtonId = oEvent.getSource().getId();
        var sInputId = "";

        // Determine which input field corresponds to the pressed button
        switch (sButtonId) {
          case this.getView().createId("_IDGenButton2"):
            sInputId = this.getView().createId("oldPasswordInput");
            break;
          case this.getView().createId("_IDGenButton3"):
            sInputId = this.getView().createId("newPasswordInput");
            break;
          case this.getView().createId("_IDGenButton4"):
            sInputId = this.getView().createId("confirmPasswordInput");
            break;
          default:
            break;
        }

        // Get the corresponding input field
        var oInput = this.byId(sInputId);
        if (!oInput) {
          return;
        }

        // Toggle password visibility
        var sType = oInput.getType();
        if (sType === "Password") {
          oInput.setType("Text");
          oEvent.getSource().setIcon("sap-icon://hide");
        } else {
          oInput.setType("Password");
          oEvent.getSource().setIcon("sap-icon://show");
        }
      },
      onSendPasswordResetEmail: function () {
        var that = this;

        sap.m.MessageBox.confirm(
          this.getView().getModel("i18n").getProperty("confirmResetPassword"),
          {
            title: this.getView().getModel("i18n").getProperty("confirmation"),
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
                  MessageBox.error(
                    that
                      .getView()
                      .getModel("i18n")
                      .getProperty("feedbackCreateSession")
                  );
                  return;
                }

                if (!that.isValidEmail(email)) {
                  MessageBox.error(
                    that.getView().getModel("i18n").getProperty("Invalidmail")
                  );
                  return;
                }

                if (newPassword !== confirmPassword) {
                  MessageBox.error(
                    that.getView().getModel("i18n").getProperty("Invalidpass")
                  );
                  return;
                }

                // Check if the password contains at least one uppercase letter and one special character
                if (
                  !/(?=.*[A-Z])(?=.*[!@#$%^&*()_+])[a-zA-Z0-9!@#$%^&*()_+]{8,}/.test(
                    newPassword
                  )
                ) {
                  MessageBox.error(
                    that
                      .getView()
                      .getModel("i18n")
                      .getProperty("passwordRequirementsNotMet")
                  );
                  return;
                }

                that.sha256(oldPassword).then(function (hashedOldPassword) {
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
                        var userId = data.value[0].userID;
                        var updateUserUrl =
                          "http://localhost:4004/odata/v4/catalog/Users(" +
                          userId +
                          ")";
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
                                  that
                                    .getView()
                                    .getModel("i18n")
                                    .getProperty("passwordUpdatedSuccessfully")
                                );
                                setTimeout(function () {
                                  var oRouter = UIComponent.getRouterFor(that);
                                  oRouter.navTo("login");
                                }, 1000);
                              },
                              error: function (xhr, status, error) {
                                MessageBox.error(
                                  that
                                    .getView()
                                    .getModel("i18n")
                                    .getProperty("passwordUpdateFailed") + error
                                );
                              },
                            });
                          });
                      } else {
                        MessageToast.show(
                          that
                            .getView()
                            .getModel("i18n")
                            .getProperty("errorCheckInput")
                        );
                      }
                    },
                    error: function (xhr, status, error) {
                      MessageBox.error(
                        that
                          .getView()
                          .getModel("i18n")
                          .getProperty("userDataRetrievalFailed") + error
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

      sha256: function (message) {
        var buffer = new TextEncoder().encode(message);
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
