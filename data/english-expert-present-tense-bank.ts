type Q={q:string;o:string[];a:number;e:string};
type V={s:string;v:string;third:string;ing:string;pp:string;sub:string;aux:"do"|"does";have:"have"|"has"};
const verbs:V[]=[
{s:"Mira",v:"read",third:"reads",ing:"reading",pp:"read",sub:"she",aux:"does",have:"has"},
{s:"The students",v:"prepare",third:"prepare",ing:"preparing",pp:"prepared",sub:"they",aux:"do",have:"have"},
{s:"My father",v:"drive",third:"drives",ing:"driving",pp:"driven",sub:"he",aux:"does",have:"has"},
{s:"We",v:"visit",third:"visit",ing:"visiting",pp:"visited",sub:"we",aux:"do",have:"have"},
{s:"The chef",v:"make",third:"makes",ing:"making",pp:"made",sub:"he",aux:"does",have:"has"},
{s:"I",v:"write",third:"write",ing:"writing",pp:"written",sub:"I",aux:"do",have:"have"},
{s:"The baby",v:"sleep",third:"sleeps",ing:"sleeping",pp:"slept",sub:"it",aux:"does",have:"has"},
{s:"They",v:"build",third:"build",ing:"building",pp:"built",sub:"they",aux:"do",have:"have"},
{s:"Our teacher",v:"explain",third:"explains",ing:"explaining",pp:"explained",sub:"she",aux:"does",have:"has"},
{s:"You",v:"speak",third:"speak",ing:"speaking",pp:"spoken",sub:"you",aux:"do",have:"have"},
{s:"The dog",v:"chase",third:"chases",ing:"chasing",pp:"chased",sub:"it",aux:"does",have:"has"},
{s:"My friends",v:"play",third:"play",ing:"playing",pp:"played",sub:"they",aux:"do",have:"have"},
{s:"Rohan",v:"teach",third:"teaches",ing:"teaching",pp:"taught",sub:"he",aux:"does",have:"has"},
{s:"The workers",v:"repair",third:"repair",ing:"repairing",pp:"repaired",sub:"they",aux:"do",have:"have"},
{s:"She",v:"choose",third:"chooses",ing:"choosing",pp:"chosen",sub:"she",aux:"does",have:"has"},
{s:"The children",v:"draw",third:"draw",ing:"drawing",pp:"drawn",sub:"they",aux:"do",have:"have"},
{s:"My brother",v:"catch",third:"catches",ing:"catching",pp:"caught",sub:"he",aux:"does",have:"has"},
{s:"We",v:"organise",third:"organise",ing:"organising",pp:"organised",sub:"we",aux:"do",have:"have"},
{s:"The nurse",v:"check",third:"checks",ing:"checking",pp:"checked",sub:"she",aux:"does",have:"has"},
{s:"Birds",v:"fly",third:"fly",ing:"flying",pp:"flown",sub:"they",aux:"do",have:"have"},
{s:"He",v:"take",third:"takes",ing:"taking",pp:"taken",sub:"he",aux:"does",have:"has"},
{s:"The guests",v:"arrive",third:"arrive",ing:"arriving",pp:"arrived",sub:"they",aux:"do",have:"have"},
{s:"My mother",v:"cook",third:"cooks",ing:"cooking",pp:"cooked",sub:"she",aux:"does",have:"has"},
{s:"I",v:"see",third:"see",ing:"seeing",pp:"seen",sub:"I",aux:"do",have:"have"},
{s:"The mechanic",v:"fix",third:"fixes",ing:"fixing",pp:"fixed",sub:"he",aux:"does",have:"has"},
{s:"They",v:"begin",third:"begin",ing:"beginning",pp:"begun",sub:"they",aux:"do",have:"have"},
{s:"The shop",v:"open",third:"opens",ing:"opening",pp:"opened",sub:"it",aux:"does",have:"has"},
{s:"Our team",v:"win",third:"wins",ing:"winning",pp:"won",sub:"it",aux:"does",have:"has"},
{s:"You",v:"keep",third:"keep",ing:"keeping",pp:"kept",sub:"you",aux:"do",have:"have"},
{s:"The scientist",v:"study",third:"studies",ing:"studying",pp:"studied",sub:"she",aux:"does",have:"has"}
];
const bank:Q[]=[];
const add=(q:string,correct:string,wrong:string[],e:string)=>{const opts=[correct,...wrong].slice(0,4);const shift=bank.length%4;const o=opts.map((_,i)=>opts[(i+shift)%4]);bank.push({q,o,a:o.indexOf(correct),e});};
for(const x of verbs){
 add(`Every weekday, ${x.s.toLowerCase()} ___ the task before lunch.`,x.third,[x.v,x.ing,x.pp], "The simple present expresses a regular habit. A third-person singular subject takes the -s or -es form; plural subjects and I/you use the base form.");
 add(`Choose the correct negative: “${x.s} ___ ${x.v} the task on Sundays.”`,`${x.aux} not ${x.v}`,[`${x.have} not ${x.pp}`,`is not ${x.ing}`,`not ${x.third}`],"The simple present negative uses do not or does not followed by the base form of the verb.");
 add(`Choose the correct question: “___ ${x.sub} ${x.v} the task every day?”`,x.aux.toUpperCase(),[x.have.toUpperCase(),"Is","Did"],"Present simple questions use do or does + subject + base verb.");
 add(`Look! ${x.s} ___ right now.`,`is ${x.ing}`,[` ${x.third}`,`has ${x.pp}`,`are ${x.ing}`],"Present continuous describes an action happening now: am/is/are + verb-ing.");
 add(`Choose the correct present continuous negative: “${x.s} ___ at the moment.”`,`is not ${x.ing}`,[`does not ${x.v}`,`has not ${x.pp}`,`not ${x.third}`],"Present continuous negatives place not after am/is/are and use the -ing form.");
 add(`So far, ${x.s.toLowerCase()} ___ the task.`,`${x.have} ${x.pp}`,[`${x.aux} ${x.v}`,`is ${x.ing}`,`did ${x.v}`],"Present perfect uses have/has + past participle for an action completed with relevance to the present.");
 add(`Choose the correct form: “${x.s} ___ here since early morning.”`,`${x.have} ${x.pp}`,[`${x.aux} ${x.v}`,`is ${x.ing}`,`was ${x.ing}`],"With since to show a situation continuing from a starting point, the present perfect is commonly used.");
 add(`For two hours, ${x.s.toLowerCase()} ___ on the task.`,`${x.have} been ${x.ing}`,[`${x.have} ${x.pp}`,`is ${x.ing}`,`${x.aux} ${x.v}`],"Present perfect continuous uses have/has been + verb-ing to emphasise duration up to now.");
 add(`Choose the correct short answer: “Does ${x.sub} ${x.v} regularly?”`,`Yes, ${x.sub} does.`,[`Yes, ${x.sub} do.`,`Yes, ${x.sub} is.`,`Yes, ${x.sub} has.`],"A question beginning with does takes does in the short affirmative answer.");
 add(`The timetable says the service ___ at nine tomorrow.`,x.third,[x.ing,`is ${x.ing}`,`has ${x.pp}`],"The simple present can describe fixed schedules and timetables, including future times.");
}
if(bank.length!==300) throw new Error("Present Tense bank must contain exactly 300 questions");
export const PRESENT_TENSE_QUESTION_BANK:Q[]=bank;
