sap.ui.define(
  [
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/m/MessageToast",
    "sap/ui/core/UIComponent",
    "sap/ui/model/odata/v2/ODataModel",
    "sap/m/MessageBox"
  ],
  function (Controller, JSONModel, MessageToast, UIComponent, ODataModel, MessageBox) {
    "use strict";

    return Controller.extend("flexso.controller.Register", {
      errorMessages: [], // Array to store error messages

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
      },

      // Function to display error message
      displayErrorMessage: function (message) {
        if (!this.errorMessages.includes(message)) {
          this.errorMessages.push(message);
          if (this.errorMessages.length === 1) {
            MessageBox.error(message, {
              onClose: function () {
                this.errorMessages.shift(); // Remove the displayed message from the array
              }.bind(this)
            });
          }
        }
      },

      onRegister: async function () {
        var that = this;
        this.errorMessages = []; // Reset error messages array
        var email = this.getView().byId("emailInput").getValue();
        var firstname = this.getView().byId("firstnameInput").getValue();
        var lastname = this.getView().byId("lastnameInput").getValue();
        var company = this.getView().byId("companyInput").getValue();
        // var role = this.getView().byId("roleInput").getValue();
        var bdatePicker = this.getView().byId("bdateInput");
        var bdate = bdatePicker.getDateValue(); // Get the selected date from the DatePicker control
        var password = this.getView().byId("passwordInput").getValue(); // Plain password
        var passwordRepeat = this.getView()
          .byId("confirmPasswordInput")
          .getValue();
        var street = this.getView().byId("streetInput").getValue();
        var hnumber = this.getView().byId("hnumberInput").getValue();
        var city = this.getView().byId("cityInput").getValue();
        var country = this.getView().byId("countryInput").getValue();
        var zip = this.getView().byId("zipInput").getValue();
        var phone = this.getView().byId("phoneInput").getValue();
        var gender = this.getView().byId("genderInput").getSelectedKey();

        function isValidEmail(email) {
          var emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
          return emailRegex.test(email);
        }

        if (!isValidEmail(email)) {
          this.displayErrorMessage(
            this.getView().getModel("i18n").getProperty("Invalidmail")
          );
          return; // Return to prevent further processing
        }

        if (password !== passwordRepeat) {
          this.displayErrorMessage(
            this.getView().getModel("i18n").getProperty("passwordmatch")
          );
          return; // Return to prevent further processing
        }

        if (!this.isPasswordStrong(password)) {
          this.displayErrorMessage(
            this.getView().getModel("i18n").getProperty("weakPassword")
          );
          return; // Return to prevent further processing
        }

        var requiredFields = [
          email,
          firstname,
          lastname,
          company,
          bdate,
          password,
          passwordRepeat,
          street,
          hnumber,
          city,
          country,
          zip,
          phone,
          gender,
        ];
        if (requiredFields.some((field) => !field)) {
          this.displayErrorMessage(
            this.getView().getModel("i18n").getProperty("fillinallfields")
          );
          return; // Return to prevent further processing
        }

        try {
          // Hash the password using SHA-256
          var hashedPassword = await this.sha256(password);

          var oDataModel = new ODataModel(
            "http://localhost:4004/odata/v2/catalog/",
            {
              json: true,
            }
          );

          var data = await new Promise((resolve, reject) => {
            oDataModel.read("/Users", {
              filters: [
                new sap.ui.model.Filter(
                  "email",
                  sap.ui.model.FilterOperator.EQ,
                  email
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
            this.displayErrorMessage(
              this.getView()
                .getModel("i18n")
                .getProperty("registrationfaileduser")
            );
          } else {
            // Format the date to YYYY-MM-DD format
            var formattedBdate = bdate.toISOString().split("T")[0];

            var requestData = {
              email: email,
              firstname: firstname,
              lastname: lastname,
              company: company,
              // role: role,
              bdate: formattedBdate, // Use the formatted date
              password: hashedPassword, // Send hashed password
              street: street,
              hnumber: hnumber,
              city: city,
              country: country,
              zip: zip,
              phone: phone,
              gender: gender,
            };
            await new Promise((resolve, reject) => {
              oDataModel.create("/Users", requestData, {
                success: function () {
                  MessageToast.show(
                    that.getView().getModel("i18n").getProperty("regsucces")
                  );
                  setTimeout(function () {
                    var oRouter = UIComponent.getRouterFor(that);
                    oRouter.navTo("login");
                    resolve();
                  }, 1000);
                },
                error: function (error) {
                  MessageToast.show(
                    this.getView().getModel("i18n").getProperty("regfailed") +
                      error.responseText
                  );
                  reject(error);
                },
              });
            });
          }
        } catch (error) {
          MessageToast.show(
            this.getView().getModel("i18n").getProperty("regerror") + error
          );
        }
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

      // SHA-256 hashing function
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

      isPasswordStrong: function (password) {
        if (password.length < 8) {
          return false;
        }

        if (!/[A-Z]/.test(password)) {
          return false;
        }

        if (!/[^A-Za-z0-9]/.test(password)) {
          return false;
        }

        return true;
      },

      togglePasswordVisibility: function (oEvent) {
        var oButton = oEvent.getSource();
        var oInput = this.getView().byId("passwordInput");
        var bVisible = oInput.getType() === "Password";
    
        // Toggle visibility
        oInput.setType(bVisible ? "Text" : "Password");
        oButton.setIcon(bVisible ? "sap-icon://hide" : "sap-icon://show");
      },

      togglePasswordVisibility2: function (oEvent) {
        var oButton = oEvent.getSource();
        var oInput = this.getView().byId("confirmPasswordInput");
        var bVisible = oInput.getType() === "Password";
    
        // Toggle visibility
        oInput.setType(bVisible ? "Text" : "Password");
        oButton.setIcon(bVisible ? "sap-icon://hide" : "sap-icon://show");
      },
    
    });
  }
);
