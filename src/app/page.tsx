import {type Metadata} from 'next'

export const metadata: Metadata = {
  title: 'Burn Day Status',
  description: 'Daily burn day status'
}

export default async function Home() {
  return <main className="p-6 space-y-6"></main>
}
