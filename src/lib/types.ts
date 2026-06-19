export interface Distributore {
  id: number;
  gestore: string;
  bandiera: string;
  tipo: string;
  nome: string;
  indirizzo: string;
  comune: string;
  provincia: string;
  lat: number;
  lng: number;
  prezzi: {
    benzina?: number;
    diesel?: number;
    gpl?: number;
    metano?: number;
  };
  self: boolean;
  aggiornato: string;
}

export interface DistributoreConDistanza extends Distributore {
  distanzaKm: number;
}

export type Carburante = "benzina" | "diesel" | "gpl" | "metano";
