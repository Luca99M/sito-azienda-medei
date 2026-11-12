/* PREZZARIO AZIENDA MEDEI
   Per cambiare un prezzo modifica il numero dopo "prezzo" (o "costo" per le spedizioni) e salva.
   Usa il punto per i decimali: 7.50
   In alternativa incolla in "foglio" i link CSV di un Google Sheet (vedi LEGGIMI.txt). */
window.MEDEI = {
  "whatsapp": "393317294483",
  "foglio": {
    "prodotti": "",
    "spedizioni": ""
  },
  "prodotti": [
    {
      "id": "formaggio-fresco",
      "gruppo": "formaggio-fresco",
      "nome": "Formaggio fresco di pecora",
      "nome_en": "Fresh sheep's milk cheese",
      "formato": "",
      "prezzo": 25.0
    },
    {
      "id": "formaggio-stagionato",
      "gruppo": "formaggio-stagionato",
      "nome": "Formaggio stagionato di pecora",
      "nome_en": "Aged sheep's milk cheese",
      "formato": "",
      "prezzo": 27.0
    },
    {
      "id": "olio-025l",
      "gruppo": "olio",
      "nome": "Olio EVO - 100% Moraiolo",
      "nome_en": "EVO Oil - 100% Moraiolo",
      "formato": "0,25 L",
      "prezzo": 6.0
    },
    {
      "id": "olio-05l",
      "gruppo": "olio",
      "nome": "Olio EVO - 100% Moraiolo",
      "nome_en": "EVO Oil - 100% Moraiolo",
      "formato": "0,5 L",
      "prezzo": 10.0
    },
    {
      "id": "olio-075l",
      "gruppo": "olio",
      "nome": "Olio EVO - 100% Moraiolo",
      "nome_en": "EVO Oil - 100% Moraiolo",
      "formato": "0,75 L",
      "prezzo": 15.0
    },
    {
      "id": "olio-1l",
      "gruppo": "olio",
      "nome": "Olio EVO - 100% Moraiolo",
      "nome_en": "EVO Oil - 100% Moraiolo",
      "formato": "1 L",
      "prezzo": 20.0
    },
    {
      "id": "olio-2l",
      "gruppo": "olio",
      "nome": "Olio EVO - 100% Moraiolo",
      "nome_en": "EVO Oil - 100% Moraiolo",
      "formato": "2 L",
      "prezzo": 35.0
    },
    {
      "id": "olio-3l",
      "gruppo": "olio",
      "nome": "Olio EVO - 100% Moraiolo",
      "nome_en": "EVO Oil - 100% Moraiolo",
      "formato": "3 L",
      "prezzo": 52.0
    },
    {
      "id": "olio-5l",
      "gruppo": "olio",
      "nome": "Olio EVO - 100% Moraiolo",
      "nome_en": "EVO Oil - 100% Moraiolo",
      "formato": "5 L",
      "prezzo": 80.0
    },
    {
      "id": "miele-05",
      "gruppo": "miele-05",
      "nome": "Miele 0.5kg",
      "nome_en": "Honey 0.5 kg",
      "formato": "",
      "prezzo": 10.0
    },
    {
      "id": "miele-1",
      "gruppo": "miele-1",
      "nome": "Miele 1 kg",
      "nome_en": "Honey 1 kg",
      "formato": "",
      "prezzo": 16.0
    },
    {
      "id": "noci",
      "gruppo": "noci",
      "nome": "Noci Umbre in Guscio",
      "nome_en": "Umbrian walnuts in shell",
      "formato": "",
      "prezzo": 7.0
    },
    {
      "id": "lenticchie",
      "gruppo": "lenticchie",
      "nome": "Lenticchie",
      "nome_en": "Lentils",
      "formato": "",
      "prezzo": 7.0
    }
  ],
  "spedizioni": [
    {
      "id": "ritiro",
      "zona": "Ritiro in sede (Coste di Trevi)",
      "zona_en": "Pick-up at the farm (Coste di Trevi)",
      "costo": 0
    },
    {
      "id": "umbria",
      "zona": "Umbria",
      "zona_en": "Umbria",
      "costo": 7
    },
    {
      "id": "italia",
      "zona": "Italia (Sicilia compresa, Sardegna esclusa)",
      "zona_en": "Italy (incl. Sicily, excl. Sardinia)",
      "costo": 13
    },
    {
      "id": "sardegna",
      "zona": "Sardegna",
      "zona_en": "Sardinia",
      "costo": 16
    },
    {
      "id": "eu1",
      "zona": "Austria, Germania",
      "zona_en": "Austria, Germany",
      "costo": 14
    },
    {
      "id": "eu2",
      "zona": "Belgio, Francia, Paesi Bassi, Polonia, Slovacchia",
      "zona_en": "Belgium, France, Netherlands, Poland, Slovakia",
      "costo": 20
    },
    {
      "id": "eu3",
      "zona": "Portogallo, Danimarca, Spagna, Ungheria",
      "zona_en": "Portugal, Denmark, Spain, Hungary",
      "costo": 24
    },
    {
      "id": "eu4",
      "zona": "Grecia, Svezia, Estonia, Lituania, Lettonia, Croazia",
      "zona_en": "Greece, Sweden, Estonia, Lithuania, Latvia, Croatia",
      "costo": 32
    }
  ]
};
