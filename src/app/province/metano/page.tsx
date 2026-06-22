import type { Metadata } from 'next';
import ProvinceList from '@/components/ProvinceList';

export const metadata: Metadata = {
  title: 'Prezzi metano per provincia — TrovaCarburante',
  description: 'Confronta i prezzi del metano in tutte le province italiane. Dati aggiornati ogni notte dal MISE.',
};

export default function Page() {
  return <ProvinceList carburante="metano" />;
}
