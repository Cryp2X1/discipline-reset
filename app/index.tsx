import { Redirect } from 'expo-router';
import { useStore } from '@/lib/store';

export default function Index() {
  const { data } = useStore();
  return <Redirect href={data.onboarded ? '/today' : '/welcome'} />;
}
