import Link from "next/link";
import { getD1 } from "@/utils/cloudflare/d1";

type Props={authorId:string;timeFrame?:"today"|"week"|"month"|"year"|"untilnow"};
function startDate(timeFrame:Props["timeFrame"]){
 const now=new Date();
 if(timeFrame==="untilnow")return new Date(0).toISOString();
 if(timeFrame==="today"){const d=new Date(now);d.setHours(0,0,0,0);return d.toISOString();}
 if(timeFrame==="week"){const d=new Date(now);d.setDate(d.getDate()-d.getDay());d.setHours(0,0,0,0);return d.toISOString();}
 if(timeFrame==="month")return new Date(now.getFullYear(),now.getMonth(),1).toISOString();
 if(timeFrame==="year")return new Date(now.getFullYear(),0,1).toISOString();
 return null;
}

export default async function MySales({authorId,timeFrame="month"}:Props){
 const db=getD1(); if(!db)throw new Error("Cloudflare D1 is not available");
 const books=(await db.prepare("SELECT id,title FROM books WHERE author_id=? AND COALESCE(is_deleted,0)=0 ORDER BY title ASC").bind(authorId).all<{id:string;title:string}>()).results||[];
 const ids=books.map(b=>b.id); const since=startDate(timeFrame); let sales:any[]=[];
 if(ids.length){
  const placeholders=ids.map(()=>"?").join(",");
  let sql="SELECT o.id,o.book_id,o.created_at,o.status,b.title,p.amount_in_inr,p.original_amount,p.original_currency,p.updated_at FROM orders o JOIN books b ON b.id=o.book_id LEFT JOIN payments p ON p.order_id=o.id WHERE o.book_id IN ("+placeholders+") AND o.status='completed'";
  if(since)sql+=" AND o.created_at >= ?";
  sql+=" ORDER BY COALESCE(p.updated_at,o.created_at) DESC";
  const args=since?[...ids,since]:ids;
  sales=(await db.prepare(sql).bind(...args).all<any>()).results||[];
 }
 const totalRevenue=sales.reduce((sum,s)=>sum+Number(s.amount_in_inr||0),0);
 const labels:[string,string][]=[["today","Today"],["week","Weekly"],["month","This Month"],["year","This Year"],["untilnow","Until Now"]];
 return <div className="space-y-6 p-6 max-w-7xl mx-auto">
  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4"><h1 className="text-3xl font-bold">My Sales</h1><div className="flex flex-wrap gap-2">{labels.map(([value,label])=><Link key={value} href={"/my-sales?timeFrame="+value} className={"px-3 py-2 rounded-md border text-sm "+(timeFrame===value?"bg-blue-600 text-white":"bg-white text-gray-700 hover:bg-gray-50")}>{label}</Link>)}</div></div>
  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
   <div className="bg-white rounded-lg shadow p-6"><div className="text-sm text-gray-500">Total Orders</div><div className="text-2xl font-bold">{sales.length}</div></div>
   <div className="bg-white rounded-lg shadow p-6"><div className="text-sm text-gray-500">Total Revenue</div><div className="text-2xl font-bold">₹{totalRevenue.toFixed(2)}</div></div>
   <div className="bg-white rounded-lg shadow p-6"><div className="text-sm text-gray-500">Active Books</div><div className="text-2xl font-bold">{books.length}</div></div>
  </div>
  <div className="bg-white rounded-lg shadow overflow-hidden"><div className="px-6 py-4 border-b border-gray-200"><h2 className="text-lg font-semibold">Sales Details</h2></div><div className="overflow-x-auto">
   <table className="w-full text-sm"><thead className="bg-gray-50"><tr><th className="text-left px-6 py-3">Book</th><th className="text-left px-6 py-3">Amount</th><th className="text-left px-6 py-3">Currency</th><th className="text-left px-6 py-3">Sale Date</th></tr></thead><tbody>
    {sales.map(s=><tr key={s.id} className="border-t"><td className="px-6 py-3"><Link className="text-blue-600 hover:underline" href={"/book/"+s.book_id}>{s.title}</Link></td><td className="px-6 py-3">₹{Number(s.amount_in_inr||0).toFixed(2)}</td><td className="px-6 py-3">{s.original_currency?(String(s.original_amount??0)+" "+s.original_currency):"—"}</td><td className="px-6 py-3">{new Date(s.updated_at||s.created_at).toLocaleString()}</td></tr>)}
    {!sales.length&&<tr><td colSpan={4} className="px-6 py-10 text-center text-gray-500">No completed sales for this period.</td></tr>}
   </tbody></table>
  </div></div>
 </div>;
}