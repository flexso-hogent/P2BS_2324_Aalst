using my.project as my from '../db/data-model';

service CatalogService {
    entity Events @readonly   as projection on my.Events;
    entity Sessions @readonly as projection on my.Sessions;
}
