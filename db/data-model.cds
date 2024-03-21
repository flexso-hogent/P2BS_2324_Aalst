namespace my.project;

entity Events {
    key ID          : Integer;
        title       : localized String;
        eventID     : String;
        date        : Date;
        location    : String;
        description : localized String;

}

entity Sessions {
    key ID             : Integer;
        title          : localized String;
        date           : Date;
        time           : Time;
        room           : String;
        description    : localized String;
        speaker        : String;
        availableSeats : Integer;
        location       : String;
        eventID        : String;

}

entity Users {
    key ID       : Integer;
        name     : String;
        email    : String;
        password : String;
        company  : String;
        role     : String;
}

entity EventLocation {
    key ID          : Integer;
        name        : String;
        description : localized String;

}

entity SessionsLocation {
    key ID          : Integer;
        name        : String;
        description : localized String;

}

entity SessionSpeaker {
    key ID          : Integer;
        name        : String;
        description : localized String;

}

entity Rating {
    key ID        : Integer;
        rating    : Integer;
        comment   : localized String;
        sessionID : String;
        userID    : Integer;

}
