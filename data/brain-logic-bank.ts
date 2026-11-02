export type BrainRiddle = { q: string; a: string; e: string; o: string[] };
export type OddOneOut = { o: string[]; a: string; why: string };

const numericOptions = (answer: number, step = 1) => {
  const values = [answer, answer + step, Math.max(0, answer - step), answer + step * 2];
  return [...new Set(values)].slice(0, 4).sort((a,b) => ((a * 17 + 11) % 97) - ((b * 17 + 11) % 97)).map(String);
};

const sequenceRiddles: BrainRiddle[] = Array.from({ length: 50 }, (_, i) => {
  const start = 3 + i * 2, step = 2 + (i % 9), growth = 1 + (i % 5);
  const nums = Array.from({ length: 5 }, (_, n) => start + n * step + n * n * growth);
  const answer = start + 5 * step + 25 * growth;
  return { q: `Find the next number in this sequence: ${nums.join(", ")}, ?`, a: String(answer), e: `The differences increase by ${growth * 2} each time: the rule adds ${step} plus a steadily increasing even amount. The next term is ${answer}.`, o: numericOptions(answer, Math.max(2, growth)) };
});

const numberRiddles: BrainRiddle[] = Array.from({ length: 50 }, (_, i) => {
  const tens = 2 + (i % 7), ones = (i * 3 + 1) % 10;
  const value = tens * 10 + ones, reversed = ones * 10 + tens;
  const sum = tens + ones, difference = Math.abs(value - reversed);
  const answer = String(value);
  const opts = [value, value + 9, value - 9, reversed].filter((v, j, a) => v > 9 && v < 100 && a.indexOf(v) === j);
  while (opts.length < 4) opts.push(value + 11 + opts.length * 10);
  return { q: `I am a two-digit number. My digits add up to ${sum}. Reversing my digits changes my value by ${difference}. What number am I?`, a: answer, e: `The digits are ${tens} and ${ones}; their sum is ${sum}, and ${value} reversed is ${reversed}, a difference of ${difference}.`, o: opts.slice(0,4).map(String) };
});

const ageRiddles: BrainRiddle[] = Array.from({ length: 50 }, (_, i) => {
  const multiplier = 3 + (i % 4), years = (2 + (i % 9)) * (multiplier - 2), age = years / (multiplier - 2);
  const parentAge = multiplier * age;
  return { q: `A parent is ${multiplier} times as old as their child. In ${years} years, the parent will be twice as old as the child. How old is the child now?`, a: String(age), e: `If the child is x, the parent is ${multiplier}x. In ${years} years: ${multiplier}x + ${years} = 2(x + ${years}), so x = ${age}.`, o: numericOptions(age, 2) };
});

const weighingRiddles: BrainRiddle[] = Array.from({ length: 50 }, (_, i) => {
  const total = 8 + (i % 13), group = Math.ceil(total / 3);
  const q = `There are ${total} identical-looking coins and exactly one is heavier. You have a balance scale. What is the most reliable first move to narrow down the heavier coin?`;
  const a = `Divide them into three groups as evenly as possible and weigh two groups`;
  return { q, a, e: `A three-way balance comparison separates the possibilities: if the pans balance, the heavier coin is in the unweighed group; otherwise it is in the heavier pan. Continue dividing the suspect group.`, o: [a, `Weigh all ${total} coins together on one pan`, `Compare just two randomly chosen coins`, `Put every coin on the same pan one at a time`] };
});

const arithmeticRiddles: BrainRiddle[] = Array.from({ length: 50 }, (_, i) => {
  const n = 4 + i, multiplier = 2 + (i % 6), add = 3 + (i % 11), result = n * multiplier + add;
  return { q: `I am thinking of a number. Multiply it by ${multiplier}, then add ${add}, and the result is ${result}. What was my number?`, a: String(n), e: `Undo the operations in reverse order: (${result} − ${add}) ÷ ${multiplier} = ${n}.`, o: numericOptions(n, 3) };
});

const calendarRiddles: BrainRiddle[] = Array.from({ length: 50 }, (_, i) => {
  const days = 7 + i, remainder = days % 7, start = (i % 7);
  const names = ["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"];
  const answer = names[(start + remainder) % 7];
  return { q: `If today is ${names[start]}, what day of the week will it be ${days} days from today?`, a: answer, e: `A week accounts for 7 days. ${days} days leaves a remainder of ${remainder} after complete weeks, so move forward ${remainder} days from ${names[start]}.`, o: [answer, names[(start + remainder + 1) % 7], names[(start + remainder + 2) % 7], names[(start + remainder + 6) % 7]] };
});

export const BRAIN_LOGICAL_RIDDLES: BrainRiddle[] = [
  ...sequenceRiddles, ...numberRiddles, ...ageRiddles,
  ...weighingRiddles, ...arithmeticRiddles, ...calendarRiddles,
];

