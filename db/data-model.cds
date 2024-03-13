namespace my.project;

using {
    Country,
    managed
} from '@sap/cds/common';

entity Events {
    key ID    : Integer;
        title : localized String;

}

entity Sessions {
    key ID    : Integer;
        title : localized String;
        event : Association to Events;
}
