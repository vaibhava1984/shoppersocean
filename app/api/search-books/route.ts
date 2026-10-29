import { NextResponse } from "next/server";
import { getD1 } from "@/utils/cloudflare/d1";
type Item = { id:string; label:string; detail?:string|null; type:"book"|"author"|"section"; href:string; score?:number };
const groups = [
{id:"word-playground",label:"Word Playground",aliases:["words","word games","word playground"],game:"word"},
{id:"brain-logic",label:"Brain & Logic Lab",aliases:["brain","logic","brain games","brain and logic","brain logic lab"],game:"sequence"},
{id:"quiz-arena",label:"Quiz Arena",aliases:["arena","quiz","quizzes","world quiz","knowledge quiz"],game:"quiz"},
{id:"riddle-corner",label:"Riddle Corner",aliases:["riddle","riddles","brain teasers"],game:"riddle"},
{id:"daily-challenge",label:"Daily Challenge",aliases:["daily","challenge","daily quiz","today challenge"],game:"daily"},
{id:"memory-observation",label:"Memory & Observation",aliases:["memory","observation","visual count","spot the different one"],game:"memory"},
{id:"classic-games",label:"Classic Games Arena",aliases:["classic games","tic tac toe","math duel","ludo"],game:"tic"},
{id:"read-ebooks",label:"Read E-books",aliases:["books","ebooks","e books","flipbooks","reading"],game:"books"}];
const games:[string,string,string,string[]][]=[
["word-playground","word","Word Scramble",["scramble","word scramble"]],["word-playground","hidden","Hidden Word",["hidden word"]],["word-playground","missing","Missing Letter",["missing letter"]],
["brain-logic","sequence","Number Sequences",["sequence","number sequence","number sequences","brain sequence"]],["brain-logic","odd","Odd One Out",["odd one out","odd one"]],
["quiz-arena","quiz","World Knowledge Quiz",["world knowledge quiz","general knowledge","gk quiz","world quiz"]],["riddle-corner","riddle","Solve a Riddle",["solve a riddle","riddles"]],
["daily-challenge","daily","Today's Brain Teaser",["daily challenge","brain teaser","today brain teaser"]],
["memory-observation","memory","Emoji Memory Hunt",["emoji memory hunt","memory hunt"]],["memory-observation","recall","Visual Count Sprint",["visual count sprint","visual count","counting game"]],
["memory-observation","spot","Spot the Different One",["spot the different one","spot difference"]],
["classic-games","tic","Tic-Tac-Toe",["tic tac toe","tic-tac-toe","noughts and crosses"]],["classic-games","connect","Lightning Math Duel",["lightning math duel","math duel","math game"]]];
function norm(s:string){return s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,"").replace(/[^a-z0-9]+/g," ").trim();}
function dist(a:string,b:string){const r=Array.from({length:b.length+1},(_,i)=>i);for(let i=1;i<=a.length;i++){let p=r[0];r[0]=i;for(let j=1;j<=b.length;j++){const old=r[j];r[j]=Math.min(r[j]+1,r[j-1]+1,p+(a[i-1]===b[j-1]?0:1));p=old;}}return r[b.length];}
function rank(label:string,q:string,aliases:string[]=[]){const needle=norm(q);if(!needle)return 999;let best=999;for(const text of [label,...aliases].map(norm)){if(text===needle)return 0;if(text.startsWith(needle))best=Math.min(best,1);if(text.includes(needle))best=Math.min(best,2);const words=text.split(" "),parts=needle.split(" ");for(const part of parts){if(words.some(w=>w.startsWith(part)))best=Math.min(best,3);const d=Math.min(...words.map(w=>dist(w,part)));if(d<=(part.length<=3?0:part.length<=5?1:2))best=Math.min(best,4+d);}if(parts.length>1&&parts.every(p=>words.some(w=>w.includes(p)||dist(w,p)<=(p.length<=4?1:2))))best=Math.min(best,2);}return best;}
function href(section:string,game:string){return "/?oceanSection="+encodeURIComponent(section)+"&oceanGame="+encodeURIComponent(game)+"#"+encodeURIComponent(section);}
export async function GET(request:Request){const q=new URL(request.url).searchParams.get("q")?.trim()??"";if(q.length<2)return NextResponse.json({suggestions:[]},{headers:{"Cache-Control":"no-store"}});const items:Item[]=[];
for(const g of groups){const score=rank(g.label,q,g.aliases);if(score<999)items.push({id:g.id,label:g.label,detail:"Game section",type:"section",href:href(g.id,g.game),score});}
for(const [section,game,label,aliases] of games){const g=groups.find(x=>x.id===section)!;const score=rank(label,q,aliases);if(score<999)items.push({id:section+":"+game,label,detail:g.label+" · Game",type:"section",href:href(section,game),score:score+.15});}
const pages=[["home","Home","/"],["subscribe","Subscribe Now","/subscribe-now"],["about","About Shoppers Ocean","/about"],["services","Services","/services"],["author-panel","Author Panel","/author-panel"],["bookshelf","Your Books","/bookShelf"]] as const;
for(const [id,label,path] of pages){const score=rank(label,q);if(score<999)items.push({id,label,type:"section",detail:"Website page",href:path,score});}
try{const db=getD1();if(db){const books=await db.prepare("SELECT id,title,author_name FROM books WHERE COALESCE(is_deleted,0)=0 ORDER BY title ASC LIMIT 1500").all<{id:string;title:string;author_name:string|null}>();for(const b of books.results??[]){const score=Math.min(rank(b.title,q),b.author_name?rank(b.author_name,q)+2:999);if(score<999)items.push({id:String(b.id),label:b.title,detail:b.author_name,type:"book",href:"/book/"+encodeURIComponent(b.id),score:score+.1});}const authors=await db.prepare("SELECT id,name FROM authors WHERE COALESCE(is_deleted,0)=0 ORDER BY name ASC LIMIT 500").all<{id:string;name:string}>();for(const a of authors.results??[]){const score=rank(a.name,q);if(score<999)items.push({id:String(a.id),label:a.name,detail:"Author",type:"author",href:"/bookShelf?"+new URLSearchParams({author:String(a.id),source:"homepage"}),score:score+.1});}}}catch(e){console.error("Search database lookup failed; returning game and page matches",e);}
const suggestions=items.filter(x=>(x.score??999)<999).sort((a,b)=>(a.score??999)-(b.score??999)||a.label.localeCompare(b.label)).slice(0,12).map(({score:_,...item})=>item);return NextResponse.json({suggestions},{headers:{"Cache-Control":"no-store"}});}
