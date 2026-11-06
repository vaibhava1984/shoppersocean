"use client";

import { useEffect, useState } from "react";
import { formatFreeQuotaLabel } from "@/lib/game-quota-label";

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
  },
  {
    "question": "Which musical term indicates a piece should be played very loudly?",
    "options": [
      "Piano",
      "Forte",
      "Staccato",
      "Legato"
    ],
    "answer": 1,
    "fact": "Forte is an Italian musical term meaning loud or strong, whereas piano means soft."
  },
  {
    "question": "What is the primary gaseous component of Jupiter's atmosphere?",
    "options": [
      "Carbon dioxide",
      "Nitrogen",
      "Hydrogen and Helium",
      "Oxygen"
    ],
    "answer": 2,
    "fact": "Jupiter is a gas giant composed primarily of hydrogen and helium, much like the Sun."
  },
  {
    "question": "Which famous Renaissance scientist was tried by the Inquisition for supporting heliocentrism?",
    "options": [
      "Johannes Kepler",
      "Galileo Galilei",
      "Nicolaus Copernicus",
      "René Descartes"
    ],
    "answer": 1,
    "fact": "Galileo Galilei was tried and placed under house arrest for advocating that Earth orbits the Sun."
  },
  {
    "question": "What is the national currency of Switzerland?",
    "options": [
      "Euro",
      "Swiss Franc",
      "Krone",
      "Pound sterling"
    ],
    "answer": 1,
    "fact": "The Swiss franc is the official currency and legal tender of Switzerland and Liechtenstein."
  },
  {
    "question": "Which architectural order of ancient Greece features ornate scrolls or volutes on its capitals?",
    "options": [
      "Doric",
      "Ionic",
      "Corinthian",
      "Tuscan"
    ],
    "answer": 1,
    "fact": "The Ionic order is easily recognized by its graceful scroll-like ornamental carvings on column capitals."
  },
  {
    "question": "What is the chemical symbol for silicon?",
    "options": [
      "Si",
      "Sl",
      "Sn",
      "So"
    ],
    "answer": 0,
    "fact": "Si is the chemical symbol for silicon, a vital semiconductor used extensively in computer chips."
  },
  {
    "question": "Which bird is famous for its ability to mimic human speech and environmental sounds?",
    "options": [
      "Penguin",
      "Parrot",
      "Ostrich",
      "Flamingo"
    ],
    "answer": 1,
    "fact": "Parrots possess specialized vocal organs and neural circuitry allowing them to mimic human words."
  },
  {
    "question": "What is the capital city of Colombia?",
    "options": [
      "Medellin",
      "Cali",
      "Bogota",
      "Cartagena"
    ],
    "answer": 2,
    "fact": "Bogota is the high-altitude capital and largest urban metropolis of Colombia."
  },
  {
    "question": "Which international prize is awarded annually in Stockholm, Sweden, for cultural and scientific achievements?",
    "options": [
      "Pulitzer Prize",
      "Nobel Prize",
      "Booker Prize",
      "Turing Award"
    ],
    "answer": 1,
    "fact": "The Nobel Prizes are awarded annually in accordance with the will of Alfred Nobel."
  },
  {
    "question": "What is the chemical formula for ammonia?",
    "options": [
      "NH3",
      "H2O",
      "CH4",
      "NaCl"
    ],
    "answer": 0,
    "fact": "Ammonia is a compound of nitrogen and hydrogen with the formula NH3."
  },
  {
    "question": "Which strait separates Europe from Africa at the mouth of the Mediterranean Sea?",
    "options": [
      "Strait of Malacca",
      "Strait of Gibraltar",
      "Bering Strait",
      "English Channel"
    ],
    "answer": 1,
    "fact": "The Strait of Gibraltar connects the Atlantic Ocean to the Mediterranean Sea between Spain and Morocco."
  },
  {
    "question": "What is the largest internal organ in the human body?",
    "options": [
      "Heart",
      "Brain",
      "Liver",
      "Lungs"
    ],
    "answer": 2,
    "fact": "The liver is the body's largest internal solid organ, performing hundreds of vital functions."
  },
  {
    "question": "Which dynasty built the majority of the existing Great Wall of China?",
    "options": [
      "Han Dynasty",
      "Ming Dynasty",
      "Tang Dynasty",
      "Qin Dynasty"
    ],
    "answer": 1,
    "fact": "The Ming Dynasty constructed most of the famous brick and stone fortifications seen today."
  },
  {
    "question": "What is the capital city of Malaysia?",
    "options": [
      "Penang",
      "Johor Bahru",
      "Kuala Lumpur",
      "Malacca"
    ],
    "answer": 2,
    "fact": "Kuala Lumpur is the federal capital and financial epicenter of Malaysia."
  },
  {
    "question": "Which chemical element has the highest electrical conductivity at room temperature?",
    "options": [
      "Copper",
      "Gold",
      "Silver",
      "Aluminum"
    ],
    "answer": 2,
    "fact": "Pure silver exhibits the highest electrical and thermal conductivity of all known elements."
  },
  {
    "question": "What is the deepest freshwater lake in the world, located in Siberia?",
    "options": [
      "Lake Superior",
      "Lake Victoria",
      "Lake Baikal",
      "Lake Tanganyika"
    ],
    "answer": 2,
    "fact": "Lake Baikal is the world's oldest and deepest freshwater lake, containing roughly 20% of unfrozen surface fresh water."
  },
  {
    "question": "Which artistic movement was pioneered by Salvador Dalí and Pablo Picasso?",
    "options": [
      "Impressionism",
      "Surrealism and Cubism",
      "Baroque",
      "Neoclassicism"
    ],
    "answer": 1,
    "fact": "Salvador Dalí was a master of Surrealism, while Pablo Picasso co-founded Cubism."
  },
  {
    "question": "What is the chemical symbol for phosphorus?",
    "options": [
      "Ph",
      "P",
      "Ps",
      "Pr"
    ],
    "answer": 1,
    "fact": "P is the single-letter chemical symbol for phosphorus."
  },
  {
    "question": "Which ancient empire was ruled by figures such as Julius Caesar and Augustus?",
    "options": [
      "Roman Empire",
      "Ottoman Empire",
      "Persian Empire",
      "Byzantine Empire"
    ],
    "answer": 0,
    "fact": "The Roman Empire spanned centuries across Europe, North Africa, and the Middle East."
  },
  {
    "question": "What is the capital city of the Philippines?",
    "options": [
      "Cebu City",
      "Davao",
      "Manila",
      "Quezon City"
    ],
    "answer": 2,
    "fact": "Manila is the densely populated capital city of the Philippines on the island of Luzon."
  },
  {
    "question": "Which gas accounts for the distinctive reddish-orange color of nebulas and planetary atmospheres?",
    "options": [
      "Nitrogen",
      "Hydrogen",
      "Neon",
      "Helium"
    ],
    "answer": 1,
    "fact": "Hydrogen gas glowing under stellar radiation emits a signature red spectral line (H-alpha)."
  },
  {
    "question": "What is the capital city of Chile?",
    "options": [
      "Valparaiso",
      "Santiago",
      "Concepcion",
      "Antofagasta"
    ],
    "answer": 1,
    "fact": "Santiago is the sprawling capital and cultural center of Chile."
  },
  {
    "question": "Which famous mathematician formulated the theorem relating the sides of a right triangle ($a^2 + b^2 = c^2)?",
    "options": [
      "Archimedes",
      "Pythagoras",
      "Euclid",
      "Fibonacci"
    ],
    "answer": 1,
    "fact": "The Pythagorean theorem is a fundamental relation in Euclidean geometry among the three sides of a right triangle."
  },
  {
    "question": "What is the chemical symbol for magnesium?",
    "options": [
      "Ma",
      "Mn",
      "Mg",
      "Ms"
    ],
    "answer": 2,
    "fact": "Mg is the chemical symbol for magnesium, an alkaline earth metal."
  },
  {
    "question": "Which continent is completely devoid of any permanent human countries or settlements?",
    "options": [
      "Australia",
      "Antarctica",
      "Africa",
      "South America"
    ],
    "answer": 1,
    "fact": "Antarctica is governed internationally by the Antarctic Treaty System and has no sovereign countries."
  },
  {
    "question": "What is the capital city of Vietnam?",
    "options": [
      "Ho Chi Minh City",
      "Da Nang",
      "Hanoi",
      "Hue"
    ],
    "answer": 2,
    "fact": "Hanoi is the historic capital city of Vietnam."
  },
  {
    "question": "Which layer of Earth's interior is composed of liquid iron and nickel?",
    "options": [
      "Inner core",
      "Outer core",
      "Mantle",
      "Crust"
    ],
    "answer": 1,
    "fact": "The outer core is a fluid layer composed mostly of iron and nickel lying above Earth's solid inner core."
  },
  {
    "question": "What is the chemical symbol for sulfur?",
    "options": [
      "Su",
      "Sf",
      "S",
      "Sl"
    ],
    "answer": 2,
    "fact": "S is the chemical symbol for sulfur, a bright yellow non-metal."
  },
  {
    "question": "Which iconic structure was designed by Gustave Eiffel for the 1889 World's Fair?",
    "options": [
      "Statue of Liberty",
      "Eiffel Tower",
      "Colosseum",
      "Tower Bridge"
    ],
    "answer": 1,
    "fact": "The Eiffel Tower in Paris was constructed as the entrance arch for the 1889 Exposition Universelle."
  },
  {
    "question": "What is the capital city of Indonesia?",
    "options": [
      "Bali",
      "Surabaya",
      "Jakarta",
      "Bandung"
    ],
    "answer": 2,
    "fact": "Jakarta is the sprawling capital and economic center of Indonesia."
  },
  {
    "question": "Which subatomic particle has no electrical charge (is neutral)?",
    "options": [
      "Proton",
      "Electron",
      "Neutron",
      "Positron"
    ],
    "answer": 2,
    "fact": "Neutrons are subatomic particles found in atomic nuclei with a net charge of zero."
  },
  {
    "question": "What is the capital city of Pakistan?",
    "options": [
      "Karachi",
      "Lahore",
      "Islamabad",
      "Peshawar"
    ],
    "answer": 2,
    "fact": "Islamabad is the federal capital city of Pakistan, built during the 1960s."
  },
  {
    "question": "Which medical pioneer developed the first successful polio vaccine in the 1950s?",
    "options": [
      "Louis Pasteur",
      "Jonas Salk",
      "Alexander Fleming",
      "Edward Jenner"
    ],
    "answer": 1,
    "fact": "Dr. Jonas Salk developed the inactivated polio vaccine, dramatically reducing paralytic polio cases worldwide."
  },
  {
    "question": "What is the chemical symbol for aluminium?",
    "options": [
      "Al",
      "Am",
      "Au",
      "An"
    ],
    "answer": 0,
    "fact": "Al is the chemical symbol for aluminium, a lightweight silvery-white metal."
  },
  {
    "question": "Which famous canal links the Mediterranean Sea to the Red Sea?",
    "options": [
      "Panama Canal",
      "Suez Canal",
      "Kiel Canal",
      "Corinth Canal"
    ],
    "answer": 1,
    "fact": "The Suez Canal in Egypt provides a direct maritime shortcut between Europe and Asia."
  },
  {
    "question": "What is the capital city of Nigeria?",
    "options": [
      "Lagos",
      "Abuja",
      "Kano",
      "Ibadan"
    ],
    "answer": 1,
    "fact": "Abuja is the planned capital city of Nigeria, replacing Lagos in 1991."
  },
  {
    "question": "Which celestial event occurs when the Moon passes directly between the Earth and the Sun?",
    "options": [
      "Lunar eclipse",
      "Solar eclipse",
      "Equinox",
      "Solstice"
    ],
    "answer": 1,
    "fact": "A solar eclipse occurs when the Moon blocks all or part of the Sun's light from Earth's viewpoint."
  },
  {
    "question": "What is the chemical symbol for calcium?",
    "options": [
      "Cl",
      "Ca",
      "Cm",
      "Cc"
    ],
    "answer": 1,
    "fact": "Ca is the chemical symbol for calcium, essential for bone health and cellular signaling."
  },
  {
    "question": "Which famous waterfall sits on the border between the United States and Canada?",
    "options": [
      "Victoria Falls",
      "Angel Falls",
      "Niagara Falls",
      "Iguazu Falls"
    ],
    "answer": 2,
    "fact": "Niagara Falls comprises three majestic waterfalls spanning the border of New York and Ontario."
  },
  {
    "question": "What is the capital city of Bangladesh?",
    "options": [
      "Chittagong",
      "Sylhet",
      "Dhaka",
      "Rajshahi"
    ],
    "answer": 2,
    "fact": "Dhaka is the densely populated political and cultural capital of Bangladesh."
  },
  {
    "question": "Which scientific law states that energy cannot be created or destroyed, only transformed?",
    "options": [
      "Newton's first law",
      "Conservation of energy (First law of thermodynamics)",
      "Ohm's law",
      "Archimedes' principle"
    ],
    "answer": 1,
    "fact": "The law of conservation of energy mandates that total energy in an isolated system remains constant."
  },
  {
    "question": "What is the capital city of Peru?",
    "options": [
      "Cuzco",
      "Arequipa",
      "Lima",
      "Trujillo"
    ],
    "answer": 2,
    "fact": "Lima is the historic coastal capital and largest city of Peru."
  },
  {
    "question": "Which animal group includes frogs, toads, and salamanders?",
    "options": [
      "Reptiles",
      "Amphibians",
      "Mammals",
      "Fish"
    ],
    "answer": 1,
    "fact": "Amphibians are ectothermic tetrapod vertebrates that typically undergo metamorphosis from aquatic larvae."
  },
  {
    "question": "What is the chemical symbol for neon?",
    "options": [
      "No",
      "Ne",
      "N",
      "Ni"
    ],
    "answer": 1,
    "fact": "Ne is the chemical symbol for neon, a noble gas known for glowing reddish-orange in high-voltage signs."
  },
  {
    "question": "Which ancient Mesopotamian epic is considered one of the earliest surviving works of literature?",
    "options": [
      "Odyssey",
      "Epic of Gilgamesh",
      "Iliad",
      "Aeneid"
    ],
    "answer": 1,
    "fact": "The Epic of Gilgamesh is an epic poem from ancient Mesopotamia dating back to the Third Dynasty of Ur."
  },
  {
    "question": "What is the capital city of Ukraine?",
    "options": [
      "Lviv",
      "Odessa",
      "Kyiv",
      "Kharkiv"
    ],
    "answer": 2,
    "fact": "Kyiv is the historic capital and largest city of Ukraine along the Dnieper River."
  },
  {
    "question": "Which organelle in plant cells is responsible for carrying out photosynthesis?",
    "options": [
      "Mitochondria",
      "Ribosome",
      "Chloroplast",
      "Lysosome"
    ],
    "answer": 2,
    "fact": "Chloroplasts capture sunlight energy and convert it into chemical energy storage during photosynthesis."
  },
  {
    "question": "What is the chemical symbol for nitrogen?",
    "options": [
      "Ni",
      "Nt",
      "N",
      "Na"
    ],
    "answer": 2,
    "fact": "N is the single-letter chemical symbol for nitrogen."
  },
  {
    "question": "Which mountain range features Mount Blanc as its highest peak in Western Europe?",
    "options": [
      "Pyrenees",
      "Alps",
      "Carpathians",
      "Apennines"
    ],
    "answer": 1,
    "fact": "The Alps form the highest and most extensive mountain range system situated entirely in Europe."
  },
  {
    "question": "What is the capital city of Romania?",
    "options": [
      "Cluj-Napoca",
      "Timisoara",
      "Bucharest",
      "Iasi"
    ],
    "answer": 2,
    "fact": "Bucharest is the financial, industrial, and cultural capital city of Romania."
  },
  {
    "question": "Which chemical element is liquid at standard room temperature and pressure alongside mercury?",
    "options": [
      "Bromine",
      "Gallium",
      "Cesium",
      "Francium"
    ],
    "answer": 0,
    "fact": "Bromine is a heavy reddish-brown liquid halogen at room conditions."
  },
  {
    "question": "What is the capital city of Iran?",
    "options": [
      "Shiraz",
      "Isfahan",
      "Tehran",
      "Tabriz"
    ],
    "answer": 2,
    "fact": "Tehran is the bustling capital metropolis of Iran at the foot of the Alborz mountain range."
  },
  {
    "question": "Which famous astronomer proposed the three laws of planetary motion?",
    "options": [
      "Nicolaus Copernicus",
      "Johannes Kepler",
      "Galileo Galilei",
      "Ptolemy"
    ],
    "answer": 1,
    "fact": "Johannes Kepler formulated his laws of planetary motion describing the orbits of planets around the Sun."
  },
  {
    "question": "What is the chemical symbol for platinum?",
    "options": [
      "Pl",
      "Pt",
      "Pm",
      "Pr"
    ],
    "answer": 1,
    "fact": "Pt is the chemical symbol for platinum, a dense, malleable precious transition metal."
  },
  {
    "question": "Which historic wall was built across northern Britain by the Roman Empire?",
    "options": [
      "Antonine Wall",
      "Hadrian's Wall",
      "Offa's Dyke",
      "Aurelian Walls"
    ],
    "answer": 1,
    "fact": "Hadrian's Wall was a defensive fortification built by Roman troops under Emperor Hadrian."
  },
  {
    "question": "What is the capital city of Iraq?",
    "options": [
      "Basra",
      "Mosul",
      "Baghdad",
      "Erbil"
    ],
    "answer": 2,
    "fact": "Baghdad is the historic capital city of Iraq located along the Tigris River."
  },
  {
    "question": "Which blood cells are primarily responsible for fighting infections in the human immune system?",
    "options": [
      "Red blood cells",
      "White blood cells (Leukocytes)",
      "Platelets",
      "Plasma cells"
    ],
    "answer": 1,
    "fact": "White blood cells protect the body against both infectious disease and foreign invaders."
  },
  {
    "question": "What is the chemical symbol for hydrogen?",
    "options": [
      "Hy",
      "Hd",
      "H",
      "Ho"
    ],
    "answer": 2,
    "fact": "H is the chemical symbol for hydrogen."
  },
  {
    "question": "Which ancient Greek philosopher tutored Alexander the Great?",
    "options": [
      "Socrates",
      "Plato",
      "Aristotle",
      "Pythagoras"
    ],
    "answer": 2,
    "fact": "Aristotle studied under Plato and later tutored young Alexander the Great."
  },
  {
    "question": "Which ancient civilization developed the administrative system known as satrapies across its vast empire?",
    "options": [
      "Roman Empire",
      "Persian Empire",
      "Ancient Egypt",
      "Macedonian Empire"
    ],
    "answer": 1,
    "fact": "The Achaemenid Persian Empire was divided into administrative provinces called satrapies, governed by satraps."
  },
  {
    "question": "What is the primary mineral ore from which aluminium metal is commercially extracted?",
    "options": [
      "Hematite",
      "Bauxite",
      "Galena",
      "Cinnabar"
    ],
    "answer": 1,
    "fact": "Bauxite is the principal ore of aluminium, consisting mainly of hydrated aluminium oxides."
  },
  {
    "question": "Which European city is home to the historic landmark known as the Atomium?",
    "options": [
      "Paris",
      "Vienna",
      "Brussels",
      "Amsterdam"
    ],
    "answer": 2,
    "fact": "The Atomium is an iconic 102-meter-tall building constructed in Brussels for the 1958 World's Fair."
  },
  {
    "question": "What is the chemical symbol for tungsten, derived from its alternative name wolfram?",
    "options": [
      "Tg",
      "W",
      "Ts",
      "V"
    ],
    "answer": 1,
    "fact": "W is the chemical symbol for tungsten, stemming from the mineral wolframite."
  },
  {
    "question": "Which famous ocean liner struck an iceberg and sank in the North Atlantic on its maiden voyage in 1912?",
    "options": [
      "RMS Lusitania",
      "RMS Titanic",
      "RMS Queen Mary",
      "SS Great Eastern"
    ],
    "answer": 1,
    "fact": "RMS Titanic sank on April 15, 1912, after colliding with an iceberg during its crossing from Southampton to New York City."
  },
  {
    "question": "What is the capital city of Ethiopia?",
    "options": [
      "Nairobi",
      "Addis Ababa",
      "Khartoum",
      "Mogadishu"
    ],
    "answer": 1,
    "fact": "Addis Ababa is the bustling political capital and diplomatic headquarters of Ethiopia."
  },
  {
    "question": "Which scientific principle explains why an object immersed in fluid experiences an upward buoyant force?",
    "options": [
      "Bernoulli's principle",
      "Archimedes' principle",
      "Pascal's law",
      "Boyle's law"
    ],
    "answer": 1,
    "fact": "Archimedes' principle states that the upward buoyant force exerted on a body immersed in a fluid is equal to the weight of the fluid displaced."
  },
  {
    "question": "What is the chemical formula for methane gas?",
    "options": [
      "C2H6",
      "CH4",
      "C3H8",
      "CO2"
    ],
    "answer": 1,
    "fact": "Methane is a chemical compound consisting of one carbon atom and four hydrogen atoms (CH4)."
  },
  {
    "question": "Which artistic style emerged in late 19th-century France, characterized by small, thin yet visible brush strokes?",
    "options": [
      "Cubism",
      "Impressionism",
      "Baroque",
      "Surrealism"
    ],
    "answer": 1,
    "fact": "Impressionism developed in Paris through artists like Claude Monet, focusing on accurate depiction of light and fleeting visual moments."
  },
  {
    "question": "What is the capital city of Kazakhstan?",
    "options": [
      "Almaty",
      "Astana",
      "Tashkent",
      "Bishkek"
    ],
    "answer": 1,
    "fact": "Astana is the planned capital city of Kazakhstan, situated along the Ishim River in the country's north."
  },
  {
    "question": "Which gas makes up the majority of the atmosphere of Mars?",
    "options": [
      "Oxygen",
      "Nitrogen",
      "Carbon dioxide",
      "Methane"
    ],
    "answer": 2,
    "fact": "The Martian atmosphere consists primarily of carbon dioxide (about 95%), along with nitrogen and argon."
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
    "question": "Which famous mountain pass connects Pakistan and Afghanistan through the Hindu Kush mountain range?",
    "options": [
      "Khyber Pass",
      "Bolan Pass",
      "Khunjerab Pass",
      "Lowari Pass"
    ],
    "answer": 0,
    "fact": "The Khyber Pass is a historic mountain pass linking the northern borders of Pakistan with Afghanistan."
  },
  {
    "question": "What is the capital city of Cuba?",
    "options": [
      "Santiago de Cuba",
      "Havana",
      "Camaguey",
      "Varadero"
    ],
    "answer": 1,
    "fact": "Havana is the cultural hub, major port, and capital city of Cuba."
  },
  {
    "question": "Which vitamin is also known as ascorbic acid?",
    "options": [
      "Vitamin A",
      "Vitamin B12",
      "Vitamin C",
      "Vitamin E"
    ],
    "answer": 2,
    "fact": "Vitamin C is chemically known as ascorbic acid and functions as an essential antioxidant."
  },
  {
    "question": "What is the chemical symbol for iodine?",
    "options": [
      "Io",
      "Id",
      "I",
      "In"
    ],
    "answer": 2,
    "fact": "I is the single-letter chemical symbol for the halogen element iodine."
  },
  {
    "question": "Which dynasty ruled China during the construction of the Forbidden City in Beijing?",
    "options": [
      "Tang Dynasty",
      "Song Dynasty",
      "Ming Dynasty",
      "Qing Dynasty"
    ],
    "answer": 2,
    "fact": "The Ming Dynasty constructed the sprawling imperial palace complex known as the Forbidden City between 1406 and 1420."
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
    "fact": "Nairobi is the flourishing capital and largest economic center of Kenya."
  },
  {
    "question": "Which scientific instrument is utilized to measure extremely high temperatures remotely via thermal radiation?",
    "options": [
      "Pyrometer",
      "Barometer",
      "Hydrometer",
      "Calorimeter"
    ],
    "answer": 0,
    "fact": "A pyrometer is a type of remote-sensing thermometer used to measure high temperatures of distant surfaces."
  },
  {
    "question": "What is the chemical symbol for zinc?",
    "options": [
      "Zi",
      "Zn",
      "Zc",
      "Zk"
    ],
    "answer": 1,
    "fact": "Zn is the chemical symbol for zinc, a lustrous bluish-white transition metal."
  },
  {
    "question": "Which ocean basin is bounded by the Americas to the west and Europe and Africa to the east?",
    "options": [
      "Pacific Ocean",
      "Indian Ocean",
      "Atlantic Ocean",
      "Arctic Ocean"
    ],
    "answer": 2,
    "fact": "The Atlantic Ocean is the second largest of the world's oceanic divisions."
  },
  {
    "question": "What is the capital city of Morocco?",
    "options": [
      "Casablanca",
      "Marrakesh",
      "Rabat",
      "Fez"
    ],
    "answer": 2,
    "fact": "Rabat is the administrative capital city of Morocco, located on the Atlantic coast."
  },
  {
    "question": "Which famous English playwright and poet authored 'Romeo and Juliet' and 'Hamlet'?",
    "options": [
      "Christopher Marlowe",
      "William Shakespeare",
      "Ben Jonson",
      "John Milton"
    ],
    "answer": 1,
    "fact": "William Shakespeare is widely regarded as the greatest writer in the English language and world dramatist."
  },
  {
    "question": "What is the chemical symbol for uranium?",
    "options": [
      "Ur",
      "Un",
      "U",
      "Um"
    ],
    "answer": 2,
    "fact": "U is the single-letter chemical symbol for uranium, a radioactive actinide metal."
  },
  {
    "question": "Which ancient civilization created the monumental stone heads on Easter Island (Rapa Nui)?",
    "options": [
      "Inca civilization",
      "Rapa Nui people",
      "Polynesians",
      "Maya civilization"
    ],
    "answer": 2,
    "fact": "Polynesian settlers carved the iconic moai stone monoliths on Easter Island between 1250 and 1500 CE."
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
    "fact": "Athens is the historic capital and cultural heart of Greece."
  },
  {
    "question": "Which layer of the Earth's atmosphere is closest to the planetary surface?",
    "options": [
      "Stratosphere",
      "Mesosphere",
      "Troposphere",
      "Thermosphere"
    ],
    "answer": 2,
    "fact": "The troposphere is the lowest layer of Earth's atmosphere, containing weather phenomena and most atmospheric mass."
  },
  {
    "question": "What is the chemical symbol for titanium?",
    "options": [
      "Ti",
      "Tn",
      "Tm",
      "Tt"
    ],
    "answer": 0,
    "fact": "Ti is the chemical symbol for titanium, known for its high strength-to-weight ratio and corrosion resistance."
  },
  {
    "question": "Which geographical feature forms a natural boundary between France and Spain?",
    "options": [
      "Alps",
      "Pyrenees",
      "Carpathians",
      "Apennines"
    ],
    "answer": 1,
    "fact": "The Pyrenees mountain range separates the Iberian Peninsula from the rest of continental Europe."
  },
  {
    "question": "What is the capital city of Hungary?",
    "options": [
      "Prague",
      "Bratislava",
      "Budapest",
      "Bucharest"
    ],
    "answer": 2,
    "fact": "Budapest is the historic capital city of Hungary, traversed by the Danube River."
  },
  {
    "question": "Which subatomic particle was discovered by J.J. Thomson in 1897?",
    "options": [
      "Proton",
      "Neutron",
      "Electron",
      "Photon"
    ],
    "answer": 2,
    "fact": "J.J. Thomson discovered the electron through his cathode ray tube experiments."
  },
  {
    "question": "What is the capital city of Venezuela?",
    "options": [
      "Maracaibo",
      "Caracas",
      "Valencia",
      "Barquisimeto"
    ],
    "answer": 1,
    "fact": "Caracas is the cultural and political capital city of Venezuela."
  },
  {
    "question": "Which chemical element has the highest melting point of all metals?",
    "options": [
      "Iron",
      "Tungsten",
      "Platinum",
      "Chromium"
    ],
    "answer": 1,
    "fact": "Tungsten has the highest melting point of all metallic elements at 3,422°C."
  },
  {
    "question": "What is the capital city of Finland?",
    "options": [
      "Helsinki",
      "Espoo",
      "Tampere",
      "Turku"
    ],
    "answer": 0,
    "fact": "Helsinki is the northern European coastal capital and largest city of Finland."
  },
  {
    "question": "Which ancient empire was centered in modern-day Peru before the Spanish conquest?",
    "options": [
      "Aztec Empire",
      "Inca Empire",
      "Maya Empire",
      "Olmec Empire"
    ],
    "answer": 1,
    "fact": "The Inca Empire was the largest empire in pre-Columbian America, centered in the Andean highlands."
  },
  {
    "question": "What is the chemical symbol for nickel?",
    "options": [
      "N",
      "Ne",
      "Ni",
      "Nl"
    ],
    "answer": 2,
    "fact": "Ni is the chemical symbol for the silvery-white transition metal nickel."
  },
  {
    "question": "Which European country is renowned for inventing porcelain in the West at Meissen?",
    "options": [
      "Italy",
      "Germany",
      "France",
      "United Kingdom"
    ],
    "answer": 1,
    "fact": "Germany established the first European hard-paste porcelain manufactory in Meissen during the early 18th century."
  },
  {
    "question": "What is the capital city of Portugal?",
    "options": [
      "Porto",
      "Lisbon",
      "Coimbra",
      "Braga"
    ],
    "answer": 1,
    "fact": "Lisbon is the historic coastal capital and largest city of Portugal."
  },
  {
    "question": "Which anatomical system includes the brain, spinal cord, and peripheral nerves?",
    "options": [
      "Circulatory system",
      "Nervous system",
      "Endocrine system",
      "Lymphatic system"
    ],
    "answer": 1,
    "fact": "The nervous system coordinates voluntary and involuntary actions and transmits signals across the body."
  },
  {
    "question": "What is the chemical symbol for cobalt?",
    "options": [
      "Cb",
      "Co",
      "Ct",
      "Cl"
    ],
    "answer": 1,
    "fact": "Co is the chemical symbol for cobalt, a hard ferromagnetic transition metal."
  },
  {
    "question": "Which famous scientist proposed the laws of planetary motion in the early 17th century?",
    "options": [
      "Nicolaus Copernicus",
      "Johannes Kepler",
      "Galileo Galilei",
      "Isaac Newton"
    ],
    "answer": 1,
    "fact": "Johannes Kepler formulated his three planetary motion laws based on meticulous astronomical observations."
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
    "fact": "Vienna is the historic capital city of Austria, celebrated for its imperial palaces and musical heritage."
  },
  {
    "question": "Which desert covers much of northern Chile and is known as one of the driest places on Earth?",
    "options": [
      "Sahara Desert",
      "Atacama Desert",
      "Mojave Desert",
      "Kalahari Desert"
    ],
    "answer": 1,
    "fact": "The Atacama Desert is a plateau in South America stretching across northern Chile, renowned for extreme aridity."
  },
  {
    "question": "What is the chemical symbol for platinum?",
    "options": [
      "Pl",
      "Pt",
      "Pm",
      "Pr"
    ],
    "answer": 1,
    "fact": "Pt is the chemical symbol for platinum, a dense, precious, and highly unreactive transition metal."
  },
  {
    "question": "Which international financial institution is headquartered in Washington, D.C. alongside the IMF?",
    "options": [
      "World Bank",
      "European Central Bank",
      "Bank for International Settlements",
      "Asian Development Bank"
    ],
    "answer": 0,
    "fact": "The World Bank and International Monetary Fund (IMF) are sister organizations headquartered in Washington, D.C."
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
    "fact": "Copenhagen is the political and cultural capital city of Denmark."
  },
  {
    "question": "Which gas is released by plants during daytime photosynthesis processes?",
    "options": [
      "Carbon dioxide",
      "Oxygen",
      "Nitrogen",
      "Methane"
    ],
    "answer": 1,
    "fact": "Green plants produce and release oxygen gas as a beneficial byproduct of photosynthesis."
  },
  {
    "question": "What is the chemical symbol for silver?",
    "options": [
      "Si",
      "Ag",
      "Sr",
      "Sv"
    ],
    "answer": 1,
    "fact": "Ag stands for silver, derived from the Latin word argentum."
  },
  {
    "question": "Which famous artist created the monumental painting 'The Night Watch' in 1642?",
    "options": [
      "Johannes Vermeer",
      "Rembrandt van Rijn",
      "Frans Hals",
      "Jan Steen"
    ],
    "answer": 1,
    "fact": "Rembrandt van Rijn completed his famous militia painting, commonly known as The Night Watch, in Amsterdam."
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
    "fact": "Wellington is the capital city of New Zealand, situated on the Cook Strait."
  },
  {
    "id": 220,
    "question": "Which prominent mountain peak serves as the highest elevation in the continent of Africa?",
    "options": [
      "Mount Kenya",
      "Mount Kilimanjaro",
      "Mount Stanley",
      "Ras Dashen"
    ],
    "answer": 1,
    "fact": "Mount Kilimanjaro in Tanzania is Africa's highest mountain, featuring three volcanic cones."
  },
  {
    "id": 222,
    "question": "Which historic treaty officially ended World War I and imposed severe reparations on Germany?",
    "options": [
      "Treaty of Utrecht",
      "Treaty of Versailles",
      "Treaty of Westphalia",
      "Congress of Vienna"
    ],
    "answer": 1,
    "fact": "The Treaty of Versailles was signed in June 1919 at the Paris Peace Conference, ending the state of war."
  },
  {
    "id": 224,
    "question": "Which chemical element makes up the vast majority of the Sun's mass?",
    "options": [
      "Oxygen",
      "Helium",
      "Hydrogen",
      "Carbon"
    ],
    "answer": 2,
    "fact": "Hydrogen accounts for roughly 73% of the Sun's mass, followed by helium."
  },
  {
    "id": 226,
    "question": "Which famous scientist formulated the general and special theories of relativity?",
    "options": [
      "Isaac Newton",
      "Albert Einstein",
      "Niels Bohr",
      "Max Planck"
    ],
    "answer": 1,
    "fact": "Albert Einstein revolutionized modern physics with his theories of special and general relativity."
  },
  {
    "id": 228,
    "question": "Which ancient civilization constructed the grand palace complex of Knossos on the island of Crete?",
    "options": [
      "Mycenaean civilization",
      "Minoan civilization",
      "Ancient Spartans",
      "Trojan civilization"
    ],
    "answer": 1,
    "fact": "The Minoan civilization flourished on Crete during the Bronze Age, centered around monumental palaces like Knossos."
  },
  {
    "id": 230,
    "question": "Which ocean is the smallest and shallowest of the world's five major oceans?",
    "options": [
      "Indian Ocean",
      "Southern Ocean",
      "Arctic Ocean",
      "Atlantic Ocean"
    ],
    "answer": 2,
    "fact": "The Arctic Ocean surrounds the polar region in the Northern Hemisphere and is the smallest ocean."
  },
  {
    "id": 232,
    "question": "Which continent is home to the world's largest tropical rainforest basin?",
    "options": [
      "Africa",
      "Asia",
      "South America",
      "Oceania"
    ],
    "answer": 2,
    "fact": "South America contains the Amazon rainforest, the world's largest tropical jungle ecosystem."
  },
  {
    "id": 234,
    "question": "Which scientific instrument is used to record seismic waves generated by earthquakes?",
    "options": [
      "Barometer",
      "Seismograph",
      "Anemometer",
      "Hygrometer"
    ],
    "answer": 1,
    "fact": "A seismograph detects and plots tremors and shockwaves moving through Earth's crust."
  },
  {
    "id": 236,
    "question": "Which famous Renaissance artist painted 'The School of Athens' in the Vatican Palace?",
    "options": [
      "Leonardo da Vinci",
      "Michelangelo",
      "Raphael",
      "Donatello"
    ],
    "answer": 2,
    "fact": "Raphael painted The School of Athens fresco between 1509 and 1511 as part of his commission for the Vatican."
  },
  {
    "id": 238,
    "question": "Which chemical element is a heavy noble gas commonly used in high-intensity lighting and flash lamps?",
    "options": [
      "Helium",
      "Neon",
      "Xenon",
      "Argon"
    ],
    "answer": 2,
    "fact": "Xenon is a colorless, dense noble gas used in specialized photographic flashes and arc lamps."
  },
  {
    "id": 240,
    "question": "Which ocean current plays a major role in regulating climate by transporting warm water from the Gulf of Mexico toward Europe?",
    "options": [
      "Humboldt Current",
      "Gulf Stream",
      "California Current",
      "Canaries Current"
    ],
    "answer": 1,
    "fact": "The Gulf Stream is a powerful, warm Atlantic ocean current originating in the tropical Caribbean."
  },
  {
    "id": 242,
    "question": "Which ancient civilization developed hieroglyphic writing along the banks of the Nile River?",
    "options": [
      "Ancient Sumerians",
      "Ancient Egyptians",
      "Indus Valley civilization",
      "Ancient Phoenicians"
    ],
    "answer": 1,
    "fact": "Ancient Egyptians utilized hieroglyphs as a formal writing system combining logographic and alphabetic elements."
  },
  {
    "id": 243,
    "question": "What is the capital city of South Korea?",
    "options": [
      "Busan",
      "Incheon",
      "Seoul",
      "Daegu"
    ],
    "answer": 2,
    "fact": "Seoul is the massive political, cultural, and financial capital of South Korea."
  },
  {
    "id": 244,
    "question": "Which gas accounts for roughly 21 percent of Earth's modern atmosphere?",
    "options": [
      "Nitrogen",
      "Oxygen",
      "Carbon dioxide",
      "Argon"
    ],
    "answer": 1,
    "fact": "Oxygen makes up approximately 21% of dry air in Earth's atmosphere."
  },
  {
    "id": 248,
    "question": "Which chemical element has the atomic number 1?",
    "options": [
      "Helium",
      "Hydrogen",
      "Lithium",
      "Carbon"
    ],
    "answer": 1,
    "fact": "Hydrogen has an atomic number of 1, representing the lightest element in the universe."
  },
  {
    "id": 250,
    "question": "Which layer of the Sun's atmosphere is visible to the naked eye only during a total solar eclipse?",
    "options": [
      "Photosphere",
      "Chromosphere",
      "Corona",
      "Convective zone"
    ],
    "answer": 2,
    "fact": "The corona is the outermost aura of plasma that extends millions of kilometers into space, visible during eclipses."
  },
  {
    "id": 252,
    "question": "Which country is home to the ancient city ruins of Babylon along the Euphrates River?",
    "options": [
      "Egypt",
      "Iran",
      "Iraq",
      "Greece"
    ],
    "answer": 2,
    "fact": "The archaeological site of ancient Babylon is located in present-day Iraq, south of Baghdad."
  },
  {
    "id": 253,
    "question": "What is the capital city of Japan?",
    "options": [
      "Osaka",
      "Kyoto",
      "Tokyo",
      "Nagoya"
    ],
    "answer": 2,
    "fact": "Tokyo is the densely populated metropolitan capital city of Japan."
  },
  {
    "id": 254,
    "question": "Which scientific law states that pressure and volume are inversely proportional at constant temperature?",
    "options": [
      "Charles's law",
      "Boyle's law",
      "Avogadro's law",
      "Dalton's law"
    ],
    "answer": 1,
    "fact": "Boyle's law describes the inverse relationship between absolute pressure and volume of a gas."
  },
  {
    "id": 256,
    "question": "Which famous European explorer reached India by sea by rounding the Cape of Good Hope in 1498?",
    "options": [
      "Christopher Columbus",
      "Vasco da Gama",
      "Ferdinand Magellan",
      "Marco Polo"
    ],
    "answer": 1,
    "fact": "Portuguese explorer Vasco da Gama successfully linked Europe and Asia by ocean route in 1498."
  },
  {
    "id": 258,
    "question": "Which chemical element is the primary constituent of natural diamonds?",
    "options": [
      "Silicon",
      "Carbon",
      "Boron",
      "Nitrogen"
    ],
    "answer": 1,
    "fact": "Diamonds are a solid allotrope of carbon with its atoms arranged in a crystal lattice."
  },
  {
    "id": 260,
    "question": "Which planet in our solar system rotates on its side with an axial tilt of roughly 98 degrees?",
    "options": [
      "Saturn",
      "Uranus",
      "Neptune",
      "Jupiter"
    ],
    "answer": 1,
    "fact": "Uranus has a unique extreme axial tilt that causes it to spin almost completely on its side."
  },
  {
    "id": 262,
    "question": "Which ancient Greek mathematician wrote 'Elements', a foundational treatise in geometry?",
    "options": [
      "Archimedes",
      "Euclid",
      "Pythagoras",
      "Apollonius"
    ],
    "answer": 1,
    "fact": "Euclid of Alexandria authored Elements, which served as the primary textbook for teaching mathematics for centuries."
  },
  {
    "id": 263,
    "question": "What is the capital city of Spain?",
    "options": [
      "Barcelona",
      "Madrid",
      "Seville",
      "Valencia"
    ],
    "answer": 1,
    "fact": "Madrid is the political and geographic center capital of Spain."
  },
  {
    "id": 264,
    "question": "Which gas is trapped in large quantities within polar ice caps and permafrost layers?",
    "options": [
      "Oxygen",
      "Methane",
      "Helium",
      "Neon"
    ],
    "answer": 1,
    "fact": "Methane is stored inside Arctic permafrost and clathrate deposits."
  },
  {
    "id": 266,
    "question": "Which famous structure was erected in Rome as an amphitheatre for gladiatorial contests?",
    "options": [
      "Pantheon",
      "Colosseum",
      "Roman Forum",
      "Circus Maximus"
    ],
    "answer": 1,
    "fact": "The Colosseum is an oval amphitheatre in the centre of the city of Rome, built of travertine limestone."
  },
  {
    "id": 268,
    "question": "Which chemical element has the symbol 'N'?",
    "options": [
      "Nickel",
      "Neon",
      "Nitrogen",
      "Sodium"
    ],
    "answer": 2,
    "fact": "N is the chemical symbol for the non-metal element nitrogen."
  },
  {
    "id": 269,
    "question": "What is the capital city of Australia?",
    "options": [
      "Sydney",
      "Melbourne",
      "Canberra",
      "Brisbane"
    ],
    "answer": 2,
    "fact": "Canberra is the capital city of Australia, chosen as a compromise between rival cities Sydney and Melbourne."
  },
  {
    "id": 270,
    "question": "Which celestial body orbits Earth as its only permanent natural satellite?",
    "options": [
      "Titan",
      "The Moon",
      "Europa",
      "Phobos"
    ],
    "answer": 1,
    "fact": "The Moon is Earth's only natural satellite and the fifth largest moon in the solar system."
  },
  {
    "id": 220,
    "question": "Which 1927 science fiction silent film directed by Fritz Lang is widely regarded as a pioneering masterpiece of the genre?",
    "options": ["Metropolis","A Trip to the Moon","Blade Runner","2001: A Space Odyssey"],
    "answer": 0,
    "fact": "Fritz Lang's German expressionist film Metropolis set groundbreaking visual and thematic standards for science fiction cinema."
  },
  {
    "id": 221,
    "question": "What is the name of the phenomenon where sound waves change frequency when the sound source moves relative to an observer?",
    "options": ["Doppler effect","Cerenkov radiation","Photoelectric effect","Greenhouse effect"],
    "answer": 0,
    "fact": "The Doppler effect explains why the pitch of a siren changes as an emergency vehicle speeds past."
  },
  {
    "id": 222,
    "question": "Which famous board game was originally patented under the name 'The Landlord's Game' in 1904 to illustrate economic injustices?",
    "options": ["Scrabble","Monopoly","Risk","Catan"],
    "answer": 1,
    "fact": "Elizabeth Magie originally designed The Landlord's Game to demonstrate the negative aspects of land monopolies, which later evolved into Monopoly."
  },
  {
    "id": 223,
    "question": "What is the term for a word that reads the same forwards and backwards, such as 'racecar' or 'kayak'?",
    "options": ["Acronym","Anagram","Palindrome","Homonym"],
    "answer": 2,
    "fact": "A palindrome is a word, phrase, number, or other sequence of characters that reads the same backward as forward."
  },
  {
    "id": 224,
    "question": "Which marine animal possesses three hearts, blue blood, and a highly sophisticated nervous system?",
    "options": ["Blue whale","Great white shark","Common octopus","Bottlenose dolphin"],
    "answer": 2,
    "fact": "Octopuses have three hearts (two pump blood through the gills, one through the body) and copper-based blue blood."
  },
  {
    "id": 225,
    "question": "Who invented the practical incandescent light bulb with a high-resistance carbon filament in 1879?",
    "options": ["Nikola Tesla","Thomas Edison","Alexander Graham Bell","Guglielmo Marconi"],
    "answer": 1,
    "fact": "Thomas Edison and his research team successfully tested a long-burning incandescent lamp using a carbon filament."
  },
  {
    "id": 226,
    "question": "Which literary award is presented annually in the United Kingdom for the best full-length novel written in English?",
    "options": ["Pulitzer Prize","The Booker Prize","Hugo Award","Nebula Award"],
    "answer": 1,
    "fact": "The Booker Prize is a prestigious literary prize awarded each year for a novel written in English and published in the UK."
  },
  {
    "id": 227,
    "question": "What optical illusion causes a shimmering pool of water to appear on a hot desert highway?",
    "options": ["Mirage","Aurora","Halo","Rainbow"],
    "answer": 0,
    "fact": "A mirage is caused by the refraction of light through layers of air having different temperatures."
  },
  {
    "id": 228,
    "question": "Which classical composer continued to compose masterpieces even after becoming completely deaf?",
    "options": ["Wolfgang Amadeus Mozart","Ludwig van Beethoven","Johann Sebastian Bach","Antonio Vivaldi"],
    "answer": 1,
    "fact": "Ludwig van Beethoven composed many of his greatest works, including his Ninth Symphony, while suffering from profound hearing loss."
  },
  {
    "id": 229,
    "question": "What is the primary ingredient used in traditional Japanese miso paste?",
    "options": ["Rice flour","Fermented soybeans","Seaweed","Black sesame"],
    "answer": 1,
    "fact": "Miso is a traditional Japanese seasoning produced by fermenting soybeans with salt and koji fungus."
  },
  {
    "id": 231,
    "question": "What is the name of the imaginary boundary around a black hole beyond which nothing, not even light, can escape?",
    "options": ["Accretion disk","Event horizon","Singularity","Photon sphere"],
    "answer": 1,
    "fact": "The event horizon marks the threshold where gravitational pull becomes infinite and inescapable."
  },
  {
    "id": 232,
    "question": "Which Renaissance polymath designed an armored vehicle that is considered an early precursor to the modern tank?",
    "options": ["Galileo Galilei","Leonardo da Vinci","Johannes Kepler","Nicolaus Copernicus"],
    "answer": 1,
    "fact": "Leonardo da Vinci sketched a conical wooden cover reinforced with metal plates powered by internal crew hand cranks."
  },
  {
    "id": 233,
    "question": "What is the term for animals that are active primarily during twilight hours (dawn and dusk)?",
    "options": ["Nocturnal","Diurnal","Crepuscular","Matutinal"],
    "answer": 2,
    "fact": "Crepuscular animals, such as rabbits and deer, adjust their hunting and foraging routines to twilight."
  },
  {
    "id": 234,
    "question": "Which American author wrote the classic dystopian novel 'Fahrenheit 451', published in 1953?",
    "options": ["George Orwell","Ray Bradbury","Aldous Huxley","Philip K. Dick"],
    "answer": 1,
    "fact": "Ray Bradbury's Fahrenheit 451 depicts a future society where books are outlawed and burned."
  },
  {
    "id": 235,
    "question": "What is the scientific term for the process by which caterpillar larvae transform into adult butterflies?",
    "options": ["Osmosis","Metamorphosis","Photosynthesis","Mitosis"],
    "answer": 1,
    "fact": "Metamorphosis is the biological process of physical development involving distinct structural changes."
  },
  {
    "id": 236,
    "question": "Which historic spacecraft carried human astronauts Neil Armstrong and Buzz Aldrin to the Moon's surface in 1969?",
    "options": ["Apollo 11 Lunar Module Eagle","Vostok 1","Gemini 4","Sputnik 2"],
    "answer": 0,
    "fact": "The Apollo 11 Lunar Module, named Eagle, successfully landed in the Sea of Tranquility."
  },
  {
    "id": 237,
    "question": "What is the name of the scale used to measure the pungency or spicy heat of chili peppers?",
    "options": ["Richter scale","Scoville scale","Mohs scale","Beaufort scale"],
    "answer": 1,
    "fact": "The Scoville scale measures capsaicin concentration, which determines chili pepper hotness."
  },
  {
    "id": 238,
    "question": "Which famous surrealist painter created 'The Persistence of Memory' featuring melting pocket watches?",
    "options": ["Pablo Picasso","Salvador Dalí","Claude Monet","Henri Matisse"],
    "answer": 1,
    "fact": "Salvador Dalí's 1931 painting is an iconic work of Surrealism depicting soft, melting clocks."
  },
  {
    "id": 239,
    "question": "What type of celestial object is Halley's Comet?",
    "options": ["Asteroid","Periodic comet","Meteoroid","Exoplanet"],
    "answer": 1,
    "fact": "Halley's Comet is a short-period comet visible from Earth every 75 to 76 years."
  },
  {
    "id": 240,
    "question": "Which ancient Greek mathematician famously shouted 'Eureka!' after discovering a method to measure volume by water displacement?",
    "options": ["Pythagoras","Archimedes","Euclid","Socrates"],
    "answer": 1,
    "fact": "Archimedes realized that the volume of an irregular object could be calculated by measuring displaced water."
  },
  {
    "id": 241,
    "question": "What is the term for the geological epoch in which we currently live, characterized by human impact on Earth's ecosystems?",
    "options": ["Pleistocene","Holocene","Jurassic","Cretaceous"],
    "answer": 1,
    "fact": "The Holocene epoch began approximately 11,700 years ago after the last glacial period."
  },
  {
    "id": 242,
    "question": "Which prominent Italian physicist formulated the laws of pendulum motion and defended heliocentrism?",
    "options": ["Enrico Fermi","Galileo Galilei","Alessandro Volta","Evangelista Torricelli"],
    "answer": 1,
    "fact": "Galileo Galilei made foundational contributions to observational astronomy and classical physics."
  },
  {
    "id": 243,
    "question": "What is the primary pigment responsible for absorbing sunlight in green plant leaves?",
    "options": ["Carotenoid","Chlorophyll","Anthocyanin","Melanin"],
    "answer": 1,
    "fact": "Chlorophyll absorbs light mostly in the blue and red portions of the electromagnetic spectrum."
  },
  {
    "id": 244,
    "question": "Which architectural style emerged in Europe during the mid-12th century, known for flying buttresses and pointed arches?",
    "options": ["Romanesque","Gothic","Baroque","Neoclassical"],
    "answer": 1,
    "fact": "Gothic architecture flourished across Europe during the high and late medieval period."
  },
  {
    "id": 245,
    "question": "What is the name of the boundary layer separating the Earth's crust and mantle?",
    "options": ["Lehmann discontinuity","Mohorovičić discontinuity (Moho)","Core-mantle boundary","Lithosphere"],
    "answer": 1,
    "fact": "The Mohorovičić discontinuity, or Moho, marks the transition between Earth's crust and denser mantle."
  },
  {
    "id": 247,
    "question": "What is the term for a star that suddenly increases significantly in brightness before fading back over time?",
    "options": ["Pulsar","Nova","Quasar","Neutron star"],
    "answer": 1,
    "fact": "A nova is a powerful nuclear explosion on a white dwarf star that causes a temporary burst of light."
  },
  {
    "id": 248,
    "question": "Which literary masterpiece by Herman Melville features the obsessive quest of Captain Ahab?",
    "options": ["The Odyssey","Moby-Dick","Treasure Island","Heart of Darkness"],
    "answer": 1,
    "fact": "Moby-Dick follows Ahab's vengeful hunt for the elusive white sperm whale."
  },
  {
    "id": 249,
    "question": "What is the name of the atmospheric phenomenon that produces curtains of colored light near Earth's polar regions?",
    "options": ["Aurora (Polaris/Australis)","St. Elmo's fire","Zodiacal light","Airglow"],
    "answer": 0,
    "fact": "Auroras are caused by solar wind interactions with Earth's magnetosphere near the poles."
  },
  {
    "question": "Which popular sport uses a shuttlecock that players hit back and forth across a high net?",
    "options": [
      "Tennis",
      "Badminton",
      "Squash",
      "Table tennis"
    ],
    "answer": 1,
    "fact": "Badminton is a racket sport played using racquets to strike a shuttlecock across a net."
  },
  {
    "question": "What is the name of the yellow part located in the center of a fresh chicken egg?",
    "options": [
      "Albumen",
      "Yolk",
      "Shell",
      "Plasma"
    ],
    "answer": 1,
    "fact": "The egg yolk is the nutrient-bearing portion inside an egg that feeds the developing embryo."
  },
  {
    "question": "Which large mammal is famous for having a long trunk and large flappy ears?",
    "options": [
      "Hippopotamus",
      "Rhinoceros",
      "Elephant",
      "Giraffe"
    ],
    "answer": 2,
    "fact": "Elephants are the largest living land animals, easily recognized by their trunks and tusks."
  },
  {
    "question": "How many players are on the field for a single standard soccer team during a match?",
    "options": [
      "9",
      "10",
      "11",
      "12"
    ],
    "answer": 2,
    "fact": "A standard association football (soccer) team fields 11 players on the pitch at any one time."
  },
  {
    "question": "What primary color of light is combined with green and blue in standard television screens and computer monitors?",
    "options": [
      "Red",
      "Yellow",
      "Purple",
      "Orange"
    ],
    "answer": 0,
    "fact": "RGB (Red, Green, Blue) are the additive primary colors used in digital electronic displays."
  },
  {
    "question": "Which sweet sticky substance is naturally made by honeybees from flower nectar?",
    "options": [
      "Molasses",
      "Syrup",
      "Honey",
      "Nectarine"
    ],
    "answer": 2,
    "fact": "Honeybees collect nectar, transform it through regurgitation and evaporation, and store it in wax honeycombs."
  },
  {
    "question": "What is the common term for the freezing of water into solid ice?",
    "options": [
      "Evaporation",
      "Melting",
      "Solidification (Freezing)",
      "Condensation"
    ],
    "answer": 2,
    "fact": "Freezing or solidification is the phase transition where a liquid turns into a solid when cooled."
  },
  {
    "question": "Which classic fairy tale character leaves behind a glass slipper at a royal ball?",
    "options": [
      "Sleeping Beauty",
      "Cinderella",
      "Snow White",
      "Little Red Riding Hood"
    ],
    "answer": 1,
    "fact": "Cinderella famously leaves a glass slipper behind on the palace stairs as midnight strikes."
  },
  {
    "question": "What is the name of the toy consisting of a spool-like disk that spins up and down on a string?",
    "options": [
      "Frisbee",
      "Yo-yo",
      "Hula hoop",
      "Boomerang"
    ],
    "answer": 1,
    "fact": "A yo-yo is an ancient toy comprising an axle connected to two disks and a string wound around the axle."
  },
  {
    "question": "Which seasonal fruit is round, typically red or green, and grows on trees in orchards?",
    "options": [
      "Banana",
      "Apple",
      "Pineapple",
      "Mango"
    ],
    "answer": 1,
    "fact": "Apples are one of the most widely cultivated tree fruits in temperate regions worldwide."
  },
  {
    "question": "What natural weather event involves flashes of bright electrical discharge accompanied by loud thunder?",
    "options": [
      "Blizzard",
      "Thunderstorm",
      "Tornado",
      "Drought"
    ],
    "answer": 1,
    "fact": "A thunderstorm is characterized by the presence of lightning and thunder produced by convective clouds."
  },
  {
    "question": "Which domestic pet is well known for purring, chasing mice, and landing neatly on its feet?",
    "options": [
      "Dog",
      "Cat",
      "Parrot",
      "Hamster"
    ],
    "answer": 1,
    "fact": "Cats are popular small carnivorous mammals domesticated by humans thousands of years ago."
  },
  {
    "question": "What do you call a young dog or canine pup?",
    "options": [
      "Kitten",
      "Puppy",
      "Calf",
      "Cub"
    ],
    "answer": 1,
    "fact": "A puppy is a juvenile dog, usually weighing a few pounds depending on the breed."
  },
  {
    "question": "Which metal is traditionally used to make wedding rings and shiny gold-colored jewelry?",
    "options": [
      "Iron",
      "Gold",
      "Lead",
      "Tin"
    ],
    "answer": 1,
    "fact": "Gold is a precious metal prized for its luster and resistance to corrosion over time."
  },
  {
    "question": "What type of footwear is specially designed with wheels attached to the bottom for rolling around?",
    "options": [
      "Flip-flops",
      "Roller skates",
      "Hiking boots",
      "Slippers"
    ],
    "answer": 1,
    "fact": "Roller skates allow wearers to glide across smooth surfaces using attached wheels."
  },
  {
    "question": "Which large yellow citrus fruit has a sour taste and is frequently squeezed to make lemonade?",
    "options": [
      "Lemon",
      "Watermelon",
      "Peach",
      "Plum"
    ],
    "answer": 0,
    "fact": "Lemons are acidic citrus fruits rich in vitamin C and culinary flavoring properties."
  },
  {
    "question": "What instrument do musicians blow air into to produce notes using keys and valves, often associated with jazz music?",
    "options": [
      "Violin",
      "Trumpet or Saxophone",
      "Drum",
      "Guitar"
    ],
    "answer": 1,
    "fact": "Brass and woodwind instruments like trumpets and saxophones are staples of jazz and orchestral music."
  },
  {
    "question": "Which vibrant red insect has small black spots on its shell and is considered lucky in many cultures?",
    "options": [
      "Mosquito",
      "Ladybug (Ladybird)",
      "Housefly",
      "Cockroach"
    ],
    "answer": 1,
    "fact": "Ladybugs are small beetles belonging to the family Coccinellidae, famous for their spotted wing covers."
  },
  {
    "question": "What material is paper primarily manufactured from in modern industrial mills?",
    "options": [
      "Plastic",
      "Wood pulp",
      "Glass",
      "Rubber"
    ],
    "answer": 1,
    "fact": "Paper is typically produced from cellulose fibers derived from processed wood pulp."
  },
  {
    "question": "Which breakfast food is made by cooking beaten eggs in a frying pan, often folded over fillings like cheese or vegetables?",
    "options": [
      "Omelette",
      "Pancake",
      "Waffle",
      "Cereal"
    ],
    "answer": 0,
    "fact": "An omelette is a classic dish prepared from beaten eggs fried quickly with butter or oil."
  },
  {
    "question": "What is the bright white celestial body that lights up the night sky alongside stars?",
    "options": [
      "The Sun",
      "The Moon",
      "An asteroid",
      "A comet"
    ],
    "answer": 1,
    "fact": "The Moon is Earth's natural satellite, reflecting sunlight to illuminate night skies."
  },
  {
    "question": "Which game requires players to take turns removing wooden blocks from a towering stack without letting it crash down?",
    "options": [
      "Chess",
      "Checkers",
      "Jenga",
      "Scrabble"
    ],
    "answer": 2,
    "fact": "Jenga is a popular physical skill game involving block tower balancing and steady hands."
  },
  {
    "question": "What do caterpillars eventually transform into after resting inside a protective chrysalis or cocoon?",
    "options": [
      "Spider",
      "Butterfly or Moth",
      "Bee",
      "Ant"
    ],
    "answer": 1,
    "fact": "Larval caterpillars undergo complete metamorphosis to emerge as winged butterflies or moths."
  },
  {
    "question": "What is the colorful arched phenomenon in the sky caused by sunlight shining through water droplets after rainfall?",
    "options": [
      "Rainbow",
      "Eclipse",
      "Meteor shower",
      "Fog"
    ],
    "answer": 0,
    "fact": "A rainbow is an optical and meteorological phenomenon caused by light refraction and reflection in water droplets."
  }
];

export default function NativeTriviaQuiz({ userId, isPrivileged, remaining, quotaLimit, onRemainingChange, onExit }: {
  userId: string | null;
  isPrivileged: boolean;
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
          setChosen(null);
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
            <span className="rounded-full border border-white/30 bg-white/15 px-3 py-1 text-xs font-extrabold">{formatFreeQuotaLabel(remaining, isPrivileged, "quiz")}</span>
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
