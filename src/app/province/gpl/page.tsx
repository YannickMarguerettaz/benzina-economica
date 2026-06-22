import type { Metadata } from 'next';
import ProvinceList from '@/components/ProvinceList';

export const metadata: Metadata = {
  title: 'Prezzi GPL per provincia — TrovaCarburante',
  description: 'Confronta i prezzi del GPL in tutte le province italiane. Dati aggiornati ogni notte dal MISE.',
};

export default function Page() {
  return <ProvinceList carburante="gpl" />;
}
