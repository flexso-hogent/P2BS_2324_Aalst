<mvc:View
  xmlns:mvc="sap.ui.core.mvc"
  xmlns="sap.m"
  controllerName="flexso.controller.Overview"
>
  <Page id="overviewPage" title="{i18n>overview}">
    <headerContent>
      <Toolbar id="_IDGenToolbar1">
        <ToolbarSpacer id="_IDGenToolbarSpacer1" />
        <Button
          id="languageButton"
          icon="sap-icon://globe"
          press="onDropdownPress"
        />
        <Button
          id="_IDGenButton3"
          icon="sap-icon://home"
          press="onBackToHome"
        />
        <Button
          id="_IDGenButton4"
          icon="sap-icon://person-placeholder"
          press="onProfileButtonClick"
        />
        <Button
          id="_IDGenButton5"
          icon="sap-icon://log"
          press="onLogoutPress"
        />
      </Toolbar>
    </headerContent>

    <content>
      <FlexBox id="_IDGenFlexBox1" alignItems="Start">
        <VBox width="100%" id="eventBox">
          <Title id="overviewTitleP" text="{i18n>OverviewTitle}" />
          <SearchField
            id="overviewSearchFieldP"
            search="onSearch"
            liveChange="onSearchLiveChange"
            placeholder="{i18n>Search}"
            width="100%"
          />

          <List
            id="overviewListP"
            items="{ path: 'eventModel>/' }"
            noDataText="{i18n>noData}"
            selectionChange="onEventSelect"
          >
            <items>
              <CustomListItem id="_IDGenCustomListItem1">
                <HBox id="_IDGenHBox1" class="hBoxClickable">
                  <VBox id="_IDGenVBox1">
                    <Label id="_IDGenLabel7" text="{eventModel>Name}" />
                    <HBox id="_IDGenHBox3">
                      <Label
                        id="datum"
                        text="{eventModel>SDate} {i18n>until} {eventModel>EDate} "
                      ></Label>
                    </HBox>
                    <Label
                      id="_IDGenLabel10"
                      text="{i18n>Location}: {eventModel>location}"
                    />
                    <Text
                      id="_IDGenText5"
                      text="{i18n>description}: {eventModel>description}"
                      width="95%"
                    />
                  </VBox>
                </HBox>
                <Button
                  id="_IDGenButton1"
                  text="{i18n>EventSessions}"
                  press="onViewSessionsPress"
                />
              </CustomListItem>
            </items>
          </List>
        </VBox>

        <VBox width="100%" id="sessionsBox" visible="false">
          <HBox id="_IDGenHBox2">
            <VBox id="_IDGenVBox4" width="100%">
              <Title id="_IDGenTitle2" text="{i18n>OverviewSessions}" />
              <Button
                id="expandSessionsButton"
                icon="sap-icon://slim-arrow-left"
                press="onExpandSessionsPress"
              />

              <VBox id="sessionInfoBox" visible="false">
                <List
                  id="sessionsList"
                  items="{ path: 'sessionModel>/' }"
                  selectionChange="onSessionSelect"
                >
                  <items>
                    <CustomListItem
                      id="sessionListItem"
                      press="onSessionSelect"
                    >
                      <HBox id="_IDGenHBox4" class="hBoxClickable">
                        <VBox id="_IDGenVBox5">
                          <Label
                            id="_IDGenLabel11"
                            text="{sessionModel>title}"
                          />
                          <HBox id="_IDGenHBox5">
                            <Label
                              id="_IDGenLabel12"
                              text="{i18n>StartDate}: "
                            />
                            <Text
                              id="_IDGenDatePicker3"
                              text="{sessionModel>startDate}"
                            />
                            <Label id="_IDGenLabel16" text="{i18n>EndDate}: " />
                            <Text
                              id="_IDGenDatePicker4"
                              text="{sessionModel>endDate}"
                            />
                          </HBox>
                          <Label
                            id="_IDGenLabel14"
                            text="{i18n>Location}: {sessionModel>location}"
                          />
                          <Label
                            id="_IDGenLabel17"
                            text="{i18n>Speaker}: {sessionModel>speaker}"
                          />
                          <Label
                            id="_IDGenLabel18"
                            text="{i18n>TotalSeats}: {sessionModel>totalSeats}"
                          />
                          <Label
                            id="_IDGenLabel15"
                            text="{i18n>Description}: {sessionModel>description}"
                          />
                        </VBox>
                      </HBox>
                      <Button
                        id="_IDGenButton2"
                        text="{i18n>register}"
                        press="onRegisterPress"
                      />
                    </CustomListItem>
                  </items>
                </List>
              </VBox>
            </VBox>
          </HBox>
        </VBox>
      </FlexBox>
    </content>
  </Page>

  <Popover
    id="popover"
    placement="Auto"
    showArrow="true"
    title="{i18n>Menu}"
    contentWidth="auto"
  >
    <content>
      <VBox id="_IDGenVBox">
        <Button
          id="_IDGenButton9"
          text="{i18n>EN}"
          press="onSwitchToEnglish"
          width="100%"
        />
        <Button
          id="_IDGenButton10"
          text="{i18n>NL}"
          press="onSwitchToDutch"
          width="100%"
        />
      </VBox>
    </content>
  </Popover>
</mvc:View>;
