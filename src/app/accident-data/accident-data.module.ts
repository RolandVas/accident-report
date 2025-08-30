export interface PersonalData {
  vorname: string;
  nachname: string;
  geburtsdatum: string;
  adresse: string;
  plz: string;
  ort: string;
  telefon: string;
  email: string;
  fuehrerscheinNummer: string;
  versicherung: string;
  polizzennummer: string;
}

export interface UnfallDetails {
  unfallDatum: string;
  unfallZeit: string;
  unfallOrt: string;
  witterung: string;
  strassenverhaeltnisse: string;
  unfallhergang: string;
  polizeiRuecksprache: boolean;
  polizeiAktenzeichen: string;
  zeugen: string;
  verletzungen: boolean;
  verletzungsBeschreibung: string;
}

export interface FahrzeugDaten {
  marke: string;
  modell: string;
  kennzeichen: string;
  farbe: string;
  baujahr: number;
  fahrgestellnummer: string;
  schadenshoehe: number;
  schadensBeschreibung: string;
  reparaturWerkstatt: string;
  fahrzeugFahrbereit: boolean;
}

export interface UnfallFormData {
  personalData: PersonalData;
  unfallDetails: UnfallDetails;
  fahrzeugDaten: FahrzeugDaten;
}