import type { Metadata } from 'next';
import ProvinceList from '@/components/ProvinceList';

export const metadata: Metadata = {
  title: 'Prezzi benzina per provincia — TrovaCarburante',
  description: 'Confronta i prezzi della benzina in tutte le 107 province italiane. Dati aggiornati ogni notte dal MISE.',
};

export default function Page() {
  return <ProvinceList carburante="benzina" />;
}
