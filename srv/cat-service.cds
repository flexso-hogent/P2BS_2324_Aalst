using my.project as my from '../db/data-model';

service CatalogService {
    entity Events @readonly   as projection on my.Events;
    entity Sessions @readonly as projection on my.Sessions;
    entity Users @readonly    as projection on my.Users;
    entity Rating @readonly   as projection on my.Rating;
    entity SessionsLocation @readonly as projection on my.SessionsLocation;
    entity SessionSpeaker @readonly as projection on my.SessionSpeaker;
    entity EventLocation @readonly as projection on my.EventLocation;
}
