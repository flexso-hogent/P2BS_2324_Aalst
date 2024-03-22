namespace my.project;

entity Sessions {
    key ID             : Integer;
        title          : String;
        date           : Date;
        time           : Time;
        room           : String;
        description    : String;
        speaker        : String;
        availableSeats : Integer;
        location       : String;
        eventID        : UUID; //Association to Events;
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
    key ID        : String;
        rating    : Integer;
        comment   : String; //localized String;
        sessionID : String;
        userID    : UUID; //Association to Users;
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
        SessionID        : UUID; //Association to Session;
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
        AdministratorName : String; //Association to Admin;
}

entity Session {
    key SessionID    : UUID;
        Name         : String;
        Date         : Date;
        Time         : Time;
        BriefContent : String;
        Active       : Boolean;
        EventID      : UUID; // Association to events
}

entity Scores {
    key ScoreID   : UUID;
        Username  : String; //Association to Users
        Score     : Integer;
        ScoreDate : DateTime;
        SessionID : UUID; //Association to Session
}

entity Feedback {
    key FeedbackID      : UUID;
        Username        : String; //Association to Session
        FeedbackMessage : String;
        FeedbackDate    : DateTime;
        SessionID       : UUID; //Association to Session
}

entity Scoreboard {
    key ID                : UUID;
        AverageScore      : Integer; // Association to many Scores
        //on AverageScore.ScoreID = $self.ID;
        ParticipantsCount : Integer; //Association to many Users
        //on ParticipantsCount.userID = $self.ID;
        SessionID         : UUID; //Association to Session;
}
