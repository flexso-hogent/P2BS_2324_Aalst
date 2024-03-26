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
    key FeedbackID      : UUID;
        Username        : String; // Association to Session
        FeedbackMessage : String;
        FeedbackDate    : DateTime;
        SessionID       : UUID; // Association to Session
}

entity Rating {
    key ratingID  : String;
        rating    : Integer;
        comment   : String; // localized String;
        sessionID : String; // Association to Sessions;
        eventID   : String; // Association to Events;
        userID    : UUID; // Association to Users;
}

entity Registration {
    key registrationID   : UUID;
        registrationDate : DateTime;
        sessionID        : UUID; // Association to Session;
        userID           : UUID; // Association to Users;
        eventID          : UUID; // Association to Events;
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
        userID    : String; // Association to Users
        Score     : Integer;
        ScoreDate : DateTime;
        SessionID : UUID; // Association to Session
        eventID   : UUID; // Association to Events
}

entity Sessions {
    key sessionID     : UUID;
        title         : String;
        startDatedate : Date;
        endDate       : Date;
        startTime     : Time;
        endTime       : Time;
        room          : String;
        description   : String;
        speaker       : String;
        totalSeats    : Integer;
        eventID       : UUID; // Association to Events;
}

entity Users {
    key userID   : Integer;
        name     : String;
        email    : String;
        password : String;
        company  : String;
        role     : String;
        bdate    : Date;
        street   : String;
        hnumber  : Integer;
        city     : String;
        country  : String;
        zip      : String;
        phone    : Integer;
        gender   : String;
}
