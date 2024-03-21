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


entity Registratie {
    key RegistratieID     : UUID;
        Datum_registratie : DateTime;
        SessieID          : Association to Sessie;
}


entity Events {
    key EvenementID    : UUID;
        Naam           : String;
        Datum          : Date;
        Tijd           : Time;
        Actief         : Boolean;
        QR_code        : String;
        Exporteerbaar  : Boolean;
        Metatags       : String;
        Beheerdersnaam : Association to Admin;
}

entity Sessie {
    key SessieID     : UUID;
        Naam         : String;
        Datum        : Date;
        Tijd         : Time;
        Korte_inhoud : String;
        Actief       : Boolean;
        EvenementID  : Association to Events;
}

entity Scores {
    key ScoreID        : UUID;
        Gebruikersnaam : Association to Users;
        Score          : Integer;
        Datum_score    : DateTime;
        SessieID       : Association to Sessie;
}

entity Feedback {
    key FeedbackID       : UUID;
        Gebruikersnaam   : Association to Users;
        Feedback_bericht : String;
        Datum_feedback   : DateTime;
        SessieID         : Association to Sessie;
}

entity Scorebord {
    key ID               : UUID;
        GemiddeldeScore  : Association to many Scores
                               on GemiddeldeScore.ScoreID = $self.ID;
        AantalDeelnemers : Association to many Users
                               on AantalDeelnemers.userID = $self.ID;
        SessieID         : Association to Sessie;
}
