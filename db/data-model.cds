namespace my.project;

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
        eventID        : Association to Events;
}

entity Users {
    key userID   : Integer;
        name     : String;
        email    : String;
        password : String;
        company  : String;
        role     : String;
}

entity Rating {
    key ID        : Integer;
        rating    : Integer;
        comment   : localized String;
        sessionID : String;
        userID    : Association to Users;
}

entity Admin {
    key email     : String;
        adminName : String;
        password  : String;
        role      : String;
        company   : String;
}

entity Registration {
    key RegistrationID   : UUID;
        RegistrationDate : DateTime;
        SessionID        : Association to Session;
}

entity Events {
    key EventID           : UUID;
        Name              : String;
        Date              : Date;
        Time              : Time;
        Active            : Boolean;
        QRCode            : String;
        Exportable        : Boolean;
        MetaTags          : String;
        AdministratorName : Association to Admin;
}

entity Session {
    key SessionID    : UUID;
        Name         : String;
        Date         : Date;
        Time         : Time;
        BriefContent : String;
        Active       : Boolean;
        EventID      : Association to Events;
}

entity Scores {
    key ScoreID   : UUID;
        Username  : Association to Users;
        Score     : Integer;
        ScoreDate : DateTime;
        SessionID : Association to Session;
}

entity Feedback {
    key FeedbackID      : UUID;
        Username        : Association to Users;
        FeedbackMessage : String;
        FeedbackDate    : DateTime;
        SessionID       : Association to Session;
}

entity Scoreboard {
    key ID                : UUID;
        AverageScore      : Association to many Scores
                                on AverageScore.ScoreID = $self.ID;
        ParticipantsCount : Association to many Users
                                on ParticipantsCount.userID = $self.ID;
        SessionID         : Association to Session;
}
