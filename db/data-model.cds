namespace my.project;

entity Events {
    key ID          : Integer;
        title       : localized String;
        eventID     : String;
        date        : Date;
        description : localized String;

}

entity Sessions {
    key ID          : Integer;
        title       : localized String;
        date        : Date;
        time        : Time;
        room        : String;
        description : localized String;
        speaker     : String;
        location    : String;
        eventID     : String;

}

entity Users {
    key ID          : Integer;
        name        : String;
        email       : String;
        password    : String;
        role        : String;
        location    : String;
        description : localized String;

}
