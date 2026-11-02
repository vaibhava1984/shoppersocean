export type RiddleCornerQuestion = { id: string; q: string; a: string; o: [string,string,string,string]; e: string };

const numericOptions = (answer: number, step = 1): [string,string,string,string] => {
  const values = [answer, answer + step, Math.max(0, answer - step), answer + step * 2];
  const unique = [...new Set(values)];
  while (unique.length < 4) unique.push(answer + step * (unique.length + 2));
  return unique.slice(0,4).map(String) as [string,string,string,string];
};
const days = ["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"];
const make = (id:number,q:string,a:string,o:string[],e:string):RiddleCornerQuestion => ({
  id: "riddle-corner-" + String(id).padStart(3,"0"), q, a,
  o: o.slice(0,4) as [string,string,string,string], e
});
const banks: RiddleCornerQuestion[][] = [];

banks.push(Array.from({length:30},(_,i)=>{
  const start=2+i, step=2+(i%7), growth=1+(i%4);
  const seq=Array.from({length:5},(_,n)=>start+n*step+n*n*growth);
  const answer=start+5*step+25*growth;
  return make(i+1,`Find the next number: ${seq.join(", ")}, ?`,String(answer),numericOptions(answer,Math.max(2,growth)),`The differences rise by ${growth*2} each time. Continuing that pattern gives ${answer}.`);
}));
banks.push(Array.from({length:30},(_,i)=>{
  const n=5+i,m=2+(i%5),add=4+(i%9),result=n*m+add;
  return make(31+i,`A number is multiplied by ${m} and then ${add} is added. The result is ${result}. What was the original number?`,String(n),numericOptions(n,2),`Reverse the operations: (${result} − ${add}) ÷ ${m} = ${n}.`);
}));
banks.push(Array.from({length:30},(_,i)=>{
  const child=6+(i%19),factor=3+(i%3),years=(factor-2)*child;
  return make(61+i,`A parent is ${factor} times as old as a child. In ${years} years, the parent will be twice the child's age. How old is the child now?`,String(child),numericOptions(child,2),`Let the child's age be x. ${factor}x + ${years} = 2(x + ${years}), so x = ${child}.`);
}));
banks.push(Array.from({length:30},(_,i)=>{
  const count=8+i;
  const a="Divide the coins into three groups as evenly as possible and weigh two groups";
  return make(91+i,`Among ${count} identical-looking coins, one is heavier. With a balance scale, what is the best first move to locate it efficiently?`,a,[a,"Weigh every coin together on one pan","Compare only two randomly chosen coins","Place all coins on the scale one at a time"],"A three-way split lets the balance identify which group contains the heavier coin, or shows it is in the unweighed group.");
}));
banks.push(Array.from({length:30},(_,i)=>{
  const tens=2+(i%7), ones=(i*3+1)%tens, n=tens*10+ones, rev=ones*10+tens, sum=tens+ones, diff=n-rev;
  const opts=[n,n+9,n-9,rev].filter((v,j,a)=>v>=10&&v<=99&&a.indexOf(v)===j);
  while(opts.length<4)opts.push(n+11+opts.length*10);
  return make(121+i,`I am a two-digit number. My digits add to ${sum}; the tens digit is greater than the ones digit; reversing the digits makes the number ${diff} smaller. What am I?`,String(n),opts.slice(0,4).map(String),`The digits are ${tens} and ${ones}. Reversing ${n} gives ${rev}, which is ${diff} less.`);
}));
banks.push(Array.from({length:30},(_,i)=>{
  const start=i%7, ahead=8+i, rem=ahead%7, answer=days[(start+rem)%7];
  const opts=[answer,days[(start+rem+1)%7],days[(start+rem+2)%7],days[(start+rem+6)%7]];
  return make(151+i,`If today is ${days[start]}, what day will it be ${ahead} days from today?`,answer,opts,`Complete weeks do not change the weekday. ${ahead} days leaves a remainder of ${rem}; move forward ${rem} days.`);
}));
banks.push(Array.from({length:30},(_,i)=>{
  const a=3+(i%8),b=4+((i*3)%9),c=a*b;
  return make(181+i,`A code uses this rule: the first number is multiplied by the second. If the pair is ${a} and ${b}, what is the code?`,String(c),numericOptions(c,Math.max(2,a)),`Multiply the two values: ${a} × ${b} = ${c}.`);
}));
banks.push(Array.from({length:30},(_,i)=>{
  const answer="Use the bulb's light and warmth to distinguish the three switches";
  return make(211+i,`Three switches are outside a closed room; one controls a bulb inside. You may enter once, and the bulb becomes warm when lit. Which method identifies the correct switch?`,answer,[answer,"Turn all switches on and guess","Enter repeatedly while testing one switch at a time","Leave all switches off and inspect the door"],"Turn one switch on for a few minutes, turn it off, turn a second on, then enter. Lit means the second; warm means the first; cold means the third.");
}));
banks.push(Array.from({length:30},(_,i)=>{
  const answer="Choose one item from the basket labelled MIXED";
  return make(241+i,`Three baskets are labelled APPLES, ORANGES and MIXED, but every label is wrong. What is the best first move if you may take only one fruit?`,answer,[answer,"Choose from the basket labelled APPLES","Choose from the basket labelled ORANGES","Take one fruit from each basket"],"The MIXED label must be false, so that basket contains only one fruit type. One draw identifies it, and the remaining labels follow by elimination.");
}));
banks.push(Array.from({length:30},(_,i)=>{
  const answer="Ask either guard which door the other guard would say is safe, then choose the opposite door";
  return make(271+i,`Two doors lead out: one is safe and one is dangerous. One guard always lies and the other always tells the truth. What single question works when you may ask either guard?`,answer,[answer,"Ask whether the door on the left is safe","Ask the truthful guard to identify themselves","Ask both guards to point at a door"],"Either guard reports the other guard's answer, which identifies the dangerous door. Choose the opposite.");
}));

export const RIDDLE_CORNER_BANK: RiddleCornerQuestion[] = banks.flat();
