using my.project as my from '../db/data-model';

service CatalogService {
    entity Sessions @readonly     as projection on my.Sessions;
    entity Users                  as projection on my.Users;
    entity Rating @readonly       as projection on my.Rating;
    entity Admin @readonly        as projection on my.Admin;
    entity Registration @readonly as projection on my.Registration;
    entity Events                 as projection on my.Events; // Removed @readonly annotation
    entity Scores @readonly       as projection on my.Scores;
    entity Feedback               as projection on my.Feedback;
    entity Scoreboard @readonly   as projection on my.Scoreboard;
    entity PasswordReset          as projection on my.PasswordReset;
}
