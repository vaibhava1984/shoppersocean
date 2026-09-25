import { Card, CardContent } from "@/components/ui/card"
import Header from "@/components/Header"
import Footer from "@/components/Footer"
import { firestore } from "@/lib/firebase/admin"

export const metadata={title:"Shoppers Ocean - System Check",description:"Firebase migration system check"}
export const revalidate=0
export default async function DebugPage(){
 let count=0,error=""
 try { const snap=await firestore.collection("books").limit(5).get(); count=snap.size } catch(e){error=String((e as any)?.message||e)}
 return <div className="min-h-screen bg-slate-50 text-slate-900"><Header/><section className="py-20 bg-white"><div className="container mx-auto px-4 sm:px-6 lg:px-8"><h1 className="text-4xl font-bold mb-8 text-slate-800">System Check</h1><Card className="mb-6"><CardContent className="p-6"><h2 className="text-2xl font-bold mb-4">Firebase Migration</h2><p className="text-green-700 font-semibold">Firebase backend is active.</p><p className="mt-2 text-slate-600">This page no longer depends on Supabase.</p></CardContent></Card><Card><CardContent className="p-6"><h2 className="text-2xl font-bold mb-4">Books collection check</h2>{error?<p className="text-red-700">Unable to read the books collection: {error}</p>:<p className="text-green-700 font-semibold">Books collection is accessible. Records found in this check: {count}.</p>}</CardContent></Card></div></section><Footer/></div>
}