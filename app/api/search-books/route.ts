import { NextResponse } from "next/server";
import { getD1 } from "@/utils/cloudflare/d1";

type Item = { id:string; label:string; detail?:string|null; type:"book"|"author"|"section"; href:string; score?:number; aliases?:string[] };
type CatalogItem = { id:string; label:string; detail:string; href:string; aliases?:string[] };
const groups = [
{id:"word-playground",label:"Word Playground",aliases:["words","word games","word playground","word puzzle","vocabulary"],game:"word"},
{id:"brain-logic",label:"Brain & Logic Lab",aliases:["brain","logic","brain games","brain and logic","brain logic lab","number puzzle","thinking games"],game:"sequence"},
{id:"quiz-arena",label:"Quiz Arena",aliases:["arena","quiz","quizzes","world quiz","knowledge quiz","general knowledge","gk"],game:"quiz"},
{id:"riddle-corner",label:"Riddle Corner",aliases:["riddle","riddles","brain teasers","puzzles"],game:"riddle"},
{id:"daily-challenge",label:"Daily Challenge",aliases:["daily","challenge","daily quiz","today challenge","daily brain teaser"],game:"daily"},
{id:"memory-observation",label:"Memory & Observation",aliases:["memory","observation","visual count","spot the different one","memory games","attention"],game:"memory"},
{id:"classic-games",label:"Classic Games Arena",aliases:["classic games","tic tac toe","math duel","ludo","traditional games"],game:"tic"},
{id:"read-ebooks",label:"Read E-books",aliases:["books","ebooks","e books","flipbooks","reading","online books","read books","authors"],game:"books"}
];
const games:[string,string,string,string[]][]=[
["word-playground","word","Word Scramble",["scramble","word scramble","jumble words"]],
["word-playground","hidden","Hidden Word",["hidden word","find the word"]],
["word-playground","missing","Missing Letter",["missing letter","complete the word"]],
["brain-logic","sequence","Number Sequences",["sequence","number sequence","number sequences","brain sequence","number series"]],
["brain-logic","odd","Odd One Out",["odd one out","odd one","find the odd"]],
["quiz-arena","quiz","World Knowledge Quiz",["world knowledge quiz","general knowledge","gk quiz","world quiz"]],
["riddle-corner","riddle","Solve a Riddle",["solve a riddle","riddles","brain teaser"]],
["daily-challenge","daily","Today's Brain Teaser",["daily challenge","brain teaser","today brain teaser","daily question"]],
["memory-observation","memory","Emoji Memory Hunt",["emoji memory hunt","memory hunt","emoji memory"]],
["memory-observation","recall","Visual Count Sprint",["visual count sprint","visual count","counting game","count objects"]],
["memory-observation","spot","Spot the Different One",["spot the different one","spot difference","find differences"]],
["classic-games","tic","Tic-Tac-Toe",["tic tac toe","tic-tac-toe","noughts and crosses"]],
["classic-games","connect","Lightning Math Duel",["lightning math duel","math duel","math game","mental maths"]]
];
const catalog:CatalogItem[] = [
{ id:"home",label:"Home",detail:"Homepage",href:"/",aliases:["homepage","main page","welcome","home page","entertainment hub"] },
{ id:"subscribe",label:"Subscribe Now",detail:"Subscription plans",href:"/subscribe-now",aliases:["subscription","subscribe","plans","membership","premium","paid plan","free quota","upgrade plan"] },
{ id:"about",label:"About Shoppers Ocean",detail:"Website page",href:"/about",aliases:["about us","who we are","our story"] },
{ id:"services",label:"Services",detail:"Website page",href:"/services",aliases:["what we offer","facilities","features","entertainment services"] },
{ id:"author-panel",label:"Author Panel",detail:"Author tools",href:"/author-panel",aliases:["author dashboard","publish book","publish a book","author application","become an author","register as author","author registration","author approval"] },
{ id:"bookshelf",label:"Your Books",detail:"Book shelf",href:"/bookShelf",aliases:["bookshelf","my books","your bookshelf","purchased books","book library","read books","book collection"] },
{ id:"login",label:"Sign In",detail:"Account access",href:"/?account=signin",aliases:["login","log in","sign in","account login"] },
{ id:"create-account",label:"Create Account",detail:"Account access",href:"/?account=signup",aliases:["sign up","register","new account","create account","join"] },
{ id:"account-settings",label:"Account Settings",detail:"Profile and password",href:"/?account=settings",aliases:["profile","change password","update account","my account","settings"] },
{ id:"author-policies",label:"Author Policies",detail:"Author information",href:"/read-ebooks",aliases:["author rules","publishing policy","author guidelines"] },
{ id:"flipbook",label:"Read as Flipbook",detail:"Online book reader",href:"/bookShelf",aliases:["flip book","online reader","read online","page flip","book reader"] },
{ id:"daily-quota",label:"Daily Quota",detail:"Game usage limits",href:"/?oceanSection=daily-challenge",aliases:["quota","daily limit","limit reached","come back tomorrow","daily allowance"] },
{ id:"visitor-country",label:"Local Pricing",detail:"Country-based pricing",href:"/subscribe-now",aliases:["currency","country pricing","regional price","payment","payments"] },
{ id:"reviews",label:"Reviews",detail:"Reader feedback",href:"/services",aliases:["ratings","feedback","review books"] },
{ id:"contact",label:"Contact",detail:"Help and support",href:"/about",aliases:["contact us","support","help","customer service"] },
{ id:"privacy",label:"Privacy",detail:"Website information",href:"/about",aliases:["privacy policy","data privacy"] },
{ id:"terms",label:"Terms",detail:"Website information",href:"/about",aliases:["terms and conditions","terms of use"] }
];