const oddCategories: { name: string; members: string[]; outsiders: string[]; reason: string }[] = [
  {name:"planets",members:["Mercury","Venus","Earth","Mars","Jupiter"],outsiders:["Sirius","Polaris","Betelgeuse","Vega","Rigel","Orion","Andromeda","Halley","Europa","Titan"],reason:"the other three are planets; this is an astronomical object of a different kind"},
  {name:"mammals",members:["Elephant","Tiger","Dolphin","Bat","Kangaroo"],outsiders:["Crocodile","Eagle","Salmon","Frog","Octopus","Butterfly","Shark","Penguin","Turtle","Trout"],reason:"the other three are mammals; this animal belongs to a different animal group"},
  {name:"prime numbers",members:["2","3","5","7","11"],outsiders:["9","15","21","25","27","33","35","39","49","51"],reason:"the other three are prime numbers; this number is composite"},
  {name:"string instruments",members:["Violin","Cello","Harp","Guitar","Viola"],outsiders:["Flute","Trumpet","Oboe","Trombone","Clarinet","Tuba","Saxophone","Bassoon","Recorder","French horn"],reason:"the other three are string instruments; this is a wind or brass instrument"},
  {name:"oceans and seas",members:["Pacific Ocean","Atlantic Ocean","Indian Ocean","Arctic Ocean","Southern Ocean"],outsiders:["Sahara","Amazon","Everest","Gobi","Nile","Alps","Danube","Kilimanjaro","Caspian Desert","Andes"],reason:"the other three are oceans; this is a landform, river, or mountain feature"},
  {name:"metals",members:["Iron","Copper","Gold","Silver","Aluminium"],outsiders:["Oxygen","Nitrogen","Carbon","Sulfur","Neon","Helium","Chlorine","Hydrogen","Argon","Fluorine"],reason:"the other three are metals; this is a non-metal element"},
  {name:"birds",members:["Sparrow","Eagle","Owl","Penguin","Flamingo"],outsiders:["Lizard","Dolphin","Salmon","Rabbit","Frog","Bee","Snake","Whale","Turtle","Fox"],reason:"the other three are birds; this is not a bird"},
  {name:"countries",members:["Japan","Brazil","Kenya","Norway","Peru"],outsiders:["Tokyo","Nairobi","Amazon","Sahara","Everest","Pacific","Berlin","Andes","Nile","Sydney"],reason:"the other three are countries; this is a city, river, desert, or other place"},
  {name:"geometric shapes",members:["Triangle","Square","Pentagon","Hexagon","Octagon"],outsiders:["Sphere","Cylinder","Cone","Cube","Pyramid","Prism","Torus","Hemisphere","Ellipsoid","Tetrahedron"],reason:"the other three are two-dimensional polygons; this is a three-dimensional solid"},
  {name:"planar shapes",members:["Circle","Oval","Ellipse","Semicircle","Rectangle"],outsiders:["Cube","Sphere","Cone","Cylinder","Pyramid","Prism","Torus","Cuboid","Tetrahedron","Hemisphere"],reason:"the other three are flat two-dimensional shapes; this is a three-dimensional solid"},
  {name:"months",members:["January","March","May","July","August"],outsiders:["Monday","Tuesday","Friday","Sunday","Spring","Summer","Winter","Dawn","Noon","December's Eve"],reason:"the other three are months; this is a weekday or a time/season term"},
  {name:"living plants",members:["Rose","Tulip","Daisy","Orchid","Lily"],outsiders:["Granite","Basalt","Marble","Quartz","Slate","Copper","Iron","Sandstone","Limestone","Obsidian"],reason:"the other three are flowering plants; this is a rock or mineral"},
  {name:"human senses",members:["Sight","Hearing","Smell","Taste","Touch"],outsiders:["Memory","Balance","Imagination","Reason","Speech","Sleep","Hunger","Thirst","Emotion","Reflex"],reason:"the other three are the traditional five senses; this is a different ability or state"},
  {name:"programming languages",members:["Python","Java","Ruby","Swift","Kotlin"],outsiders:["HTML","CSS","SQL","JSON","XML","HTTP","Git","Linux","Docker","React"],reason:"the other three are programming languages; this is a markup, query, data, protocol, or tool term"},
  {name:"literary genres",members:["Mystery","Fantasy","Biography","Thriller","Poetry"],outsiders:["Metaphor","Simile","Alliteration","Hyperbole","Dialogue","Plot","Setting","Chapter","Prologue","Epilogue"],reason:"the other three are literary genres; this is a literary device or story element"},
  {name:"kitchen tools",members:["Whisk","Ladle","Spatula","Peeler","Grater"],outsiders:["Sofa","Curtain","Pillow","Wardrobe","Bookshelf","Carpet","Mirror","Cushion","Lamp","Rug"],reason:"the other three are kitchen utensils; this is a household furnishing"},
  {name:"vehicles",members:["Bicycle","Motorcycle","Car","Bus","Tram"],outsiders:["Kettle","Toaster","Blender","Microwave","Refrigerator","Oven","Freezer","Mixer","Iron","Vacuum"],reason:"the other three are vehicles; this is a household appliance"},
  {name:"musical notation",members:["Quarter note","Half note","Whole note","Eighth note","Sixteenth note"],outsiders:["Treble clef","Bass clef","Sharp","Flat","Natural","Bar line","Rest","Fermata","Tie","Tempo"],reason:"the other three are note-value symbols; this is another musical notation mark or instruction"},
  {name:"weather",members:["Rain","Snow","Hail","Sleet","Drizzle"],outsiders:["Earthquake","Landslide","Eruption","Avalanche","Drought","Wildfire","Tsunami","Tornado","Flood","Sinkhole"],reason:"the other three are forms of precipitation; this is a different natural hazard or event"},
  {name:"body organs",members:["Heart","Liver","Lung","Kidney","Stomach"],outsiders:["Femur","Skull","Rib","Spine","Humerus","Tibia","Patella","Pelvis","Radius","Ulna"],reason:"the other three are internal organs; this is a bone"},
  {name:"energy sources",members:["Solar","Wind","Hydroelectric","Geothermal","Tidal"],outsiders:["Coal","Petrol","Diesel","Natural gas","Kerosene","Coke","Charcoal","Lignite","Peat","Propane"],reason:"the other three are renewable energy sources; this is a fossil fuel"},
  {name:"insects",members:["Ant","Bee","Butterfly","Beetle","Dragonfly"],outsiders:["Spider","Scorpion","Tick","Mite","Crab","Lobster","Centipede","Millipede","Snail","Earthworm"],reason:"the other three are insects; this is another invertebrate group or animal"},
  {name:"continents",members:["Africa","Asia","Europe","Australia","Antarctica"],outsiders:["Greenland","Madagascar","Borneo","Sumatra","Japan","Iceland","Cuba","Sri Lanka","New Zealand","Hawaii"],reason:"the other three are continents; this is an island"},
  {name:"shapes with right angles",members:["Square","Rectangle","Right triangle","L-shaped polygon","Right trapezoid"],outsiders:["Circle","Oval","Rhombus","Acute triangle","Regular pentagon","Equilateral triangle","Parabola","Ellipse","Kite","Obtuse triangle"],reason:"the other three have at least one right angle; this shape does not"},
  {name:"water states or forms",members:["Ice","Snow","Frost","Hail","Glacier"],outsiders:["Steam","Oxygen","Hydrogen","Carbon dioxide","Nitrogen","Helium","Methane","Argon","Neon","Ozone"],reason:"the other three are frozen forms of water; this is a gas or another substance"},
  {name:"sports played with a ball",members:["Cricket","Football","Basketball","Tennis","Volleyball"],outsiders:["Swimming","Gymnastics","Wrestling","Athletics","Fencing","Cycling","Rowing","Archery","Skiing","Boxing"],reason:"the other three are ball sports; this sport does not use a ball"},
  {name:"time units",members:["Second","Minute","Hour","Day","Week"],outsiders:["Metre","Kilogram","Litre","Ampere","Kelvin","Mole","Candela","Newton","Joule","Watt"],reason:"the other three measure time; this is a different unit of measurement"},
  {name:"computer hardware",members:["Keyboard","Mouse","Monitor","Printer","Scanner"],outsiders:["Browser","Spreadsheet","Operating system","Database","Website","Algorithm","Password","Email","Search engine","Application"],reason:"the other three are physical computer peripherals; this is software or an online concept"},
  {name:"means of communication",members:["Telephone","Radio","Television","Letter","Email"],outsiders:["Refrigerator","Washing machine","Microwave","Air conditioner","Dishwasher","Vacuum cleaner","Oven","Blender","Fan","Iron"],reason:"the other three are communication methods; this is a household appliance"},
  {name:"materials",members:["Cotton","Wool","Silk","Linen","Hemp"],outsiders:["Granite","Marble","Slate","Basalt","Quartz","Sandstone","Limestone","Obsidian","Pumice","Shale"],reason:"the other three are natural textile fibres; this is a rock or mineral"}
];

export const ODD_ONE_OUT_BANK: OddOneOut[] = Array.from({ length: 300 }, (_, i) => {
  const category = oddCategories[Math.floor(i / 10)];
  const round = i % 10;
  const start = (round * 2) % category.members.length;
  const group = [0,1,2].map(offset => category.members[(start + offset) % category.members.length]);
  const outsider = category.outsiders[round];
  const options = [...group, outsider];
  const shift = (i * 7) % 4;
  const shuffled = options.map((_, j) => options[(j + shift) % 4]);
  return { o: shuffled, a: outsider, why: `The other three belong to the category “${category.name}”; ${outsider} does not because ${category.reason}.` };
});
