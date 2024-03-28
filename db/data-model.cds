namespace my.project;

entity Admin {
    key email     : String;
        adminName : String;
        password  : String;
        role      : String;
        company   : String;
        bdate     : Date;
        street    : String;
        hnumber   : Integer;
        city      : String;
        country   : String;
        zip       : String;
        phone     : Integer;
        gender    : String;
}

entity Events {
    key eventID     : UUID;
        name        : String;
        startDate   : Date;
        endDate     : Date;
        location    : String;
        description : String;
}

entity Feedback {
    key FeedbackID      : Integer;
        Username        : String; // Association to Session
        SessionTitle    : String; // Association to Session
        Rating          : Integer;
        Review          : String;
        FeedbackDate    : DateTime;
}

entity Rating {
    key ratingID  : UUID;
        rating    : Integer;
        comment   : String; // localized String;
        sessionID : UUID; // Association to Sessions;
        eventID   : UUID; // Association to Events;
        userID    : UUID; // Association to Users;
}

entity Registration {
    key registrationID   : UUID;
        registrationDate : DateTime;
        sessionID        : UUID; // Association to Session;
        userID           : UUID; // Association to Users;
        eventID          : UUID; // Association to Events;
        Username        : String; //Association to Session
        SessionTitle    : String; //Association to Session
        Rating          : Integer;
        Review          : String;
        FeedbackDate    : DateTime;
}

entity Scoreboard {
    key ID                : UUID;
        AverageScore      : Integer; // Association to many Scores
        // on AverageScore.ScoreID = $self.ID;
        ParticipantsCount : Integer; // Association to many Users
        // on ParticipantsCount.userID = $self.ID;
        SessionID         : UUID; // Association to Session;
}

entity Scores {
    key ScoreID   : UUID;
        userID    : UUID; // Association to Users
        Score     : Integer;
        ScoreDate : DateTime;
        SessionID : UUID; // Association to Session
        eventID   : UUID; // Association to Events
}

entity Sessions {
    key sessionID   : UUID;
        title       : String;
        startDate   : Date;
        endDate     : Date;
        startTime   : Time;
        endTime     : Time;
        room        : String;
        description : String;
        speaker     : String;
        totalSeats  : Integer;
        eventID     : UUID; // Association to Events;
}

entity Users {
    key userID   : Integer; // Changed to UUID
        firstname     : String;
        lastname      : String;
        email    : String;
        password : String;
        company  : String;
        role     : String;
        bdate    : Date;
        street   : String;
        hnumber  : Integer;
        city     : String;
        country  : String;
        zip      : Integer;
        phone    : Integer;
        gender   : String;
}
entity PasswordReset {
    key resetID      : UUID;
        userEmail    : String;
        
}