function norm(s:string){return s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,"").replace(/[^a-z0-9]+/g," ").trim();}
function dist(a:string,b:string){if(Math.abs(a.length-b.length)>Math.max(2,Math.ceil(Math.max(a.length,b.length)*.4)))return 99;const r=Array.from({length:b.length+1},(_,i)=>i);for(let i=1;i<=a.length;i++){let p=r[0];r[0]=i;for(let j=1;j<=b.length;j++){const old=r[j];r[j]=Math.min(r[j]+1,r[j-1]+1,p+(a[i-1]===b[j-1]?0:1));p=old;}}return r[b.length];}

/* Lightweight ISO-like transliteration for major Indic scripts. Multiple common roman spellings are ranked together. */
const scriptMaps:Record<string,Record<string,string>> = {
"\u0900-\u097F": {
"अ":"a","आ":"aa","इ":"i","ई":"ee","उ":"u","ऊ":"oo","ऋ":"ri","ए":"e","ऐ":"ai","ओ":"o","औ":"au","क":"k","ख":"kh","ग":"g","घ":"gh","ङ":"n","च":"ch","छ":"chh","ज":"j","झ":"jh","ञ":"ny","ट":"t","ठ":"th","ड":"d","ढ":"dh","ण":"n","त":"t","थ":"th","द":"d","ध":"dh","न":"n","प":"p","फ":"ph","ब":"b","भ":"bh","म":"m","य":"y","र":"r","ल":"l","व":"v","श":"sh","ष":"sh","स":"s","ह":"h","क्ष":"ksh","त्र":"tr","ज्ञ":"gy","ा":"aa","ि":"i","ी":"ee","ु":"u","ू":"oo","ृ":"ri","े":"e","ै":"ai","ो":"o","ौ":"au","ं":"n","ँ":"n","ः":"h","्":"","़":"","ऽ":"a"
},
"\u0980-\u09FF": {
"অ":"o","আ":"a","ই":"i","ঈ":"i","উ":"u","ঊ":"u","ঋ":"ri","এ":"e","ঐ":"oi","ও":"o","ঔ":"ou","ক":"k","খ":"kh","গ":"g","ঘ":"gh","ঙ":"ng","চ":"ch","ছ":"chh","জ":"j","ঝ":"jh","ঞ":"ny","ট":"t","ঠ":"th","ড":"d","ঢ":"dh","ণ":"n","ত":"t","থ":"th","দ":"d","ধ":"dh","ন":"n","প":"p","ফ":"ph","ব":"b","ভ":"bh","ম":"m","য":"j","র":"r","ল":"l","শ":"sh","ষ":"sh","স":"s","হ":"h","া":"a","ি":"i","ী":"i","ু":"u","ূ":"u","ৃ":"ri","ে":"e","ৈ":"oi","ো":"o","ৌ":"ou","ং":"ng","ঁ":"n","্":"","়":""
},
"\u0B80-\u0BFF": {
"அ":"a","ஆ":"aa","இ":"i","ஈ":"ee","உ":"u","ஊ":"oo","எ":"e","ஏ":"e","ஐ":"ai","ஒ":"o","ஓ":"o","ஔ":"au","க":"k","ங":"ng","ச":"ch","ஞ":"ny","ட":"t","ண":"n","த":"th","ந":"n","ன":"n","ப":"p","ம":"m","ய":"y","ர":"r","ல":"l","வ":"v","ழ":"zh","ள":"l","ற":"r","ஜ":"j","ஷ":"sh","ஸ":"s","ஹ":"h","ா":"aa","ி":"i","ீ":"ee","ு":"u","ூ":"oo","ெ":"e","ே":"e","ை":"ai","ொ":"o","ோ":"o","ௌ":"au","்":"","ம்":"m"
},
"\u0C00-\u0C7F": {
"అ":"a","ఆ":"aa","ఇ":"i","ఈ":"ee","ఉ":"u","ఊ":"oo","ఋ":"ru","ఎ":"e","ఏ":"e","ఐ":"ai","ఒ":"o","ఓ":"o","ఔ":"au","క":"k","ఖ":"kh","గ":"g","ఘ":"gh","చ":"ch","ఛ":"chh","జ":"j","ఝ":"jh","ట":"t","ఠ":"th","డ":"d","ఢ":"dh","ణ":"n","త":"t","థ":"th","ద":"d","ధ":"dh","న":"n","ప":"p","ఫ":"ph","బ":"b","భ":"bh","మ":"m","య":"y","ర":"r","ల":"l","వ":"v","శ":"sh","ష":"sh","స":"s","హ":"h","ా":"aa","ి":"i","ీ":"ee","ు":"u","ూ":"oo","ృ":"ru","ె":"e","ే":"e","ై":"ai","ొ":"o","ో":"o","ౌ":"au","ం":"n","ః":"h","్":""
},
"\u0C80-\u0CFF": {
"ಅ":"a","ಆ":"aa","ಇ":"i","ಈ":"ee","ಉ":"u","ಊ":"oo","ಋ":"ru","ಎ":"e","ಏ":"e","ಐ":"ai","ಒ":"o","ಓ":"o","ಔ":"au","ಕ":"k","ಖ":"kh","ಗ":"g","ಘ":"gh","ಚ":"ch","ಛ":"chh","ಜ":"j","ಝ":"jh","ಟ":"t","ಠ":"th","ಡ":"d","ಢ":"dh","ಣ":"n","ತ":"t","ಥ":"th","ದ":"d","ಧ":"dh","ನ":"n","ಪ":"p","ಫ":"ph","ಬ":"b","ಭ":"bh","ಮ":"m","ಯ":"y","ರ":"r","ಲ":"l","ವ":"v","ಶ":"sh","ಷ":"sh","ಸ":"s","ಹ":"h","ಾ":"aa","ಿ":"i","ೀ":"ee","ು":"u","ೂ":"oo","ೃ":"ru","ೆ":"e","ೇ":"e","ೈ":"ai","ೊ":"o","ೋ":"o","ೌ":"au","ಂ":"n","ಃ":"h","್":""
},
"\u0D00-\u0D7F": {
"അ":"a","ആ":"aa","ഇ":"i","ഈ":"ee","ഉ":"u","ഊ":"oo","ഋ":"ri","എ":"e","ഏ":"e","ഐ":"ai","ഒ":"o","ഓ":"o","ഔ":"au","ക":"k","ഖ":"kh","ഗ":"g","ഘ":"gh","ങ":"ng","ച":"ch","ഛ":"chh","ജ":"j","ഝ":"jh","ഞ":"nj","ട":"t","ഠ":"th","ഡ":"d","ഢ":"dh","ണ":"n","ത":"th","ഥ":"th","ദ":"d","ധ":"dh","ന":"n","പ":"p","ഫ":"ph","ബ":"b","ഭ":"bh","മ":"m","യ":"y","ര":"r","ല":"l","വ":"v","ശ":"sh","ഷ":"sh","സ":"s","ഹ":"h","ാ":"aa","ി":"i","ീ":"ee","ു":"u","ൂ":"oo","ൃ":"ri","െ":"e","േ":"e","ൈ":"ai","ൊ":"o","ോ":"o","ൗ":"au","ം":"m","ഃ":"h","്":""
}
};
function isIndicConsonant(ch:string){return /[क-हक़-य़ক-হড়-য়க-ஹஜ-ஹక-హಕ-ಹಕ-ഹ]/u.test(ch);}
function romanize(s:string){let out="";const chars=Array.from(s);for(let i=0;i<chars.length;i++){const pair=chars[i]+(chars[i+1]??"");let map:Record<string,string>|undefined;for(const [range,m] of Object.entries(scriptMaps)){const [start,end]=range.split("-").map(x=>(Array.from(x)[0]?.codePointAt(0)??0));const cp=chars[i].codePointAt(0)??0;if(cp>=start&&cp<=end){map=m;break;}}if(!map){out+=chars[i];continue;}if(map[pair]!==undefined){out+=map[pair];i++;continue;}const val=map[chars[i]];if(val!==undefined){out+=val;const next=chars[i+1];if(isIndicConsonant(chars[i])&&next&&isIndicConsonant(next))out+="a";}else if(/[\u0900-\u0D7F]/u.test(chars[i])){}else out+=chars[i];}return out.replace(/\\s+/g," ").trim();}function variants(s:string){const n=norm(s);const r=romanize(s);const base=[n,norm(r),norm(r.replace(/aa/g,"a").replace(/ee/g,"i").replace(/ii/g,"i").replace(/oo/g,"u").replace(/uu/g,"u").replace(/sh/g,"s").replace(/chh/g,"ch").replace(/ph/g,"f").replace(/v/g,"w")),norm(r.replace(/a/g,"aa").replace(/i/g,"ee").replace(/u/g,"oo"))];return [...new Set(base.filter(Boolean))];}
function rank(label:string,q:string,aliases:string[]=[]){const needles=variants(q);let best=999;for(const text of [label,...aliases]){for(const target of variants(text)){for(const needle of needles){if(!needle)continue;if(target===needle)return 0;if(target.startsWith(needle))best=Math.min(best,1);if(target.includes(needle))best=Math.min(best,2);const words=target.split(" "),parts=needle.split(" ");for(const part of parts){if(words.some(w=>w.startsWith(part)))best=Math.min(best,3);const d=Math.min(...words.map(w=>dist(w,part)));if(d<=(part.length<=3?0:part.length<=5?1:2))best=Math.min(best,4+d);}if(parts.length>1&&parts.every(p=>words.some(w=>w.includes(p)||dist(w,p)<=(p.length<=4?1:2))))best=Math.min(best,2);}}}return best;}
function href(section:string,game:string){return "/?oceanSection="+encodeURIComponent(section)+"&oceanGame="+encodeURIComponent(game)+"#"+encodeURIComponent(section);}
export async function GET(request:Request){
 const q=new URL(request.url).searchParams.get("q")?.trim()??"";
 if(q.length<2)return NextResponse.json({suggestions:[]},{headers:{"Cache-Control":"no-store"}});
 const items:Item[]=[];
 for(const g of groups){const score=rank(g.label,q,g.aliases);if(score<999)items.push({id:g.id,label:g.label,detail:"Entertainment section",type:"section",href:href(g.id,g.game),score});}
 for(const [section,game,label,aliases] of games){const g=groups.find(x=>x.id===section)!;const score=rank(label,q,aliases);if(score<999)items.push({id:section+":"+game,label,detail:g.label+" · Game",type:"section",href:href(section,game),score:score+.15});}
 for(const p of catalog){const score=rank(p.label,q,p.aliases??[]);if(score<999)items.push({id:p.id,label:p.label,detail:p.detail,type:"section",href:p.href,score:score+.05});}
 try{
  const db=getD1();
  if(db){
   const books=await db.prepare("SELECT id,title,author_name FROM books WHERE COALESCE(is_deleted,0)=0 ORDER BY title ASC").all<{id:string;title:string;author_name:string|null}>();
   for(const b of books.results??[]){const titleScore=rank(b.title,q);const authorScore=b.author_name?rank(b.author_name,q)+2:999;const score=Math.min(titleScore,authorScore);if(score<999)items.push({id:String(b.id),label:b.title,detail:b.author_name??"E-book",type:"book",href:"/book/"+encodeURIComponent(b.id),score:score+.1});}
   const authors=await db.prepare("SELECT id,name FROM authors WHERE COALESCE(is_deleted,0)=0 ORDER BY name ASC").all<{id:string;name:string}>();
   for(const a of authors.results??[]){const score=rank(a.name,q);if(score<999)items.push({id:String(a.id),label:a.name,detail:"Author",type:"author",href:"/bookShelf?"+new URLSearchParams({author:String(a.id),source:"homepage"}),score:score+.1});}
  }
 }catch(e){console.error("Search database lookup failed; returning catalog matches",e);}
 const unique=new Map<string,Item>();
 for(const item of items){const key=item.type+":"+item.id;const old=unique.get(key);if(!old||(item.score??999)<(old.score??999))unique.set(key,item);}
 const suggestions=[...unique.values()].filter(x=>(x.score??999)<999).sort((a,b)=>(a.score??999)-(b.score??999)||a.label.localeCompare(b.label)).slice(0,15).map(({score:_,...item})=>item);
 return NextResponse.json({suggestions},{headers:{"Cache-Control":"no-store"}});
}
