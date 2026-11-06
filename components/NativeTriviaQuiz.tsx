"use client";

import { useEffect, useState } from "react";

type Question = { question: string; options: string[]; answer: number; fact: string };

const QUESTIONS: Question[] = [
  {
    "question": "Which planet is known as the Red Planet?",
    "options": [
      "Venus",
      "Mars",
      "Jupiter",
      "Saturn"
    ],
    "answer": 1,
    "fact": "Mars is called the Red Planet because iron oxide (rust) covers its surface."
  },
  {
    "question": "What is the capital city of France?",
    "options": [
      "London",
      "Berlin",
      "Paris",
      "Madrid"
    ],
    "answer": 2,
    "fact": "Paris is the capital and most populous city of France."
  },
  {
    "question": "Which chemical element has the symbol 'O'?",
    "options": [
      "Gold",
      "Oxygen",
      "Osmium",
      "Silver"
    ],
    "answer": 1,
    "fact": "Oxygen is a chemical element with symbol O and atomic number 8."
  },
  {
    "question": "What is the largest mammal on Earth?",
    "options": [
      "African Elephant",
      "Blue Whale",
      "Giraffe",
      "Hippopotamus"
    ],
    "answer": 1,
    "fact": "The blue whale is the largest animal known to have ever lived."
  },
  {
    "question": "Who painted the Mona Lisa?",
    "options": [
      "Vincent van Gogh",
      "Pablo Picasso",
      "Leonardo da Vinci",
      "Claude Monet"
    ],
    "answer": 2,
    "fact": "Leonardo da Vinci painted the Mona Lisa during the Italian Renaissance."
  },
  {
    "question": "What is the boiling point of water at standard atmospheric pressure?",
    "options": [
      "50°C",
      "100°C",
      "150°C",
      "212°C"
    ],
    "answer": 1,
    "fact": "Pure water boils at 100 degrees Celsius (212 degrees Fahrenheit) at sea level."
  },
  {
    "question": "Which country is home to the ancient pyramid complex of Giza?",
    "options": [
      "Mexico",
      "Sudan",
      "Egypt",
      "Iraq"
    ],
    "answer": 2,
    "fact": "Giza is located on the west bank of the Nile River, near Cairo, Egypt."
  },
  {
    "question": "What is the hardest natural substance on Earth?",
    "options": [
      "Gold",
      "Iron",
      "Diamond",
      "Quartz"
    ],
    "answer": 2,
    "fact": "Diamond is a solid form of carbon with its atoms arranged in a crystal structure, scoring 10 on the Mohs scale."
  },
  {
    "question": "Which instrument is used to measure earthquakes?",
    "options": [
      "Barometer",
      "Seismograph",
      "Thermometer",
      "Hygrometer"
    ],
    "answer": 1,
    "fact": "A seismograph detects and records seismic waves produced by earthquakes."
  },
  {
    "question": "What is the official currency of Japan?",
    "options": [
      "Yuan",
      "Won",
      "Yen",
      "Ringgit"
    ],
    "answer": 2,
    "fact": "The Japanese yen is the official currency of Japan and a major world reserve currency."
  },
  {
    "question": "Which gas makes up the majority of Earth's atmosphere?",
    "options": [
      "Oxygen",
      "Carbon Dioxide",
      "Nitrogen",
      "Argon"
    ],
    "answer": 2,
    "fact": "Nitrogen constitutes approximately 78% of the Earth's atmosphere."
  },
  {
    "question": "What is the capital city of Canada?",
    "options": [
      "Toronto",
      "Vancouver",
      "Ottawa",
      "Montreal"
    ],
    "answer": 2,
    "fact": "Ottawa is the federally designated capital of Canada."
  },
  {
    "question": "Which artist is famous for cutting off part of his ear?",
    "options": [
      "Pablo Picasso",
      "Vincent van Gogh",
      "Claude Monet",
      "Salvador Dali"
    ],
    "answer": 1,
    "fact": "Dutch painter Vincent van Gogh famously mutilated his ear during a breakdown."
  },
  {
    "question": "What is the chemical symbol for gold?",
    "options": [
      "Ag",
      "Au",
      "Gd",
      "Go"
    ],
    "answer": 1,
    "fact": "Au comes from aurum, the Latin word for gold."
  },
  {
    "question": "Which ocean is the largest on Earth?",
    "options": [
      "Atlantic Ocean",
      "Indian Ocean",
      "Pacific Ocean",
      "Arctic Ocean"
    ],
    "answer": 2,
    "fact": "The Pacific Ocean is the largest and deepest of all oceanic divisions."
  },
  {
    "question": "What is the capital city of Italy?",
    "options": [
      "Milan",
      "Florence",
      "Venice",
      "Rome"
    ],
    "answer": 3,
    "fact": "Rome is the historic and political capital city of Italy."
  },
  {
    "question": "Which planet is closest to the Sun?",
    "options": [
      "Venus",
      "Earth",
      "Mercury",
      "Mars"
    ],
    "answer": 2,
    "fact": "Mercury is the smallest and closest planet to the sun in our solar system."
  },
  {
    "question": "What is the chemical symbol for silver?",
    "options": [
      "Si",
      "Ag",
      "Sv",
      "As"
    ],
    "answer": 1,
    "fact": "Ag represents silver, derived from the Latin argentum."
  },
  {
    "question": "Which animal is traditionally known as the King of the Jungle?",
    "options": [
      "Tiger",
      "Lion",
      "Elephant",
      "Leopard"
    ],
    "answer": 1,
    "fact": "The lion is nicknamed the king of the jungle despite inhabiting grasslands and plains."
  },
  {
    "question": "What is the freezing point of water in Celsius?",
    "options": [
      "-10°C",
      "0°C",
      "10°C",
      "100°C"
    ],
    "answer": 1,
    "fact": "Water freezes at zero degrees Celsius under normal atmospheric pressure."
  },
  {
    "question": "Which country has the largest land area in the world?",
    "options": [
      "China",
      "Canada",
      "United States",
      "Russia"
    ],
    "answer": 3,
    "fact": "Russia is the largest country globally, spanning over 17 million square kilometers."
  },
  {
    "question": "What is the primary structural protein in human hair and nails?",
    "options": [
      "Collagen",
      "Keratin",
      "Fibrin",
      "Elastin"
    ],
    "answer": 1,
    "fact": "Keratin is the fibrous structural protein that protects cells and builds hair and nails."
  },
  {
    "question": "Which scientist introduced the laws of motion and universal gravitation?",
    "options": [
      "Albert Einstein",
      "Isaac Newton",
      "Galileo Galilei",
      "Thomas Edison"
    ],
    "answer": 1,
    "fact": "Sir Isaac Newton outlined classical mechanics through his revolutionary laws of motion."
  },
  {
    "question": "What is the capital of South Korea?",
    "options": [
      "Busan",
      "Seoul",
      "Incheon",
      "Daegu"
    ],
    "answer": 1,
    "fact": "Seoul is the sprawling capital city of South Korea."
  },
  {
    "question": "Which ocean is the smallest of the world's five oceans?",
    "options": [
      "Indian Ocean",
      "Arctic Ocean",
      "Southern Ocean",
      "Atlantic Ocean"
    ],
    "answer": 1,
    "fact": "The Arctic Ocean is the smallest and shallowest of the world's major oceans."
  },
  {
    "question": "What is the chemical symbol for sodium?",
    "options": [
      "So",
      "Sd",
      "Na",
      "Nm"
    ],
    "answer": 2,
    "fact": "Na is derived from the Neo-Latin word natrium."
  },
  {
    "question": "Which country is home to the ancient ruin of Machu Picchu?",
    "options": [
      "Mexico",
      "Peru",
      "Brazil",
      "Chile"
    ],
    "answer": 1,
    "fact": "Machu Picchu is a 15th-century Inca citadel situated high in the Andes Mountains in Peru."
  },
  {
    "question": "What is the capital city of Brazil?",
    "options": [
      "Rio de Janeiro",
      "Sao Paulo",
      "Brasilia",
      "Salvador"
    ],
    "answer": 2,
    "fact": "Brasilia is the planned federal capital city of Brazil."
  },
  {
    "question": "Which tree is famous for producing acorns?",
    "options": [
      "Pine",
      "Oak",
      "Maple",
      "Willow"
    ],
    "answer": 1,
    "fact": "Oak trees produce hard, woody nuts known as acorns."
  },
  {
    "question": "What is the main organ of the human nervous system?",
    "options": [
      "Heart",
      "Brain",
      "Stomach",
      "Lungs"
    ],
    "answer": 1,
    "fact": "The brain acts as the central command center for the human nervous system."
  },
  {
    "question": "Which gas is most abundant in the universe?",
    "options": [
      "Oxygen",
      "Hydrogen",
      "Nitrogen",
      "Carbon Dioxide"
    ],
    "answer": 1,
    "fact": "Hydrogen is the lightest and most abundant chemical element in the observable universe."
  },
  {
    "question": "What is the capital city of Germany?",
    "options": [
      "Munich",
      "Berlin",
      "Frankfurt",
      "Hamburg"
    ],
    "answer": 1,
    "fact": "Berlin is the historic capital city and cultural heart of Germany."
  },
  {
    "question": "What is the chemical symbol for copper?",
    "options": [
      "Co",
      "Cu",
      "Cp",
      "Cr"
    ],
    "answer": 1,
    "fact": "Cu is derived from cuprum, the Latin word for copper."
  },
  {
    "question": "Which mountain is the highest peak in the world?",
    "options": [
      "K2",
      "Kangchenjunga",
      "Mount Everest",
      "Makalu"
    ],
    "answer": 2,
    "fact": "Mount Everest stands as the highest elevation above sea level on Earth."
  },
  {
    "question": "What is the primary currency of Japan?",
    "options": [
      "Yuan",
      "Yen",
      "Won",
      "Ringgit"
    ],
    "answer": 1,
    "fact": "The Japanese yen is the official monetary currency of Japan."
  },
  {
    "question": "Which organ in the human body cleanses blood and produces bile?",
    "options": [
      "Kidney",
      "Liver",
      "Pancreas",
      "Spleen"
    ],
    "answer": 1,
    "fact": "The liver plays a vital role in detoxification, protein synthesis, and biochemical production like bile."
  },
  {
    "question": "What is the freezing point of water in Fahrenheit?",
    "options": [
      "0°F",
      "32°F",
      "100°F",
      "212°F"
    ],
    "answer": 1,
    "fact": "Water freezes at 32 degrees Fahrenheit under normal atmospheric conditions."
  },
  {
    "question": "What is the chemical symbol for lead?",
    "options": [
      "Le",
      "Pb",
      "Ld",
      "Pd"
    ],
    "answer": 1,
    "fact": "Pb comes from the Latin word plumbum, meaning lead."
  },
  {
    "question": "Which planet is known for its prominent system of icy rings?",
    "options": [
      "Jupiter",
      "Saturn",
      "Uranus",
      "Neptune"
    ],
    "answer": 1,
    "fact": "Saturn is renowned for its spectacular and complex ring system."
  },
  {
    "question": "What is the largest bird alive today?",
    "options": [
      "Emu",
      "Albatross",
      "Ostrich",
      "Condor"
    ],
    "answer": 2,
    "fact": "The ostrich is the largest and heaviest living bird species on Earth."
  },
  {
    "question": "Which European country is famous for inventing pizza?",
    "options": [
      "France",
      "Greece",
      "Italy",
      "Spain"
    ],
    "answer": 2,
    "fact": "Traditional pizza originated in the Campania region of Italy, specifically in Naples."
  },
  {
    "question": "What is the official language of Brazil?",
    "options": [
      "Spanish",
      "Portuguese",
      "English",
      "French"
    ],
    "answer": 1,
    "fact": "Portuguese is spoken nationwide as the official language of Brazil."
  },
  {
    "question": "Which famous physicist developed the theories of relativity?",
    "options": [
      "Isaac Newton",
      "Galileo Galilei",
      "Albert Einstein",
      "Niels Bohr"
    ],
    "answer": 2,
    "fact": "Albert Einstein revolutionized modern physics through his special and general theories of relativity."
  },
  {
    "question": "What is the chemical formula for carbon dioxide?",
    "options": [
      "CO",
      "CO2",
      "C2O",
      "H2O"
    ],
    "answer": 1,
    "fact": "Carbon dioxide consists of one carbon atom bonded to two oxygen atoms (CO2)."
  },
  {
    "question": "Which continent contains the Amazon River basin?",
    "options": [
      "Africa",
      "Asia",
      "South America",
      "Australia"
    ],
    "answer": 2,
    "fact": "The Amazon River basin is located in South America, spanning across multiple countries."
  },
  {
    "question": "What is the capital city of Egypt?",
    "options": [
      "Alexandria",
      "Cairo",
      "Luxor",
      "Giza"
    ],
    "answer": 1,
    "fact": "Cairo is the bustling capital city of Egypt along the Nile River."
  },
  {
    "question": "Which gas do humans inhale to support cellular respiration?",
    "options": [
      "Nitrogen",
      "Oxygen",
      "Carbon Dioxide",
      "Hydrogen"
    ],
    "answer": 1,
    "fact": "Oxygen is the vital gas inhaled by humans to power cellular energy metabolism."
  },
  {
    "question": "What is the primary ingredient in chocolate?",
    "options": [
      "Cocoa beans",
      "Vanilla beans",
      "Coffee beans",
      "Sugar cane"
    ],
    "answer": 0,
    "fact": "Chocolate is processed from roasted and ground cacao seeds."
  },
  {
    "question": "Which instrument measures atmospheric pressure changes?",
    "options": [
      "Thermometer",
      "Barometer",
      "Hygrometer",
      "Altimeter"
    ],
    "answer": 1,
    "fact": "A barometer is used extensively in meteorology to measure atmospheric pressure."
  },
  {
    "question": "What is the capital of Spain?",
    "options": [
      "Barcelona",
      "Madrid",
      "Seville",
      "Valencia"
    ],
    "answer": 1,
    "fact": "Madrid is the central political and cultural capital of Spain."
  },
  {
    "question": "Which ancient civilization built the monumental city of Machu Picchu high in the Andes?",
    "options": [
          "Aztec",
          "Mayan",
          "Inca",
          "Olmec"
    ],
    "answer": 2,
    "fact": "The Inca Empire constructed Machu Picchu in the 15th century as a royal estate and sanctuary."
  },
  {
    "question": "What is the primary mineral component found in limestone rocks?",
    "options": [
          "Quartz",
          "Calcite",
          "Feldspar",
          "Gypsum"
    ],
    "answer": 1,
    "fact": "Limestone is a sedimentary rock composed primarily of calcite (calcium carbonate)."
  },
  {
    "question": "Which international organization has its headquarters in Geneva, Switzerland?",
    "options": [
          "United Nations",
          "World Health Organization",
          "World Bank",
          "International Monetary Fund"
    ],
    "answer": 1,
    "fact": "The World Health Organization (WHO), a specialized agency of the UN, is headquartered in Geneva."
  },
  {
    "question": "What is the powerhouse organelle responsible for cellular energy production?",
    "options": [
          "Ribosome",
          "Nucleus",
          "Mitochondria",
          "Golgi apparatus"
    ],
    "answer": 2,
    "fact": "Mitochondria generate most of the chemical energy needed to power cellular biochemical reactions."
  },
  {
    "question": "Which European country is renowned for its fjords and coastal archipelagos?",
    "options": [
          "Sweden",
          "Finland",
          "Norway",
          "Denmark"
    ],
    "answer": 2,
    "fact": "Norway features thousands of dramatic, glacier-carved fjords along its extensive western coastline."
  },
  {
    "question": "What is the chemical symbol for iron?",
    "options": [
          "Ir",
          "In",
          "Fe",
          "Fi"
    ],
    "answer": 2,
    "fact": "Fe stands for iron, derived from the Latin word ferrum."
  },
  {
    "question": "Which literary work begins with the famous line, 'It was the best of times, it was the worst of times'?",
    "options": [
          "Moby-Dick",
          "A Tale of Two Cities",
          "War and Peace",
          "Pride and Prejudice"
    ],
    "answer": 1,
    "fact": "Charles Dickens opened his 1859 historical novel A Tale of Two Cities with this iconic antithesis."
  },
  {
    "question": "What is the capital city of Argentina?",
    "options": [
          "Santiago",
          "Buenos Aires",
          "Lima",
          "Bogota"
    ],
    "answer": 1,
    "fact": "Buenos Aires is the primate city and capital of Argentina."
  },
  {
    "question": "Which vitamin is predominantly produced in the human skin through ultraviolet light exposure?",
    "options": [
          "Vitamin A",
          "Vitamin C",
          "Vitamin D",
          "Vitamin K"
    ],
    "answer": 2,
    "fact": "The human body synthesizes Vitamin D when bare skin is exposed to UVB rays from the sun."
  },
  {
    "question": "What is the longest river on the African continent?",
    "options": [
          "Congo River",
          "Niger River",
          "Nile River",
          "Zambezi River"
    ],
    "answer": 2,
    "fact": "The Nile River is widely accepted as the longest river in the world, flowing northward through Africa."
  },
  {
    "question": "Which celestial body is classified as a dwarf planet located in the Kuiper Belt?",
    "options": [
          "Titan",
          "Pluto",
          "Europa",
          "Ganymede"
    ],
    "answer": 1,
    "fact": "Pluto was reclassified as a dwarf planet by the International Astronomical Union in 2006."
  },
  {
    "question": "What is the chemical symbol for potassium?",
    "options": [
          "Po",
          "Pt",
          "K",
          "Pm"
    ],
    "answer": 2,
    "fact": "K is the chemical symbol for potassium, derived from the Neo-Latin word kalium."
  },
  {
    "question": "Which artist created the monumental mural painting 'Guernica' in 1937?",
    "options": [
          "Claude Monet",
          "Pablo Picasso",
          "Salvador Dali",
          "Henri Matisse"
    ],
    "answer": 1,
    "fact": "Pablo Picasso painted Guernica as a powerful anti-war statement reflecting the bombing of a Basque town."
  },
  {
    "question": "What is the capital city of New Zealand?",
    "options": [
          "Auckland",
          "Christchurch",
          "Wellington",
          "Hamilton"
    ],
    "answer": 2,
    "fact": "Wellington is the capital city and second-most populous urban area of New Zealand."
  },
  {
    "question": "Which gas is primarily responsible for the greenhouse effect on Venus?",
    "options": [
          "Methane",
          "Carbon dioxide",
          "Water vapor",
          "Ozone"
    ],
    "answer": 1,
    "fact": "Venus has a thick atmosphere of carbon dioxide that traps heat through an extreme greenhouse effect."
  },
  {
    "question": "What is the primary language spoken in Mexico?",
    "options": [
          "Portuguese",
          "Spanish",
          "English",
          "French"
    ],
    "answer": 1,
    "fact": "Spanish is the national and most widely spoken language in Mexico."
  },
  {
    "question": "Which bone is the longest and strongest human bone located in the leg?",
    "options": [
          "Tibia",
          "Fibula",
          "Femur",
          "Humerus"
    ],
    "answer": 2,
    "fact": "The femur (thigh bone) is the longest, heaviest, and strongest skeletal bone in the human body."
  },
  {
    "question": "What is the capital city of Turkey?",
    "options": [
          "Istanbul",
          "Ankara",
          "Izmir",
          "Antalya"
    ],
    "answer": 1,
    "fact": "Ankara is the capital city of Turkey, located in the central Anatolia region."
  },
  {
    "question": "Which scientific instrument is used to measure humidity in the atmosphere?",
    "options": [
          "Barometer",
          "Anemometer",
          "Hygrometer",
          "Altimeter"
    ],
    "answer": 2,
    "fact": "A hygrometer is an instrument used to gauge the amount of humidity and water vapor in air."
  },
  {
    "question": "What is the chemical symbol for silver?",
    "options": [
          "Si",
          "Ag",
          "Sr",
          "Sn"
    ],
    "answer": 1,
    "fact": "Ag denotes silver, stemming from the Latin word argentum."
  },
  {
    "question": "Which composer wrote the famous 'Fifth Symphony', featuring the iconic opening motif?",
    "options": [
          "Wolfgang Amadeus Mozart",
          "Ludwig van Beethoven",
          "Johann Sebastian Bach",
          "Frédéric Chopin"
    ],
    "answer": 1,
    "fact": "Ludwig van Beethoven composed his Symphony No. 5 in C minor between 1804 and 1808."
  },
  {
    "question": "What is the capital city of Greece?",
    "options": [
          "Thessaloniki",
          "Athens",
          "Patras",
          "Heraklion"
    ],
    "answer": 1,
    "fact": "Athens is the historic capital and largest city of Greece."
  },
  {
    "question": "Which layer of the atmosphere contains the ozone layer that absorbs UV radiation?",
    "options": [
          "Troposphere",
          "Stratosphere",
          "Mesosphere",
          "Thermosphere"
    ],
    "answer": 1,
    "fact": "The stratosphere houses the ozone layer, which filters out harmful ultraviolet radiation from the sun."
  },
  {
    "question": "What is the chemical formula for ordinary table salt?",
    "options": [
          "HCl",
          "NaOH",
          "NaCl",
          "KCl"
    ],
    "answer": 2,
    "fact": "Sodium chloride (NaCl) is the ionic compound commonly known as table salt."
  },
  {
    "question": "Which country spans across two continents (Europe and Asia)?",
    "options": [
          "Egypt",
          "Turkey",
          "Mexico",
          "Australia"
    ],
    "answer": 1,
    "fact": "Turkey spans across Eastern Europe and Western Asia, with Istanbul bridging the Bosporus strait."
  },
  {
    "question": "What is the capital city of South Africa (administrative seat)?",
    "options": [
          "Johannesburg",
          "Cape Town",
          "Pretoria",
          "Durban"
    ],
    "answer": 2,
    "fact": "Pretoria serves as the executive and administrative capital city of South Africa."
  },
  {
    "question": "Which animal is classified as the largest land mammal on Earth?",
    "options": [
          "White Rhinoceros",
          "African Bush Elephant",
          "Hippopotamus",
          "Giraffe"
    ],
    "answer": 1,
    "fact": "The African bush elephant is the largest living terrestrial animal."
  },
  {
    "question": "What is the chemical symbol for mercury?",
    "options": [
          "Mg",
          "Mn",
          "Hg",
          "Me"
    ],
    "answer": 2,
    "fact": "Hg is the chemical symbol for mercury, derived from hydrargyrum (liquid silver)."
  },
  {
    "question": "Which ancient structure was built as a tomb for the Mughal emperor Shah Jahan's wife?",
    "options": [
          "Red Fort",
          "Qutub Minar",
          "Taj Mahal",
          "Fatehpur Sikri"
    ],
    "answer": 2,
    "fact": "The Taj Mahal in Agra was commissioned by Shah Jahan as a mausoleum for his beloved wife Mumtaz Mahal."
  },
  {
    "question": "What is the capital city of Sweden?",
    "options": [
          "Oslo",
          "Copenhagen",
          "Stockholm",
          "Helsinki"
    ],
    "answer": 2,
    "fact": "Stockholm is the capital and most populous urban area of Sweden."
  },
  {
    "question": "Which chemical element is primarily used in pencils instead of lead?",
    "options": [
          "Sulfur",
          "Graphite",
          "Phosphorus",
          "Silicon"
    ],
    "answer": 1,
    "fact": "Pencils contain non-toxic graphite mixed with clay, not poisonous lead."
  },
  {
    "question": "What is the capital city of Kenya?",
    "options": [
          "Mombasa",
          "Nairobi",
          "Kisumu",
          "Nakuru"
    ],
    "answer": 1,
    "fact": "Nairobi is the vibrant capital and largest city of Kenya."
  },
  {
    "question": "Which ocean lies between Africa, Australia, Southern Asia, and Antarctica?",
    "options": [
          "Atlantic Ocean",
          "Pacific Ocean",
          "Indian Ocean",
          "Arctic Ocean"
    ],
    "answer": 2,
    "fact": "The Indian Ocean is the third largest of the world's oceanic divisions."
  },
  {
    "question": "What is the hardest mineral known on the Mohs hardness scale?",
    "options": [
          "Corundum",
          "Topaz",
          "Diamond",
          "Quartz"
    ],
    "answer": 2,
    "fact": "Diamond ranks at the absolute top (10) of the Mohs scale of mineral hardness."
  },
  {
    "question": "Which famous scientist formulated the theory of evolution by natural selection?",
    "options": [
          "Gregor Mendel",
          "Charles Darwin",
          "Louis Pasteur",
          "Alfred Russel Wallace"
    ],
    "answer": 1,
    "fact": "Charles Darwin outlined the principles of natural selection in his landmark 1859 book On the Origin of Species."
  },
  {
    "question": "What is the capital city of Norway?",
    "options": [
          "Stockholm",
          "Copenhagen",
          "Oslo",
          "Bergen"
    ],
    "answer": 2,
    "fact": "Oslo is the capital and most populous city of Norway."
  },
  {
    "question": "Which gas is released during photosynthesis by green plants?",
    "options": [
          "Carbon dioxide",
          "Nitrogen",
          "Oxygen",
          "Hydrogen"
    ],
    "answer": 2,
    "fact": "Plants release oxygen as a metabolic byproduct during the light-dependent reactions of photosynthesis."
  },
  {
    "question": "What is the chemical symbol for tin?",
    "options": [
          "Ti",
          "Tn",
          "Sn",
          "St"
    ],
    "answer": 2,
    "fact": "Sn is the chemical symbol for tin, derived from the Latin word stannum."
  },
  {
    "question": "Which desert covers a large portion of northern Africa?",
    "options": [
          "Kalahari Desert",
          "Sahara Desert",
          "Namib Desert",
          "Gobi Desert"
    ],
    "answer": 1,
    "fact": "The Sahara Desert is the largest hot desert on Earth, spanning across North Africa."
  },
  {
    "question": "What is the capital city of Portugal?",
    "options": [
          "Porto",
          "Lisbon",
          "Coimbra",
          "Faro"
    ],
    "answer": 1,
    "fact": "Lisbon is the coastal capital and largest city of Portugal."
  },
  {
    "question": "Which subatomic particle carries a negative electrical charge?",
    "options": [
          "Proton",
          "Neutron",
          "Electron",
          "Positron"
    ],
    "answer": 2,
    "fact": "Electrons are stable subatomic particles with a negative elementary electric charge."
  },
  {
    "question": "What is the capital city of Ireland?",
    "options": [
          "Cork",
          "Galway",
          "Dublin",
          "Limerick"
    ],
    "answer": 2,
    "fact": "Dublin is the historic capital and largest city of the Republic of Ireland."
  },
  {
    "question": "Which instrument is used to measure atmospheric air pressure?",
    "options": [
          "Thermometer",
          "Barometer",
          "Anemometer",
          "Hydrometer"
    ],
    "answer": 1,
    "fact": "A barometer measures air pressure, aiding significantly in weather forecasting."
  },
  {
    "question": "What is the chemical symbol for sodium?",
    "options": [
          "So",
          "Sd",
          "Na",
          "Nm"
    ],
    "answer": 2,
    "fact": "Na stands for sodium, originating from the Latin natrium."
  },
  {
    "question": "Which country is renowned for inventing paper currency during the Tang and Song dynasties?",
    "options": [
          "India",
          "China",
          "Egypt",
          "Mesopotamia"
    ],
    "answer": 1,
    "fact": "Imperial China pioneered the use of paper bank notes during the Tang and Song dynasties."
  },
  {
    "question": "What is the capital city of Finland?",
    "options": [
          "Helsinki",
          "Turku",
          "Tampere",
          "Oulu"
    ],
    "answer": 0,
    "fact": "Helsinki is the northern European capital and largest city of Finland."
  },
  {
    "question": "Which planet in our solar system has the most prominent system of rings?",
    "options": [
          "Jupiter",
          "Saturn",
          "Uranus",
          "Neptune"
    ],
    "answer": 1,
    "fact": "Saturn is encircled by extensive and bright ice particle rings."
  },
  {
    "question": "What is the chemical symbol for lead?",
    "options": [
          "Le",
          "Pb",
          "Ld",
          "Pd"
    ],
    "answer": 1,
    "fact": "Pb is the chemical symbol for lead, derived from the Latin term plumbum."
  },
  {
    "question": "Which architectural wonder was originally built as a Roman temple to all the gods?",
    "options": [
          "Colosseum",
          "Pantheon",
          "Parthenon",
          "Roman Forum"
    ],
    "answer": 1,
    "fact": "The Pantheon in Rome was commissioned by Marcus Agrippa during the reign of Augustus as a temple to all gods."
  },
  {
    "question": "What is the capital city of Denmark?",
    "options": [
          "Aarhus",
          "Odense",
          "Copenhagen",
          "Aalborg"
    ],
    "answer": 2,
    "fact": "Copenhagen is the cultural and political capital city of Denmark."
  },
  {
    "question": "Which chemical element has the highest melting point of all pure elements?",
    "options": [
          "Iron",
          "Tungsten",
          "Platinum",
          "Titanium"
    ],
    "answer": 1,
    "fact": "Tungsten possesses the highest melting point of any metallic element at 3,422 degrees Celsius."
  },
  {
    "question": "What is the capital city of Poland?",
    "options": [
          "Krakow",
          "Warsaw",
          "Gdansk",
          "Wroclaw"
    ],
    "answer": 1,
    "fact": "Warsaw is the capital and largest metropolis of Poland."
  },
  {
    "question": "Which scientist discovered penicillin in 1928, revolutionizing medicine?",
    "options": [
          "Louis Pasteur",
          "Alexander Fleming",
          "Edward Jenner",
          "Robert Koch"
    ],
    "answer": 1,
    "fact": "Sir Alexander Fleming discovered the antibiotic substance penicillin from the fungus Penicillium notatum."
  },
  {
    "question": "What is the chemical symbol for gold?",
    "options": [
          "Ag",
          "Au",
          "Gd",
          "Go"
    ],
    "answer": 1,
    "fact": "Au represents gold, coming from the Latin word aurum."
  },
  {
    "question": "Which mountain range separates Europe from Asia?",
    "options": [
          "Alps",
          "Himalayas",
          "Ural Mountains",
          "Andes"
    ],
    "answer": 2,
    "fact": "The Ural Mountains run roughly north-to-south through western Russia, acting as a natural continental divider."
  },
  {
    "question": "What is the capital city of Austria?",
    "options": [
          "Salzburg",
          "Graz",
          "Vienna",
          "Innsbruck"
    ],
    "answer": 2,
    "fact": "Vienna is the historic capital and cultural center of Austria."
  },
  {
    "question": "Which organ in the human body is primarily responsible for filtering waste from the blood?",
    "options": [
          "Liver",
          "Kidneys",
          "Pancreas",
          "Spleen"
    ],
    "answer": 1,
    "fact": "The kidneys filter blood to remove waste products and excess fluid, forming urine."
  },
  {
    "question": "What is the chemical symbol for copper?",
    "options": [
          "Co",
          "Cu",
          "Cp",
          "Cr"
    ],
    "answer": 1,
    "fact": "Cu is derived from cuprum, the ancient Latin word for copper."
  },
  {
    "question": "Which ancient civilization constructed the city of Petra carved directly into pink sandstone cliffs?",
    "options": [
          "Babylonians",
          "Nabateans",
          "Phoenicians",
          "Assyrians"
    ],
    "answer": 1,
    "fact": "The Nabateans carved the magnificent rose-red city of Petra out of Jordanian rock cliffs."
  },
  {
    "question": "What is the capital city of Switzerland?",
    "options": [
          "Zurich",
          "Geneva",
          "Bern",
          "Basel"
    ],
    "answer": 2,
    "fact": "Bern is the federal city (de facto capital) of Switzerland."
  }
];

