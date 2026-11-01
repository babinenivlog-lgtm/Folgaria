export type PisteColour = 'green' | 'blue' | 'red' | 'black';

export interface OfficialPiste {
  id: string;
  name: string;
  color: PisteColour;
}

export const FOLGARIA_OFFICIAL_PISTES: OfficialPiste[] = [
  { id: '1', name: 'Maso Spilzi', color: 'blue' },
  { id: '1b', name: 'Mora - Costa', color: 'blue' },
  { id: '1c', name: 'Mora - Ortesino', color: 'green' },
  { id: '2', name: 'Dosso Madonna I', color: 'blue' },
  { id: '3', name: 'Dosso Madonna II', color: 'red' },
  { id: '4', name: 'Ortesino', color: 'red' },
  { id: '5', name: "Stella d'Italia", color: 'blue' },
  { id: '5b', name: 'Coll. Francolini - Ortesino', color: 'blue' },
  { id: '6', name: 'Francolini (pista di solo rientro)', color: 'red' },
  { id: '7', name: 'Baby Fondo Grande', color: 'blue' },
  { id: '8', name: 'Salizzona', color: 'red' },
  { id: '9', name: 'Panoramica', color: 'blue' },
  { id: '9a', name: '9 alsó szakasz', color: 'blue' },
  { id: '9b', name: 'Coll. F. Grande - F. Piccolo', color: 'blue' },
  { id: '10', name: 'Martinella Nord', color: 'black' },
  { id: '10b', name: 'Agonistica', color: 'black' },
  { id: '11', name: 'Pragrant', color: 'red' },
  { id: '12', name: 'Serrada', color: 'blue' },
  { id: '13', name: 'Slalom Toll', color: 'red' },
  { id: '14a', name: 'Coll. Martinella - F. Piccolo', color: 'blue' },
  { id: '14b', name: 'Coll. F. Piccolo - F. Grande', color: 'blue' },
  { id: '15', name: 'Fondo Piccolo 4', color: 'red' },
  { id: '16', name: 'Trugalait', color: 'red' },
  { id: '17', name: 'Cargaore', color: 'blue' },
  { id: '18', name: 'Cengio Rosso', color: 'red' },
  { id: '19', name: 'Passo Coe', color: 'blue' },
  { id: '20', name: 'Baby F. Piccolo', color: 'blue' },
  { id: '21', name: 'Rainer', color: 'red' },
  { id: '22', name: 'Variante Rainer', color: 'blue' },
  { id: '23', name: 'Plaut', color: 'blue' },
  { id: '23b', name: 'Plaut - Bus de la Nef', color: 'blue' },
  { id: '23c', name: 'Leite', color: 'red' },
  { id: '23d', name: 'Baby Coe', color: 'blue' },
  { id: '24', name: 'Termental', color: 'blue' },
  { id: '25', name: 'Pioverna', color: 'red' },
  { id: '25b', name: "Skiweg Costa d'Agra", color: 'blue' },
  { id: '26', name: 'Val delle Lanze', color: 'red' },
  { id: '26b', name: 'Val delle Lanze facile', color: 'blue' },
  { id: '27', name: 'Tre Sassi', color: 'black' },
  { id: '27b', name: 'Var. Tre Sassi', color: 'blue' },
  { id: '28', name: 'Coston', color: 'red' },
  { id: '29', name: 'Larici', color: 'red' },
  { id: '30', name: 'Fiorentini', color: 'red' },
  { id: '31', name: 'Coston - Fiorentini', color: 'red' },
];
