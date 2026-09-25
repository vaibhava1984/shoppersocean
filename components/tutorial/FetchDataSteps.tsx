import Step from './Step'
import Code from './Code'
const server=`import { firestore } from '@/lib/firebase/admin'

export default async function Page() {
  const snapshot = await firestore.collection('books').limit(10).get()
  const books = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
  return <pre>{JSON.stringify(books, null, 2)}</pre>
}`.trim()
export default function FetchDataSteps(){return <ol className="flex flex-col gap-6"><Step title="Read Firebase data"><p>Use the Firebase Admin SDK on the server to read application data.</p><Code code={server}/></Step><Step title="Application ready"><p>The Shoppers Ocean backend is configured for Firebase.</p></Step></ol>}