export default function NativeTriviaQuiz({ userId, remaining, quotaLimit, onRemainingChange, onExit }: {
  userId: string | null;
  remaining: number;
  quotaLimit: number;
  onRemainingChange: (value: number) => void;
  onExit: () => void;
}) {
  const [questionIndex, setQuestionIndex] = useState<number | null>(null);
  const [chosen, setChosen] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [reservationSessionId] = useState(() => "trivio-session-" + Date.now() + "-" + Math.random().toString(36).slice(2));
  const question = questionIndex === null ? null : QUESTIONS[questionIndex];

  const playTone = (correct: boolean) => {
    try {
      const audio = new Audio(correct ? "/correct.mp3" : "/Lose.mp3");
      audio.volume = 0.85;
      void audio.play().catch(() => {});
    } catch {}
  };

  const reserveNextQuestion = async (excludeIndex: number | null = null) => {
    if (!userId) return;
    // Keep the current question visible while the next unseen question is reserved.
    if (questionIndex === null) setLoading(true);
    setErrorMessage("");
    try {
      const quotaResponse = await fetch("/api/game-access", { cache: "no-store" });
      const quotaData = await quotaResponse.json();
      if (!quotaResponse.ok) {
        setErrorMessage(quotaData.error || "Please sign in to play.");
        setLoading(false);
        return;
      }
      const currentRemaining = Number(quotaData.remainingByType?.trivio ?? 0);
      onRemainingChange(currentRemaining);
      if (currentRemaining <= 0) {
        setErrorMessage("Your daily quota on this section is over. Please visit tomorrow.");
        setLoading(false);
        return;
      }

      const candidates = QUESTIONS.map((_, i) => i).filter(i => i !== excludeIndex);
      for (let i = candidates.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [candidates[i], candidates[j]] = [candidates[j], candidates[i]];
      }
      for (const candidateIndex of candidates) {
        const candidate = QUESTIONS[candidateIndex];
        const challengeId = "trivio-q-" + candidateIndex;
        const response = await fetch("/api/game-access", {
          method: "POST",
          cache: "no-store",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            sectionId: "quiz-world",
            gameTypeId: "trivio",
            challengeId,
            challengeQuestion: candidate.question,
            reserveQuestion: true,
            reservationSessionId
          })
        });
        const data = await response.json();
        if (response.ok && data.reserved) {
          setQuestionIndex(candidateIndex);
          setLoading(false);
          return;
        }
        if (response.status !== 409) {
          setErrorMessage(data.error || "Questions could not be loaded. Please try again.");
          setLoading(false);
          return;
        }
      }
      setErrorMessage("You have completed all available questions in this section. New questions will appear when more are added.");
    } catch {
      setErrorMessage("Questions could not be loaded. Please try again.");
    }
    setLoading(false);
  };

  useEffect(() => {
    if (userId) void reserveNextQuestion();
    // The first question is selected once when the signed-in player enters.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  const choose = async (option: number) => {
    if (!question || chosen !== null || submitting) return;
    setSubmitting(true);
    const challengeId = "trivio-q-" + questionIndex;
    try {
      const response = await fetch("/api/game-access", {
        method: "POST",
        cache: "no-store",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sectionId: "quiz-world",
          gameTypeId: "trivio",
          challengeId,
          challengeQuestion: question.question,
          reservationSessionId
        })
      });
      const data = await response.json();
      if (!response.ok) {
        onRemainingChange(Number(data.remaining ?? 0));
        setErrorMessage(data.error || "Your quota could not be verified.");
        setSubmitting(false);
        return;
      }
      onRemainingChange(Number(data.remaining ?? Math.max(0, remaining - 1)));
      setChosen(option);
      const correct = option === question.answer;
      if (correct) {
        setScore(value => value + 1);
        playTone(true);
        // Keep the correct-answer feedback visible briefly, then move forward automatically.
        window.setTimeout(() => void reserveNextQuestion(questionIndex), 5000);
      } else {
        playTone(false);
      }
    } catch {
      setErrorMessage("Your answer could not be recorded. Please try again.");
    }
    setSubmitting(false);
  };

  if (!userId) return null;

  return (
    <div className="mx-auto w-full max-w-3xl">
      <section className="mx-auto w-full overflow-hidden rounded-3xl border border-violet-200 bg-white text-slate-900 shadow-2xl">
        <header className="bg-gradient-to-r from-violet-700 via-fuchsia-700 to-indigo-800 px-5 py-5 text-white sm:px-7">
          <div className="flex items-center justify-between gap-3">
            <span className="text-xs font-black uppercase tracking-[0.2em] text-white/80">Quiz World · General Knowledge Quiz</span>
            <span className="rounded-full border border-white/30 bg-white/15 px-3 py-1 text-xs font-extrabold">{remaining} plays left today</span>
          </div>
          <p className="mt-2 text-sm text-white/85">Choose the best answer</p>
        </header>
        {loading && !question ? (
          <div className="px-5 py-12 text-center font-bold text-violet-800">Loading your next question…</div>
        ) : question ? (
          <div className="p-5 sm:p-7">
            <div className="mb-5 flex items-center justify-between text-xs font-extrabold text-slate-500">
              <span>{Math.max(0, quotaLimit - remaining)} out of 10 qsns</span>
              <span>SCORE: {score}</span>
            </div>
            <h3 className="mb-6 text-xl font-black leading-snug sm:text-2xl">{question.question}</h3>
            <div className="grid gap-3">
              {question.options.map((option, optionIndex) => {
                const isCorrect = optionIndex === question.answer;
                const isChosen = chosen === optionIndex;
                const style = chosen === null ? "border-violet-200 bg-white hover:border-violet-500 hover:bg-violet-50" : isCorrect ? "border-emerald-500 bg-emerald-50 text-emerald-900" : isChosen ? "border-rose-500 bg-rose-50 text-rose-900" : "border-slate-200 bg-slate-50 text-slate-500";
                return <button key={option} type="button" disabled={chosen !== null || submitting} onClick={() => void choose(optionIndex)} className={"flex min-h-14 items-center gap-3 rounded-2xl border-2 px-4 py-3 text-left font-bold transition " + style}><span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-violet-100 text-sm font-black text-violet-800">{String.fromCharCode(65 + optionIndex)}</span><span>{option}</span>{chosen !== null && isCorrect && <span className="ml-auto text-xl">✓</span>}{chosen !== null && isChosen && !isCorrect && <span className="ml-auto text-xl">✕</span>}</button>;
              })}
            </div>
            {chosen !== null && <div className={"mt-5 rounded-2xl p-4 " + (chosen === question.answer ? "bg-emerald-50 text-emerald-900" : "bg-rose-50 text-rose-900")}>
              <p className="font-black">{chosen === question.answer ? "Correct! 🎉" : `No !! The correct answer is (${String.fromCharCode(65 + question.answer)})`}</p>
              {chosen === question.answer && <p className="mt-1 text-sm leading-6">{question.fact}</p>}
              {chosen !== question.answer && <button type="button" onClick={() => void reserveNextQuestion(questionIndex)} className="mt-4 rounded-xl bg-violet-700 px-5 py-2.5 text-sm font-extrabold text-white shadow hover:bg-violet-800">Next question →</button>}
            </div>}
          </div>
        ) : (
          <div className="px-5 py-10 text-center">
            <p className="font-bold text-slate-700">{errorMessage}</p>
            {remaining > 0 && <button type="button" onClick={() => void reserveNextQuestion()} className="mt-4 rounded-xl bg-violet-700 px-5 py-2.5 font-extrabold text-white">Try again</button>}
            <button type="button" onClick={onExit} className="mt-4 ml-2 rounded-xl border border-violet-200 px-5 py-2.5 font-extrabold text-violet-800">Back to Quiz World</button>
          </div>
        )}
      </section>
    </div>
  );
}
