import type { } from "react";

type LockedRoomQuestion = { id: string; q: string; options: string[]; answer: number; fact: string };

export const lockedRoomQuestionBank: LockedRoomQuestion[] = [
  {
    "id": "locked-room-004",
    "q": "Case 004 — A candle has burned down, but its wax trail stops at a closed window. The window ledge is dusty and undisturbed. Which explanation best accounts for the evidence?",
    "options": [
      "The candle was likely moved through the doorway before the room was sealed",
      "The candle vanished through the glass",
      "The wax proves the window was opened",
      "The room must have been cold"
    ],
    "answer": 0,
    "fact": "Wax on the floor can show the candle's path; undisturbed dust argues against using the window. Related principle: examine door bolts and latches and verify the route with physical tests."
  },
  {
    "id": "locked-room-005",
    "q": "Case 005 — A locked study contains wet footprints ending at a dry rug. No wet prints lead away. Which deduction is most strongly supported by these clues?",
    "options": [
      "The footprints were painted after the rug dried",
      "The rug produced the water",
      "The person left through a wall",
      "The person may have stepped onto the rug and removed wet footwear there"
    ],
    "answer": 3,
    "fact": "A dry rug can conceal later steps; inspect the rug and footwear before deciding. Related principle: examine door bolts and latches and verify the route with physical tests."
  },
  {
    "id": "locked-room-006",
    "q": "Case 006 — A key is found on the floor beneath a door whose gap is too narrow for the key to pass through. What should the investigator conclude first?",
    "options": [
      "The key slid under the door despite the measured gap",
      "The lock pulled the key through",
      "The key was already inside before the door was shut",
      "The key was delivered by the ceiling"
    ],
    "answer": 2,
    "fact": "The measured gap rules out sliding it beneath the door. Related principle: examine door bolts and latches and verify the route with physical tests."
  },
  {
    "id": "locked-room-007",
    "q": "Case 007 — A window is latched from inside, but a thin thread is caught in the latch. Which possibility should be tested before declaring the room impossible?",
    "options": [
      "The thread proves the glass was broken",
      "The thread may have been used to pull the latch after the window was closed",
      "The latch closes itself whenever it rains",
      "The thread could not have entered the room"
    ],
    "answer": 1,
    "fact": "A thread can operate a simple latch from outside if routed carefully. Related principle: examine door bolts and latches and verify the route with physical tests."
  },
  {
    "id": "locked-room-008",
    "q": "Case 008 — A room is sealed with a strip of paper across the door. The strip is intact, but a second doorway is found behind a curtain. Which answer explains the physical evidence without assuming anything supernatural?",
    "options": [
      "The paper strip proves nobody entered by any route",
      "The person may have used the concealed second doorway",
      "The person passed through the paper",
      "The curtain changed the room's dimensions"
    ],
    "answer": 1,
    "fact": "A seal only monitors the opening it covers. Related principle: examine door bolts and latches and verify the route with physical tests."
  },
  {
    "id": "locked-room-009",
    "q": "Case 009 — A locked cellar smells strongly of fresh paint, while the only paint tin is still sealed. Which detail most plausibly reveals the hidden route?",
    "options": [
      "The paint may have been applied before the tin was replaced or another source was used",
      "The smell proves the cellar has no exit",
      "The sealed tin created wet paint",
      "Paint smell can only come from outside"
    ],
    "answer": 0,
    "fact": "A sealed tin does not rule out paint already applied or another container. Related principle: examine door bolts and latches and verify the route with physical tests."
  },
  {
    "id": "locked-room-010",
    "q": "Case 010 — A clock inside a locked room is five minutes slow; the hallway clock is accurate. Which interpretation is consistent with the scene as described?",
    "options": [
      "The hallway clock must have been altered",
      "The locked room changed time",
      "The slow clock proves the occupant left at a specific minute",
      "The room clock may not have been synchronized"
    ],
    "answer": 3,
    "fact": "A clock's offset alone does not establish when someone entered or left. Related principle: examine door bolts and latches and verify the route with physical tests."
  },
  {
    "id": "locked-room-011",
    "q": "Case 011 — A glass of water is full, but a circular wet mark sits beside it on a polished desk. How could the apparent impossibility be explained?",
    "options": [
      "The ring proves the glass was never touched",
      "The desk created water",
      "The glass may have been moved after condensation or a spill left the ring",
      "The glass must be leaking through its base"
    ],
    "answer": 2,
    "fact": "A ring can remain after a glass is moved. Related principle: examine door bolts and latches and verify the route with physical tests."
  },
  {
    "id": "locked-room-012",
    "q": "Case 012 — A locked room has a pile of fine plaster below a ceiling vent; the vent cover screws are freshly scratched. Which hypothesis deserves the closest examination?",
    "options": [
      "The plaster proves the ceiling is solid",
      "The screws scratched themselves",
      "The vent may have been loosened and used as an access route",
      "The only route must be the locked door"
    ],
    "answer": 2,
    "fact": "Fresh tool marks and debris justify inspecting the vent. Related principle: examine door bolts and latches and verify the route with physical tests."
  },
  {
    "id": "locked-room-013",
    "q": "Case 013 — A room is locked from within, and a snow-covered sill outside has no footprints. Which conclusion avoids going beyond the available evidence?",
    "options": [
      "The absence of prints proves nobody approached earlier",
      "The intruder may have entered before the snowfall",
      "Snow cannot hide footprints",
      "The intruder must have flown"
    ],
    "answer": 1,
    "fact": "Footprints may be covered by later snowfall; timing matters. Related principle: examine door bolts and latches and verify the route with physical tests."
  },
  {
    "id": "locked-room-014",
    "q": "Case 014 — A locked cabinet contains a damp envelope, but the cabinet's interior is dry. Which explanation best accounts for the evidence?",
    "options": [
      "The envelope may have been damp before it was placed inside",
      "The cabinet must have leaked",
      "The envelope generated water",
      "The lock caused condensation on the paper"
    ],
    "answer": 0,
    "fact": "The dry interior suggests the envelope itself brought the moisture. Related principle: examine door bolts and latches and verify the route with physical tests."
  },
  {
    "id": "locked-room-015",
    "q": "Case 015 — A door bolt is found engaged, but its handle can be turned from outside with a narrow tool. Which deduction is most strongly supported by these clues?",
    "options": [
      "An engaged bolt makes every other method impossible",
      "The door opened by itself",
      "The handle's position proves who used it",
      "The bolt may have been manipulated through the gap or keyhole"
    ],
    "answer": 3,
    "fact": "A bolt's state does not rule out mechanical manipulation. Related principle: examine door bolts and latches and verify the route with physical tests."
  },
  {
    "id": "locked-room-016",
    "q": "Case 016 — A candle has burned down, but its wax trail stops at a closed window. The window ledge is dusty and undisturbed. What should the investigator conclude first?",
    "options": [
      "The candle vanished through the glass",
      "The wax proves the window was opened",
      "The room must have been cold",
      "The candle was likely moved through the doorway before the room was sealed"
    ],
    "answer": 3,
    "fact": "Wax on the floor can show the candle's path; undisturbed dust argues against using the window. Related principle: examine windows and shutters and verify the route with physical tests."
  },
  {
    "id": "locked-room-017",
    "q": "Case 017 — A locked study contains wet footprints ending at a dry rug. No wet prints lead away. Which possibility should be tested before declaring the room impossible?",
    "options": [
      "The footprints were painted after the rug dried",
      "The rug produced the water",
      "The person may have stepped onto the rug and removed wet footwear there",
      "The person left through a wall"
    ],
    "answer": 2,
    "fact": "A dry rug can conceal later steps; inspect the rug and footwear before deciding. Related principle: examine windows and shutters and verify the route with physical tests."
  },
  {
    "id": "locked-room-018",
    "q": "Case 018 — A key is found on the floor beneath a door whose gap is too narrow for the key to pass through. Which answer explains the physical evidence without assuming anything supernatural?",
    "options": [
      "The key slid under the door despite the measured gap",
      "The key was already inside before the door was shut",
      "The lock pulled the key through",
      "The key was delivered by the ceiling"
    ],
    "answer": 1,
    "fact": "The measured gap rules out sliding it beneath the door. Related principle: examine windows and shutters and verify the route with physical tests."
  },
  {
    "id": "locked-room-019",
    "q": "Case 019 — A window is latched from inside, but a thin thread is caught in the latch. Which detail most plausibly reveals the hidden route?",
    "options": [
      "The thread may have been used to pull the latch after the window was closed",
      "The thread proves the glass was broken",
      "The latch closes itself whenever it rains",
      "The thread could not have entered the room"
    ],
    "answer": 0,
    "fact": "A thread can operate a simple latch from outside if routed carefully. Related principle: examine windows and shutters and verify the route with physical tests."
  },
  {
    "id": "locked-room-020",
    "q": "Case 020 — A room is sealed with a strip of paper across the door. The strip is intact, but a second doorway is found behind a curtain. Which interpretation is consistent with the scene as described?",
    "options": [
      "The person may have used the concealed second doorway",
      "The paper strip proves nobody entered by any route",
      "The person passed through the paper",
      "The curtain changed the room's dimensions"
    ],
    "answer": 0,
    "fact": "A seal only monitors the opening it covers. Related principle: examine windows and shutters and verify the route with physical tests."
  },
  {
    "id": "locked-room-021",
    "q": "Case 021 — A locked cellar smells strongly of fresh paint, while the only paint tin is still sealed. How could the apparent impossibility be explained?",
    "options": [
      "The smell proves the cellar has no exit",
      "The sealed tin created wet paint",
      "Paint smell can only come from outside",
      "The paint may have been applied before the tin was replaced or another source was used"
    ],
    "answer": 3,
    "fact": "A sealed tin does not rule out paint already applied or another container. Related principle: examine windows and shutters and verify the route with physical tests."
  },
  {
    "id": "locked-room-022",
    "q": "Case 022 — A clock inside a locked room is five minutes slow; the hallway clock is accurate. Which hypothesis deserves the closest examination?",
    "options": [
      "The hallway clock must have been altered",
      "The locked room changed time",
      "The room clock may not have been synchronized",
      "The slow clock proves the occupant left at a specific minute"
    ],
    "answer": 2,
    "fact": "A clock's offset alone does not establish when someone entered or left. Related principle: examine windows and shutters and verify the route with physical tests."
  },
  {
    "id": "locked-room-023",
    "q": "Case 023 — A glass of water is full, but a circular wet mark sits beside it on a polished desk. Which conclusion avoids going beyond the available evidence?",
    "options": [
      "The ring proves the glass was never touched",
      "The glass may have been moved after condensation or a spill left the ring",
      "The desk created water",
      "The glass must be leaking through its base"
    ],
    "answer": 1,
    "fact": "A ring can remain after a glass is moved. Related principle: examine windows and shutters and verify the route with physical tests."
  },
  {
    "id": "locked-room-024",
    "q": "Case 024 — A locked room has a pile of fine plaster below a ceiling vent; the vent cover screws are freshly scratched. Which explanation best accounts for the evidence?",
    "options": [
      "The plaster proves the ceiling is solid",
      "The vent may have been loosened and used as an access route",
      "The screws scratched themselves",
      "The only route must be the locked door"
    ],
    "answer": 1,
    "fact": "Fresh tool marks and debris justify inspecting the vent. Related principle: examine windows and shutters and verify the route with physical tests."
  },
  {
    "id": "locked-room-025",
    "q": "Case 025 — A room is locked from within, and a snow-covered sill outside has no footprints. Which deduction is most strongly supported by these clues?",
    "options": [
      "The intruder may have entered before the snowfall",
      "The absence of prints proves nobody approached earlier",
      "Snow cannot hide footprints",
      "The intruder must have flown"
    ],
    "answer": 0,
    "fact": "Footprints may be covered by later snowfall; timing matters. Related principle: examine windows and shutters and verify the route with physical tests."
  },
  {
    "id": "locked-room-026",
    "q": "Case 026 — A locked cabinet contains a damp envelope, but the cabinet's interior is dry. What should the investigator conclude first?",
    "options": [
      "The cabinet must have leaked",
      "The envelope generated water",
      "The lock caused condensation on the paper",
      "The envelope may have been damp before it was placed inside"
    ],
    "answer": 3,
    "fact": "The dry interior suggests the envelope itself brought the moisture. Related principle: examine windows and shutters and verify the route with physical tests."
  },
  {
    "id": "locked-room-027",
    "q": "Case 027 — A door bolt is found engaged, but its handle can be turned from outside with a narrow tool. Which possibility should be tested before declaring the room impossible?",
    "options": [
      "An engaged bolt makes every other method impossible",
      "The door opened by itself",
      "The bolt may have been manipulated through the gap or keyhole",
      "The handle's position proves who used it"
    ],
    "answer": 2,
    "fact": "A bolt's state does not rule out mechanical manipulation. Related principle: examine windows and shutters and verify the route with physical tests."
  },
  {
    "id": "locked-room-028",
    "q": "Case 028 — A candle has burned down, but its wax trail stops at a closed window. The window ledge is dusty and undisturbed. Which answer explains the physical evidence without assuming anything supernatural?",
    "options": [
      "The candle vanished through the glass",
      "The wax proves the window was opened",
      "The candle was likely moved through the doorway before the room was sealed",
      "The room must have been cold"
    ],
    "answer": 2,
    "fact": "Wax on the floor can show the candle's path; undisturbed dust argues against using the window. Related principle: examine keys and duplicate locks and verify the route with physical tests."
  },
  {
    "id": "locked-room-029",
    "q": "Case 029 — A locked study contains wet footprints ending at a dry rug. No wet prints lead away. Which detail most plausibly reveals the hidden route?",
    "options": [
      "The footprints were painted after the rug dried",
      "The person may have stepped onto the rug and removed wet footwear there",
      "The rug produced the water",
      "The person left through a wall"
    ],
    "answer": 1,
    "fact": "A dry rug can conceal later steps; inspect the rug and footwear before deciding. Related principle: examine keys and duplicate locks and verify the route with physical tests."
  },
  {
    "id": "locked-room-030",
    "q": "Case 030 — A key is found on the floor beneath a door whose gap is too narrow for the key to pass through. Which interpretation is consistent with the scene as described?",
    "options": [
      "The key was already inside before the door was shut",
      "The key slid under the door despite the measured gap",
      "The lock pulled the key through",
      "The key was delivered by the ceiling"
    ],
    "answer": 0,
    "fact": "The measured gap rules out sliding it beneath the door. Related principle: examine keys and duplicate locks and verify the route with physical tests."
  },
  {
    "id": "locked-room-031",
    "q": "Case 031 — A window is latched from inside, but a thin thread is caught in the latch. How could the apparent impossibility be explained?",
    "options": [
      "The thread proves the glass was broken",
      "The latch closes itself whenever it rains",
      "The thread could not have entered the room",
      "The thread may have been used to pull the latch after the window was closed"
    ],
    "answer": 3,
    "fact": "A thread can operate a simple latch from outside if routed carefully. Related principle: examine keys and duplicate locks and verify the route with physical tests."
  },
  {
    "id": "locked-room-032",
    "q": "Case 032 — A room is sealed with a strip of paper across the door. The strip is intact, but a second doorway is found behind a curtain. Which hypothesis deserves the closest examination?",
    "options": [
      "The paper strip proves nobody entered by any route",
      "The person passed through the paper",
      "The curtain changed the room's dimensions",
      "The person may have used the concealed second doorway"
    ],
    "answer": 3,
    "fact": "A seal only monitors the opening it covers. Related principle: examine keys and duplicate locks and verify the route with physical tests."
  },
  {
    "id": "locked-room-033",
    "q": "Case 033 — A locked cellar smells strongly of fresh paint, while the only paint tin is still sealed. Which conclusion avoids going beyond the available evidence?",
    "options": [
      "The smell proves the cellar has no exit",
      "The sealed tin created wet paint",
      "The paint may have been applied before the tin was replaced or another source was used",
      "Paint smell can only come from outside"
    ],
    "answer": 2,
    "fact": "A sealed tin does not rule out paint already applied or another container. Related principle: examine keys and duplicate locks and verify the route with physical tests."
  },
  {
    "id": "locked-room-034",
    "q": "Case 034 — A clock inside a locked room is five minutes slow; the hallway clock is accurate. Which explanation best accounts for the evidence?",
    "options": [
      "The hallway clock must have been altered",
      "The room clock may not have been synchronized",
      "The locked room changed time",
      "The slow clock proves the occupant left at a specific minute"
    ],
    "answer": 1,
    "fact": "A clock's offset alone does not establish when someone entered or left. Related principle: examine keys and duplicate locks and verify the route with physical tests."
  },
  {
    "id": "locked-room-035",
    "q": "Case 035 — A glass of water is full, but a circular wet mark sits beside it on a polished desk. Which deduction is most strongly supported by these clues?",
    "options": [
      "The glass may have been moved after condensation or a spill left the ring",
      "The ring proves the glass was never touched",
      "The desk created water",
      "The glass must be leaking through its base"
    ],
    "answer": 0,
    "fact": "A ring can remain after a glass is moved. Related principle: examine keys and duplicate locks and verify the route with physical tests."
  },
  {
    "id": "locked-room-036",
    "q": "Case 036 — A locked room has a pile of fine plaster below a ceiling vent; the vent cover screws are freshly scratched. What should the investigator conclude first?",
    "options": [
      "The vent may have been loosened and used as an access route",
      "The plaster proves the ceiling is solid",
      "The screws scratched themselves",
      "The only route must be the locked door"
    ],
    "answer": 0,
    "fact": "Fresh tool marks and debris justify inspecting the vent. Related principle: examine keys and duplicate locks and verify the route with physical tests."
  },
  {
    "id": "locked-room-037",
    "q": "Case 037 — A room is locked from within, and a snow-covered sill outside has no footprints. Which possibility should be tested before declaring the room impossible?",
    "options": [
      "The absence of prints proves nobody approached earlier",
      "Snow cannot hide footprints",
      "The intruder must have flown",
      "The intruder may have entered before the snowfall"
    ],
    "answer": 3,
    "fact": "Footprints may be covered by later snowfall; timing matters. Related principle: examine keys and duplicate locks and verify the route with physical tests."
  },
  {
    "id": "locked-room-038",
    "q": "Case 038 — A locked cabinet contains a damp envelope, but the cabinet's interior is dry. Which answer explains the physical evidence without assuming anything supernatural?",
    "options": [
      "The cabinet must have leaked",
      "The envelope generated water",
      "The envelope may have been damp before it was placed inside",
      "The lock caused condensation on the paper"
    ],
    "answer": 2,
    "fact": "The dry interior suggests the envelope itself brought the moisture. Related principle: examine keys and duplicate locks and verify the route with physical tests."
  },
  {
    "id": "locked-room-039",
    "q": "Case 039 — A door bolt is found engaged, but its handle can be turned from outside with a narrow tool. Which detail most plausibly reveals the hidden route?",
    "options": [
      "An engaged bolt makes every other method impossible",
      "The bolt may have been manipulated through the gap or keyhole",
      "The door opened by itself",
      "The handle's position proves who used it"
    ],
    "answer": 1,
    "fact": "A bolt's state does not rule out mechanical manipulation. Related principle: examine keys and duplicate locks and verify the route with physical tests."
  },
  {
    "id": "locked-room-040",
    "q": "Case 040 — A candle has burned down, but its wax trail stops at a closed window. The window ledge is dusty and undisturbed. Which interpretation is consistent with the scene as described?",
    "options": [
      "The candle vanished through the glass",
      "The candle was likely moved through the doorway before the room was sealed",
      "The wax proves the window was opened",
      "The room must have been cold"
    ],
    "answer": 1,
    "fact": "Wax on the floor can show the candle's path; undisturbed dust argues against using the window. Related principle: examine vents and chimneys and verify the route with physical tests."
  },
  {
    "id": "locked-room-041",
    "q": "Case 041 — A locked study contains wet footprints ending at a dry rug. No wet prints lead away. How could the apparent impossibility be explained?",
    "options": [
      "The person may have stepped onto the rug and removed wet footwear there",
      "The footprints were painted after the rug dried",
      "The rug produced the water",
      "The person left through a wall"
    ],
    "answer": 0,
    "fact": "A dry rug can conceal later steps; inspect the rug and footwear before deciding. Related principle: examine vents and chimneys and verify the route with physical tests."
  },
  {
    "id": "locked-room-042",
    "q": "Case 042 — A key is found on the floor beneath a door whose gap is too narrow for the key to pass through. Which hypothesis deserves the closest examination?",
    "options": [
      "The key slid under the door despite the measured gap",
      "The lock pulled the key through",
      "The key was delivered by the ceiling",
      "The key was already inside before the door was shut"
    ],
    "answer": 3,
    "fact": "The measured gap rules out sliding it beneath the door. Related principle: examine vents and chimneys and verify the route with physical tests."
  },
  {
    "id": "locked-room-043",
    "q": "Case 043 — A window is latched from inside, but a thin thread is caught in the latch. Which conclusion avoids going beyond the available evidence?",
    "options": [
      "The thread proves the glass was broken",
      "The latch closes itself whenever it rains",
      "The thread may have been used to pull the latch after the window was closed",
      "The thread could not have entered the room"
    ],
    "answer": 2,
    "fact": "A thread can operate a simple latch from outside if routed carefully. Related principle: examine vents and chimneys and verify the route with physical tests."
  },
  {
    "id": "locked-room-044",
    "q": "Case 044 — A room is sealed with a strip of paper across the door. The strip is intact, but a second doorway is found behind a curtain. Which explanation best accounts for the evidence?",
    "options": [
      "The paper strip proves nobody entered by any route",
      "The person passed through the paper",
      "The person may have used the concealed second doorway",
      "The curtain changed the room's dimensions"
    ],
    "answer": 2,
    "fact": "A seal only monitors the opening it covers. Related principle: examine vents and chimneys and verify the route with physical tests."
  },
  {
    "id": "locked-room-045",
    "q": "Case 045 — A locked cellar smells strongly of fresh paint, while the only paint tin is still sealed. Which deduction is most strongly supported by these clues?",
    "options": [
      "The smell proves the cellar has no exit",
      "The paint may have been applied before the tin was replaced or another source was used",
      "The sealed tin created wet paint",
      "Paint smell can only come from outside"
    ],
    "answer": 1,
    "fact": "A sealed tin does not rule out paint already applied or another container. Related principle: examine vents and chimneys and verify the route with physical tests."
  },
  {
    "id": "locked-room-046",
    "q": "Case 046 — A clock inside a locked room is five minutes slow; the hallway clock is accurate. What should the investigator conclude first?",
    "options": [
      "The room clock may not have been synchronized",
      "The hallway clock must have been altered",
      "The locked room changed time",
      "The slow clock proves the occupant left at a specific minute"
    ],
    "answer": 0,
    "fact": "A clock's offset alone does not establish when someone entered or left. Related principle: examine vents and chimneys and verify the route with physical tests."
  },
  {
    "id": "locked-room-047",
    "q": "Case 047 — A glass of water is full, but a circular wet mark sits beside it on a polished desk. Which possibility should be tested before declaring the room impossible?",
    "options": [
      "The ring proves the glass was never touched",
      "The desk created water",
      "The glass must be leaking through its base",
      "The glass may have been moved after condensation or a spill left the ring"
    ],
    "answer": 3,
    "fact": "A ring can remain after a glass is moved. Related principle: examine vents and chimneys and verify the route with physical tests."
  },
  {
    "id": "locked-room-048",
    "q": "Case 048 — A locked room has a pile of fine plaster below a ceiling vent; the vent cover screws are freshly scratched. Which answer explains the physical evidence without assuming anything supernatural?",
    "options": [
      "The plaster proves the ceiling is solid",
      "The screws scratched themselves",
      "The only route must be the locked door",
      "The vent may have been loosened and used as an access route"
    ],
    "answer": 3,
    "fact": "Fresh tool marks and debris justify inspecting the vent. Related principle: examine vents and chimneys and verify the route with physical tests."
  },
  {
    "id": "locked-room-049",
    "q": "Case 049 — A room is locked from within, and a snow-covered sill outside has no footprints. Which detail most plausibly reveals the hidden route?",
    "options": [
      "The absence of prints proves nobody approached earlier",
      "Snow cannot hide footprints",
      "The intruder may have entered before the snowfall",
      "The intruder must have flown"
    ],
    "answer": 2,
    "fact": "Footprints may be covered by later snowfall; timing matters. Related principle: examine vents and chimneys and verify the route with physical tests."
  },
  {
    "id": "locked-room-050",
    "q": "Case 050 — A locked cabinet contains a damp envelope, but the cabinet's interior is dry. Which interpretation is consistent with the scene as described?",
    "options": [
      "The cabinet must have leaked",
      "The envelope may have been damp before it was placed inside",
      "The envelope generated water",
      "The lock caused condensation on the paper"
    ],
    "answer": 1,
    "fact": "The dry interior suggests the envelope itself brought the moisture. Related principle: examine vents and chimneys and verify the route with physical tests."
  },
  {
    "id": "locked-room-051",
    "q": "Case 051 — A door bolt is found engaged, but its handle can be turned from outside with a narrow tool. How could the apparent impossibility be explained?",
    "options": [
      "The bolt may have been manipulated through the gap or keyhole",
      "An engaged bolt makes every other method impossible",
      "The door opened by itself",
      "The handle's position proves who used it"
    ],
    "answer": 0,
    "fact": "A bolt's state does not rule out mechanical manipulation. Related principle: examine vents and chimneys and verify the route with physical tests."
  },
  {
    "id": "locked-room-052",
    "q": "Case 052 — A candle has burned down, but its wax trail stops at a closed window. The window ledge is dusty and undisturbed. Which hypothesis deserves the closest examination?",
    "options": [
      "The candle was likely moved through the doorway before the room was sealed",
      "The candle vanished through the glass",
      "The wax proves the window was opened",
      "The room must have been cold"
    ],
    "answer": 0,
    "fact": "Wax on the floor can show the candle's path; undisturbed dust argues against using the window. Related principle: examine mirrors and sightlines and verify the route with physical tests."
  },
  {
    "id": "locked-room-053",
    "q": "Case 053 — A locked study contains wet footprints ending at a dry rug. No wet prints lead away. Which conclusion avoids going beyond the available evidence?",
    "options": [
      "The footprints were painted after the rug dried",
      "The rug produced the water",
      "The person left through a wall",
      "The person may have stepped onto the rug and removed wet footwear there"
    ],
    "answer": 3,
    "fact": "A dry rug can conceal later steps; inspect the rug and footwear before deciding. Related principle: examine mirrors and sightlines and verify the route with physical tests."
  },
  {
    "id": "locked-room-054",
    "q": "Case 054 — A key is found on the floor beneath a door whose gap is too narrow for the key to pass through. Which explanation best accounts for the evidence?",
    "options": [
      "The key slid under the door despite the measured gap",
      "The lock pulled the key through",
      "The key was already inside before the door was shut",
      "The key was delivered by the ceiling"
    ],
    "answer": 2,
    "fact": "The measured gap rules out sliding it beneath the door. Related principle: examine mirrors and sightlines and verify the route with physical tests."
  },
  {
    "id": "locked-room-055",
    "q": "Case 055 — A window is latched from inside, but a thin thread is caught in the latch. Which deduction is most strongly supported by these clues?",
    "options": [
      "The thread proves the glass was broken",
      "The thread may have been used to pull the latch after the window was closed",
      "The latch closes itself whenever it rains",
      "The thread could not have entered the room"
    ],
    "answer": 1,
    "fact": "A thread can operate a simple latch from outside if routed carefully. Related principle: examine mirrors and sightlines and verify the route with physical tests."
  },
  {
    "id": "locked-room-056",
    "q": "Case 056 — A room is sealed with a strip of paper across the door. The strip is intact, but a second doorway is found behind a curtain. What should the investigator conclude first?",
    "options": [
      "The paper strip proves nobody entered by any route",
      "The person may have used the concealed second doorway",
      "The person passed through the paper",
      "The curtain changed the room's dimensions"
    ],
    "answer": 1,
    "fact": "A seal only monitors the opening it covers. Related principle: examine mirrors and sightlines and verify the route with physical tests."
  },
  {
    "id": "locked-room-057",
    "q": "Case 057 — A locked cellar smells strongly of fresh paint, while the only paint tin is still sealed. Which possibility should be tested before declaring the room impossible?",
    "options": [
      "The paint may have been applied before the tin was replaced or another source was used",
      "The smell proves the cellar has no exit",
      "The sealed tin created wet paint",
      "Paint smell can only come from outside"
    ],
    "answer": 0,
    "fact": "A sealed tin does not rule out paint already applied or another container. Related principle: examine mirrors and sightlines and verify the route with physical tests."
  },
  {
    "id": "locked-room-058",
    "q": "Case 058 — A clock inside a locked room is five minutes slow; the hallway clock is accurate. Which answer explains the physical evidence without assuming anything supernatural?",
    "options": [
      "The hallway clock must have been altered",
      "The locked room changed time",
      "The slow clock proves the occupant left at a specific minute",
      "The room clock may not have been synchronized"
    ],
    "answer": 3,
    "fact": "A clock's offset alone does not establish when someone entered or left. Related principle: examine mirrors and sightlines and verify the route with physical tests."
  },
  {
    "id": "locked-room-059",
    "q": "Case 059 — A glass of water is full, but a circular wet mark sits beside it on a polished desk. Which detail most plausibly reveals the hidden route?",
    "options": [
      "The ring proves the glass was never touched",
      "The desk created water",
      "The glass may have been moved after condensation or a spill left the ring",
      "The glass must be leaking through its base"
    ],
    "answer": 2,
    "fact": "A ring can remain after a glass is moved. Related principle: examine mirrors and sightlines and verify the route with physical tests."
  },
  {
    "id": "locked-room-060",
    "q": "Case 060 — A locked room has a pile of fine plaster below a ceiling vent; the vent cover screws are freshly scratched. Which interpretation is consistent with the scene as described?",
    "options": [
      "The plaster proves the ceiling is solid",
      "The screws scratched themselves",
      "The vent may have been loosened and used as an access route",
      "The only route must be the locked door"
    ],
    "answer": 2,
    "fact": "Fresh tool marks and debris justify inspecting the vent. Related principle: examine mirrors and sightlines and verify the route with physical tests."
  },
  {
    "id": "locked-room-061",
    "q": "Case 061 — A room is locked from within, and a snow-covered sill outside has no footprints. How could the apparent impossibility be explained?",
    "options": [
      "The absence of prints proves nobody approached earlier",
      "The intruder may have entered before the snowfall",
      "Snow cannot hide footprints",
      "The intruder must have flown"
    ],
    "answer": 1,
    "fact": "Footprints may be covered by later snowfall; timing matters. Related principle: examine mirrors and sightlines and verify the route with physical tests."
  },
  {
    "id": "locked-room-062",
    "q": "Case 062 — A locked cabinet contains a damp envelope, but the cabinet's interior is dry. Which hypothesis deserves the closest examination?",
    "options": [
      "The envelope may have been damp before it was placed inside",
      "The cabinet must have leaked",
      "The envelope generated water",
      "The lock caused condensation on the paper"
    ],
    "answer": 0,
    "fact": "The dry interior suggests the envelope itself brought the moisture. Related principle: examine mirrors and sightlines and verify the route with physical tests."
  },
  {
    "id": "locked-room-063",
    "q": "Case 063 — A door bolt is found engaged, but its handle can be turned from outside with a narrow tool. Which conclusion avoids going beyond the available evidence?",
    "options": [
      "An engaged bolt makes every other method impossible",
      "The door opened by itself",
      "The handle's position proves who used it",
      "The bolt may have been manipulated through the gap or keyhole"
    ],
    "answer": 3,
    "fact": "A bolt's state does not rule out mechanical manipulation. Related principle: examine mirrors and sightlines and verify the route with physical tests."
  },
  {
    "id": "locked-room-064",
    "q": "Case 064 — A candle has burned down, but its wax trail stops at a closed window. The window ledge is dusty and undisturbed. Which explanation best accounts for the evidence?",
    "options": [
      "The candle vanished through the glass",
      "The wax proves the window was opened",
      "The room must have been cold",
      "The candle was likely moved through the doorway before the room was sealed"
    ],
    "answer": 3,
    "fact": "Wax on the floor can show the candle's path; undisturbed dust argues against using the window. Related principle: examine clocks and timelines and verify the route with physical tests."
  },
  {
    "id": "locked-room-065",
    "q": "Case 065 — A locked study contains wet footprints ending at a dry rug. No wet prints lead away. Which deduction is most strongly supported by these clues?",
    "options": [
      "The footprints were painted after the rug dried",
      "The rug produced the water",
      "The person may have stepped onto the rug and removed wet footwear there",
      "The person left through a wall"
    ],
    "answer": 2,
    "fact": "A dry rug can conceal later steps; inspect the rug and footwear before deciding. Related principle: examine clocks and timelines and verify the route with physical tests."
  },
  {
    "id": "locked-room-066",
    "q": "Case 066 — A key is found on the floor beneath a door whose gap is too narrow for the key to pass through. What should the investigator conclude first?",
    "options": [
      "The key slid under the door despite the measured gap",
      "The key was already inside before the door was shut",
      "The lock pulled the key through",
      "The key was delivered by the ceiling"
    ],
    "answer": 1,
    "fact": "The measured gap rules out sliding it beneath the door. Related principle: examine clocks and timelines and verify the route with physical tests."
  },
  {
    "id": "locked-room-067",
    "q": "Case 067 — A window is latched from inside, but a thin thread is caught in the latch. Which possibility should be tested before declaring the room impossible?",
    "options": [
      "The thread may have been used to pull the latch after the window was closed",
      "The thread proves the glass was broken",
      "The latch closes itself whenever it rains",
      "The thread could not have entered the room"
    ],
    "answer": 0,
    "fact": "A thread can operate a simple latch from outside if routed carefully. Related principle: examine clocks and timelines and verify the route with physical tests."
  },
  {
    "id": "locked-room-068",
    "q": "Case 068 — A room is sealed with a strip of paper across the door. The strip is intact, but a second doorway is found behind a curtain. Which answer explains the physical evidence without assuming anything supernatural?",
    "options": [
      "The person may have used the concealed second doorway",
      "The paper strip proves nobody entered by any route",
      "The person passed through the paper",
      "The curtain changed the room's dimensions"
    ],
    "answer": 0,
    "fact": "A seal only monitors the opening it covers. Related principle: examine clocks and timelines and verify the route with physical tests."
  },
  {
    "id": "locked-room-069",
    "q": "Case 069 — A locked cellar smells strongly of fresh paint, while the only paint tin is still sealed. Which detail most plausibly reveals the hidden route?",
    "options": [
      "The smell proves the cellar has no exit",
      "The sealed tin created wet paint",
      "Paint smell can only come from outside",
      "The paint may have been applied before the tin was replaced or another source was used"
    ],
    "answer": 3,
    "fact": "A sealed tin does not rule out paint already applied or another container. Related principle: examine clocks and timelines and verify the route with physical tests."
  },
  {
    "id": "locked-room-070",
    "q": "Case 070 — A clock inside a locked room is five minutes slow; the hallway clock is accurate. Which interpretation is consistent with the scene as described?",
    "options": [
      "The hallway clock must have been altered",
      "The locked room changed time",
      "The room clock may not have been synchronized",
      "The slow clock proves the occupant left at a specific minute"
    ],
    "answer": 2,
    "fact": "A clock's offset alone does not establish when someone entered or left. Related principle: examine clocks and timelines and verify the route with physical tests."
  },
  {
    "id": "locked-room-071",
    "q": "Case 071 — A glass of water is full, but a circular wet mark sits beside it on a polished desk. How could the apparent impossibility be explained?",
    "options": [
      "The ring proves the glass was never touched",
      "The glass may have been moved after condensation or a spill left the ring",
      "The desk created water",
      "The glass must be leaking through its base"
    ],
    "answer": 1,
    "fact": "A ring can remain after a glass is moved. Related principle: examine clocks and timelines and verify the route with physical tests."
  },
  {
    "id": "locked-room-072",
    "q": "Case 072 — A locked room has a pile of fine plaster below a ceiling vent; the vent cover screws are freshly scratched. Which hypothesis deserves the closest examination?",
    "options": [
      "The plaster proves the ceiling is solid",
      "The vent may have been loosened and used as an access route",
      "The screws scratched themselves",
      "The only route must be the locked door"
    ],
    "answer": 1,
    "fact": "Fresh tool marks and debris justify inspecting the vent. Related principle: examine clocks and timelines and verify the route with physical tests."
  },
  {
    "id": "locked-room-073",
    "q": "Case 073 — A room is locked from within, and a snow-covered sill outside has no footprints. Which conclusion avoids going beyond the available evidence?",
    "options": [
      "The intruder may have entered before the snowfall",
      "The absence of prints proves nobody approached earlier",
      "Snow cannot hide footprints",
      "The intruder must have flown"
    ],
    "answer": 0,
    "fact": "Footprints may be covered by later snowfall; timing matters. Related principle: examine clocks and timelines and verify the route with physical tests."
  },
  {
    "id": "locked-room-074",
    "q": "Case 074 — A locked cabinet contains a damp envelope, but the cabinet's interior is dry. Which explanation best accounts for the evidence?",
    "options": [
      "The cabinet must have leaked",
      "The envelope generated water",
      "The lock caused condensation on the paper",
      "The envelope may have been damp before it was placed inside"
    ],
    "answer": 3,
    "fact": "The dry interior suggests the envelope itself brought the moisture. Related principle: examine clocks and timelines and verify the route with physical tests."
  },
  {
    "id": "locked-room-075",
    "q": "Case 075 — A door bolt is found engaged, but its handle can be turned from outside with a narrow tool. Which deduction is most strongly supported by these clues?",
    "options": [
      "An engaged bolt makes every other method impossible",
      "The door opened by itself",
      "The bolt may have been manipulated through the gap or keyhole",
      "The handle's position proves who used it"
    ],
    "answer": 2,
    "fact": "A bolt's state does not rule out mechanical manipulation. Related principle: examine clocks and timelines and verify the route with physical tests."
  },
  {
    "id": "locked-room-076",
    "q": "Case 076 — A candle has burned down, but its wax trail stops at a closed window. The window ledge is dusty and undisturbed. What should the investigator conclude first?",
    "options": [
      "The candle vanished through the glass",
      "The wax proves the window was opened",
      "The candle was likely moved through the doorway before the room was sealed",
      "The room must have been cold"
    ],
    "answer": 2,
    "fact": "Wax on the floor can show the candle's path; undisturbed dust argues against using the window. Related principle: examine footprints and floor traces and verify the route with physical tests."
  },
  {
    "id": "locked-room-077",
    "q": "Case 077 — A locked study contains wet footprints ending at a dry rug. No wet prints lead away. Which possibility should be tested before declaring the room impossible?",
    "options": [
      "The footprints were painted after the rug dried",
      "The person may have stepped onto the rug and removed wet footwear there",
      "The rug produced the water",
      "The person left through a wall"
    ],
    "answer": 1,
    "fact": "A dry rug can conceal later steps; inspect the rug and footwear before deciding. Related principle: examine footprints and floor traces and verify the route with physical tests."
  },
  {
    "id": "locked-room-078",
    "q": "Case 078 — A key is found on the floor beneath a door whose gap is too narrow for the key to pass through. Which answer explains the physical evidence without assuming anything supernatural?",
    "options": [
      "The key was already inside before the door was shut",
      "The key slid under the door despite the measured gap",
      "The lock pulled the key through",
      "The key was delivered by the ceiling"
    ],
    "answer": 0,
    "fact": "The measured gap rules out sliding it beneath the door. Related principle: examine footprints and floor traces and verify the route with physical tests."
  },
  {
    "id": "locked-room-079",
    "q": "Case 079 — A window is latched from inside, but a thin thread is caught in the latch. Which detail most plausibly reveals the hidden route?",
    "options": [
      "The thread proves the glass was broken",
      "The latch closes itself whenever it rains",
      "The thread could not have entered the room",
      "The thread may have been used to pull the latch after the window was closed"
    ],
    "answer": 3,
    "fact": "A thread can operate a simple latch from outside if routed carefully. Related principle: examine footprints and floor traces and verify the route with physical tests."
  },
  {
    "id": "locked-room-080",
    "q": "Case 080 — A room is sealed with a strip of paper across the door. The strip is intact, but a second doorway is found behind a curtain. Which interpretation is consistent with the scene as described?",
    "options": [
      "The paper strip proves nobody entered by any route",
      "The person passed through the paper",
      "The curtain changed the room's dimensions",
      "The person may have used the concealed second doorway"
    ],
    "answer": 3,
    "fact": "A seal only monitors the opening it covers. Related principle: examine footprints and floor traces and verify the route with physical tests."
  },
  {
    "id": "locked-room-081",
    "q": "Case 081 — A locked cellar smells strongly of fresh paint, while the only paint tin is still sealed. How could the apparent impossibility be explained?",
    "options": [
      "The smell proves the cellar has no exit",
      "The sealed tin created wet paint",
      "The paint may have been applied before the tin was replaced or another source was used",
      "Paint smell can only come from outside"
    ],
    "answer": 2,
    "fact": "A sealed tin does not rule out paint already applied or another container. Related principle: examine footprints and floor traces and verify the route with physical tests."
  },
  {
    "id": "locked-room-082",
    "q": "Case 082 — A clock inside a locked room is five minutes slow; the hallway clock is accurate. Which hypothesis deserves the closest examination?",
    "options": [
      "The hallway clock must have been altered",
      "The room clock may not have been synchronized",
      "The locked room changed time",
      "The slow clock proves the occupant left at a specific minute"
    ],
    "answer": 1,
    "fact": "A clock's offset alone does not establish when someone entered or left. Related principle: examine footprints and floor traces and verify the route with physical tests."
  },
  {
    "id": "locked-room-083",
    "q": "Case 083 — A glass of water is full, but a circular wet mark sits beside it on a polished desk. Which conclusion avoids going beyond the available evidence?",
    "options": [
      "The glass may have been moved after condensation or a spill left the ring",
      "The ring proves the glass was never touched",
      "The desk created water",
      "The glass must be leaking through its base"
    ],
    "answer": 0,
    "fact": "A ring can remain after a glass is moved. Related principle: examine footprints and floor traces and verify the route with physical tests."
  },
  {
    "id": "locked-room-084",
    "q": "Case 084 — A locked room has a pile of fine plaster below a ceiling vent; the vent cover screws are freshly scratched. Which explanation best accounts for the evidence?",
    "options": [
      "The vent may have been loosened and used as an access route",
      "The plaster proves the ceiling is solid",
      "The screws scratched themselves",
      "The only route must be the locked door"
    ],
    "answer": 0,
    "fact": "Fresh tool marks and debris justify inspecting the vent. Related principle: examine footprints and floor traces and verify the route with physical tests."
  },
  {
    "id": "locked-room-085",
    "q": "Case 085 — A room is locked from within, and a snow-covered sill outside has no footprints. Which deduction is most strongly supported by these clues?",
    "options": [
      "The absence of prints proves nobody approached earlier",
      "Snow cannot hide footprints",
      "The intruder must have flown",
      "The intruder may have entered before the snowfall"
    ],
    "answer": 3,
    "fact": "Footprints may be covered by later snowfall; timing matters. Related principle: examine footprints and floor traces and verify the route with physical tests."
  },
  {
    "id": "locked-room-086",
    "q": "Case 086 — A locked cabinet contains a damp envelope, but the cabinet's interior is dry. What should the investigator conclude first?",
    "options": [
      "The cabinet must have leaked",
      "The envelope generated water",
      "The envelope may have been damp before it was placed inside",
      "The lock caused condensation on the paper"
    ],
    "answer": 2,
    "fact": "The dry interior suggests the envelope itself brought the moisture. Related principle: examine footprints and floor traces and verify the route with physical tests."
  },
  {
    "id": "locked-room-087",
    "q": "Case 087 — A door bolt is found engaged, but its handle can be turned from outside with a narrow tool. Which possibility should be tested before declaring the room impossible?",
    "options": [
      "An engaged bolt makes every other method impossible",
      "The bolt may have been manipulated through the gap or keyhole",
      "The door opened by itself",
      "The handle's position proves who used it"
    ],
    "answer": 1,
    "fact": "A bolt's state does not rule out mechanical manipulation. Related principle: examine footprints and floor traces and verify the route with physical tests."
  },
  {
    "id": "locked-room-088",
    "q": "Case 088 — A candle has burned down, but its wax trail stops at a closed window. The window ledge is dusty and undisturbed. Which answer explains the physical evidence without assuming anything supernatural?",
    "options": [
      "The candle vanished through the glass",
      "The candle was likely moved through the doorway before the room was sealed",
      "The wax proves the window was opened",
      "The room must have been cold"
    ],
    "answer": 1,
    "fact": "Wax on the floor can show the candle's path; undisturbed dust argues against using the window. Related principle: examine candles and light sources and verify the route with physical tests."
  },
  {
    "id": "locked-room-089",
    "q": "Case 089 — A locked study contains wet footprints ending at a dry rug. No wet prints lead away. Which detail most plausibly reveals the hidden route?",
    "options": [
      "The person may have stepped onto the rug and removed wet footwear there",
      "The footprints were painted after the rug dried",
      "The rug produced the water",
      "The person left through a wall"
    ],
    "answer": 0,
    "fact": "A dry rug can conceal later steps; inspect the rug and footwear before deciding. Related principle: examine candles and light sources and verify the route with physical tests."
  },
  {
    "id": "locked-room-090",
    "q": "Case 090 — A key is found on the floor beneath a door whose gap is too narrow for the key to pass through. Which interpretation is consistent with the scene as described?",
    "options": [
      "The key slid under the door despite the measured gap",
      "The lock pulled the key through",
      "The key was delivered by the ceiling",
      "The key was already inside before the door was shut"
    ],
    "answer": 3,
    "fact": "The measured gap rules out sliding it beneath the door. Related principle: examine candles and light sources and verify the route with physical tests."
  },
  {
    "id": "locked-room-091",
    "q": "Case 091 — A window is latched from inside, but a thin thread is caught in the latch. How could the apparent impossibility be explained?",
    "options": [
      "The thread proves the glass was broken",
      "The latch closes itself whenever it rains",
      "The thread may have been used to pull the latch after the window was closed",
      "The thread could not have entered the room"
    ],
    "answer": 2,
    "fact": "A thread can operate a simple latch from outside if routed carefully. Related principle: examine candles and light sources and verify the route with physical tests."
  },
  {
    "id": "locked-room-092",
    "q": "Case 092 — A room is sealed with a strip of paper across the door. The strip is intact, but a second doorway is found behind a curtain. Which hypothesis deserves the closest examination?",
    "options": [
      "The paper strip proves nobody entered by any route",
      "The person passed through the paper",
      "The person may have used the concealed second doorway",
      "The curtain changed the room's dimensions"
    ],
    "answer": 2,
    "fact": "A seal only monitors the opening it covers. Related principle: examine candles and light sources and verify the route with physical tests."
  },
  {
    "id": "locked-room-093",
    "q": "Case 093 — A locked cellar smells strongly of fresh paint, while the only paint tin is still sealed. Which conclusion avoids going beyond the available evidence?",
    "options": [
      "The smell proves the cellar has no exit",
      "The paint may have been applied before the tin was replaced or another source was used",
      "The sealed tin created wet paint",
      "Paint smell can only come from outside"
    ],
    "answer": 1,
    "fact": "A sealed tin does not rule out paint already applied or another container. Related principle: examine candles and light sources and verify the route with physical tests."
  },
  {
    "id": "locked-room-094",
    "q": "Case 094 — A clock inside a locked room is five minutes slow; the hallway clock is accurate. Which explanation best accounts for the evidence?",
    "options": [
      "The room clock may not have been synchronized",
      "The hallway clock must have been altered",
      "The locked room changed time",
      "The slow clock proves the occupant left at a specific minute"
    ],
    "answer": 0,
    "fact": "A clock's offset alone does not establish when someone entered or left. Related principle: examine candles and light sources and verify the route with physical tests."
  },
  {
    "id": "locked-room-095",
    "q": "Case 095 — A glass of water is full, but a circular wet mark sits beside it on a polished desk. Which deduction is most strongly supported by these clues?",
    "options": [
      "The ring proves the glass was never touched",
      "The desk created water",
      "The glass must be leaking through its base",
      "The glass may have been moved after condensation or a spill left the ring"
    ],
    "answer": 3,
    "fact": "A ring can remain after a glass is moved. Related principle: examine candles and light sources and verify the route with physical tests."
  },
  {
    "id": "locked-room-096",
    "q": "Case 096 — A locked room has a pile of fine plaster below a ceiling vent; the vent cover screws are freshly scratched. What should the investigator conclude first?",
    "options": [
      "The plaster proves the ceiling is solid",
      "The screws scratched themselves",
      "The only route must be the locked door",
      "The vent may have been loosened and used as an access route"
    ],
    "answer": 3,
    "fact": "Fresh tool marks and debris justify inspecting the vent. Related principle: examine candles and light sources and verify the route with physical tests."
  },
  {
    "id": "locked-room-097",
    "q": "Case 097 — A room is locked from within, and a snow-covered sill outside has no footprints. Which possibility should be tested before declaring the room impossible?",
    "options": [
      "The absence of prints proves nobody approached earlier",
      "Snow cannot hide footprints",
      "The intruder may have entered before the snowfall",
      "The intruder must have flown"
    ],
    "answer": 2,
    "fact": "Footprints may be covered by later snowfall; timing matters. Related principle: examine candles and light sources and verify the route with physical tests."
  },
  {
    "id": "locked-room-098",
    "q": "Case 098 — A locked cabinet contains a damp envelope, but the cabinet's interior is dry. Which answer explains the physical evidence without assuming anything supernatural?",
    "options": [
      "The cabinet must have leaked",
      "The envelope may have been damp before it was placed inside",
      "The envelope generated water",
      "The lock caused condensation on the paper"
    ],
    "answer": 1,
    "fact": "The dry interior suggests the envelope itself brought the moisture. Related principle: examine candles and light sources and verify the route with physical tests."
  },
  {
    "id": "locked-room-099",
    "q": "Case 099 — A door bolt is found engaged, but its handle can be turned from outside with a narrow tool. Which detail most plausibly reveals the hidden route?",
    "options": [
      "The bolt may have been manipulated through the gap or keyhole",
      "An engaged bolt makes every other method impossible",
      "The door opened by itself",
      "The handle's position proves who used it"
    ],
    "answer": 0,
    "fact": "A bolt's state does not rule out mechanical manipulation. Related principle: examine candles and light sources and verify the route with physical tests."
  },
  {
    "id": "locked-room-100",
    "q": "Case 100 — A candle has burned down, but its wax trail stops at a closed window. The window ledge is dusty and undisturbed. Which interpretation is consistent with the scene as described?",
    "options": [
      "The candle was likely moved through the doorway before the room was sealed",
      "The candle vanished through the glass",
      "The wax proves the window was opened",
      "The room must have been cold"
    ],
    "answer": 0,
    "fact": "Wax on the floor can show the candle's path; undisturbed dust argues against using the window. Related principle: examine water, ice and condensation and verify the route with physical tests."
  },
  {
    "id": "locked-room-101",
    "q": "Case 101 — A locked study contains wet footprints ending at a dry rug. No wet prints lead away. How could the apparent impossibility be explained?",
    "options": [
      "The footprints were painted after the rug dried",
      "The rug produced the water",
      "The person left through a wall",
      "The person may have stepped onto the rug and removed wet footwear there"
    ],
    "answer": 3,
    "fact": "A dry rug can conceal later steps; inspect the rug and footwear before deciding. Related principle: examine water, ice and condensation and verify the route with physical tests."
  },
  {
    "id": "locked-room-102",
    "q": "Case 102 — A key is found on the floor beneath a door whose gap is too narrow for the key to pass through. Which hypothesis deserves the closest examination?",
    "options": [
      "The key slid under the door despite the measured gap",
      "The lock pulled the key through",
      "The key was already inside before the door was shut",
      "The key was delivered by the ceiling"
    ],
    "answer": 2,
    "fact": "The measured gap rules out sliding it beneath the door. Related principle: examine water, ice and condensation and verify the route with physical tests."
  },
  {
    "id": "locked-room-103",
    "q": "Case 103 — A window is latched from inside, but a thin thread is caught in the latch. Which conclusion avoids going beyond the available evidence?",
    "options": [
      "The thread proves the glass was broken",
      "The thread may have been used to pull the latch after the window was closed",
      "The latch closes itself whenever it rains",
      "The thread could not have entered the room"
    ],
    "answer": 1,
    "fact": "A thread can operate a simple latch from outside if routed carefully. Related principle: examine water, ice and condensation and verify the route with physical tests."
  },
  {
    "id": "locked-room-104",
    "q": "Case 104 — A room is sealed with a strip of paper across the door. The strip is intact, but a second doorway is found behind a curtain. Which explanation best accounts for the evidence?",
    "options": [
      "The paper strip proves nobody entered by any route",
      "The person may have used the concealed second doorway",
      "The person passed through the paper",
      "The curtain changed the room's dimensions"
    ],
    "answer": 1,
    "fact": "A seal only monitors the opening it covers. Related principle: examine water, ice and condensation and verify the route with physical tests."
  },
  {
    "id": "locked-room-105",
    "q": "Case 105 — A locked cellar smells strongly of fresh paint, while the only paint tin is still sealed. Which deduction is most strongly supported by these clues?",
    "options": [
      "The paint may have been applied before the tin was replaced or another source was used",
      "The smell proves the cellar has no exit",
      "The sealed tin created wet paint",
      "Paint smell can only come from outside"
    ],
    "answer": 0,
    "fact": "A sealed tin does not rule out paint already applied or another container. Related principle: examine water, ice and condensation and verify the route with physical tests."
  },
  {
    "id": "locked-room-106",
    "q": "Case 106 — A clock inside a locked room is five minutes slow; the hallway clock is accurate. What should the investigator conclude first?",
    "options": [
      "The hallway clock must have been altered",
      "The locked room changed time",
      "The slow clock proves the occupant left at a specific minute",
      "The room clock may not have been synchronized"
    ],
    "answer": 3,
    "fact": "A clock's offset alone does not establish when someone entered or left. Related principle: examine water, ice and condensation and verify the route with physical tests."
  },
  {
    "id": "locked-room-107",
    "q": "Case 107 — A glass of water is full, but a circular wet mark sits beside it on a polished desk. Which possibility should be tested before declaring the room impossible?",
    "options": [
      "The ring proves the glass was never touched",
      "The desk created water",
      "The glass may have been moved after condensation or a spill left the ring",
      "The glass must be leaking through its base"
    ],
    "answer": 2,
    "fact": "A ring can remain after a glass is moved. Related principle: examine water, ice and condensation and verify the route with physical tests."
  },
  {
    "id": "locked-room-108",
    "q": "Case 108 — A locked room has a pile of fine plaster below a ceiling vent; the vent cover screws are freshly scratched. Which answer explains the physical evidence without assuming anything supernatural?",
    "options": [
      "The plaster proves the ceiling is solid",
      "The screws scratched themselves",
      "The vent may have been loosened and used as an access route",
      "The only route must be the locked door"
    ],
    "answer": 2,
    "fact": "Fresh tool marks and debris justify inspecting the vent. Related principle: examine water, ice and condensation and verify the route with physical tests."
  },
  {
    "id": "locked-room-109",
    "q": "Case 109 — A room is locked from within, and a snow-covered sill outside has no footprints. Which detail most plausibly reveals the hidden route?",
    "options": [
      "The absence of prints proves nobody approached earlier",
      "The intruder may have entered before the snowfall",
      "Snow cannot hide footprints",
      "The intruder must have flown"
    ],
    "answer": 1,
    "fact": "Footprints may be covered by later snowfall; timing matters. Related principle: examine water, ice and condensation and verify the route with physical tests."
  },
  {
    "id": "locked-room-110",
    "q": "Case 110 — A locked cabinet contains a damp envelope, but the cabinet's interior is dry. Which interpretation is consistent with the scene as described?",
    "options": [
      "The envelope may have been damp before it was placed inside",
      "The cabinet must have leaked",
      "The envelope generated water",
      "The lock caused condensation on the paper"
    ],
    "answer": 0,
    "fact": "The dry interior suggests the envelope itself brought the moisture. Related principle: examine water, ice and condensation and verify the route with physical tests."
  },
  {
    "id": "locked-room-111",
    "q": "Case 111 — A door bolt is found engaged, but its handle can be turned from outside with a narrow tool. How could the apparent impossibility be explained?",
    "options": [
      "An engaged bolt makes every other method impossible",
      "The door opened by itself",
      "The handle's position proves who used it",
      "The bolt may have been manipulated through the gap or keyhole"
    ],
    "answer": 3,
    "fact": "A bolt's state does not rule out mechanical manipulation. Related principle: examine water, ice and condensation and verify the route with physical tests."
  },
  {
    "id": "locked-room-112",
    "q": "Case 112 — A candle has burned down, but its wax trail stops at a closed window. The window ledge is dusty and undisturbed. Which hypothesis deserves the closest examination?",
    "options": [
      "The candle vanished through the glass",
      "The wax proves the window was opened",
      "The room must have been cold",
      "The candle was likely moved through the doorway before the room was sealed"
    ],
    "answer": 3,
    "fact": "Wax on the floor can show the candle's path; undisturbed dust argues against using the window. Related principle: examine dust, powder and fibres and verify the route with physical tests."
  },
  {
    "id": "locked-room-113",
    "q": "Case 113 — A locked study contains wet footprints ending at a dry rug. No wet prints lead away. Which conclusion avoids going beyond the available evidence?",
    "options": [
      "The footprints were painted after the rug dried",
      "The rug produced the water",
      "The person may have stepped onto the rug and removed wet footwear there",
      "The person left through a wall"
    ],
    "answer": 2,
    "fact": "A dry rug can conceal later steps; inspect the rug and footwear before deciding. Related principle: examine dust, powder and fibres and verify the route with physical tests."
  },
  {
    "id": "locked-room-114",
    "q": "Case 114 — A key is found on the floor beneath a door whose gap is too narrow for the key to pass through. Which explanation best accounts for the evidence?",
    "options": [
      "The key slid under the door despite the measured gap",
      "The key was already inside before the door was shut",
      "The lock pulled the key through",
      "The key was delivered by the ceiling"
    ],
    "answer": 1,
    "fact": "The measured gap rules out sliding it beneath the door. Related principle: examine dust, powder and fibres and verify the route with physical tests."
  },
  {
    "id": "locked-room-115",
    "q": "Case 115 — A window is latched from inside, but a thin thread is caught in the latch. Which deduction is most strongly supported by these clues?",
    "options": [
      "The thread may have been used to pull the latch after the window was closed",
      "The thread proves the glass was broken",
      "The latch closes itself whenever it rains",
      "The thread could not have entered the room"
    ],
    "answer": 0,
    "fact": "A thread can operate a simple latch from outside if routed carefully. Related principle: examine dust, powder and fibres and verify the route with physical tests."
  },
  {
    "id": "locked-room-116",
    "q": "Case 116 — A room is sealed with a strip of paper across the door. The strip is intact, but a second doorway is found behind a curtain. What should the investigator conclude first?",
    "options": [
      "The person may have used the concealed second doorway",
      "The paper strip proves nobody entered by any route",
      "The person passed through the paper",
      "The curtain changed the room's dimensions"
    ],
    "answer": 0,
    "fact": "A seal only monitors the opening it covers. Related principle: examine dust, powder and fibres and verify the route with physical tests."
  },
  {
    "id": "locked-room-117",
    "q": "Case 117 — A locked cellar smells strongly of fresh paint, while the only paint tin is still sealed. Which possibility should be tested before declaring the room impossible?",
    "options": [
      "The smell proves the cellar has no exit",
      "The sealed tin created wet paint",
      "Paint smell can only come from outside",
      "The paint may have been applied before the tin was replaced or another source was used"
    ],
    "answer": 3,
    "fact": "A sealed tin does not rule out paint already applied or another container. Related principle: examine dust, powder and fibres and verify the route with physical tests."
  },
  {
    "id": "locked-room-118",
    "q": "Case 118 — A clock inside a locked room is five minutes slow; the hallway clock is accurate. Which answer explains the physical evidence without assuming anything supernatural?",
    "options": [
      "The hallway clock must have been altered",
      "The locked room changed time",
      "The room clock may not have been synchronized",
      "The slow clock proves the occupant left at a specific minute"
    ],
    "answer": 2,
    "fact": "A clock's offset alone does not establish when someone entered or left. Related principle: examine dust, powder and fibres and verify the route with physical tests."
  },
  {
    "id": "locked-room-119",
    "q": "Case 119 — A glass of water is full, but a circular wet mark sits beside it on a polished desk. Which detail most plausibly reveals the hidden route?",
    "options": [
      "The ring proves the glass was never touched",
      "The glass may have been moved after condensation or a spill left the ring",
      "The desk created water",
      "The glass must be leaking through its base"
    ],
    "answer": 1,
    "fact": "A ring can remain after a glass is moved. Related principle: examine dust, powder and fibres and verify the route with physical tests."
  },
  {
    "id": "locked-room-120",
    "q": "Case 120 — A locked room has a pile of fine plaster below a ceiling vent; the vent cover screws are freshly scratched. Which interpretation is consistent with the scene as described?",
    "options": [
      "The plaster proves the ceiling is solid",
      "The vent may have been loosened and used as an access route",
      "The screws scratched themselves",
      "The only route must be the locked door"
    ],
    "answer": 1,
    "fact": "Fresh tool marks and debris justify inspecting the vent. Related principle: examine dust, powder and fibres and verify the route with physical tests."
  },
  {
    "id": "locked-room-121",
    "q": "Case 121 — A room is locked from within, and a snow-covered sill outside has no footprints. How could the apparent impossibility be explained?",
    "options": [
      "The intruder may have entered before the snowfall",
      "The absence of prints proves nobody approached earlier",
      "Snow cannot hide footprints",
      "The intruder must have flown"
    ],
    "answer": 0,
    "fact": "Footprints may be covered by later snowfall; timing matters. Related principle: examine dust, powder and fibres and verify the route with physical tests."
  },
  {
    "id": "locked-room-122",
    "q": "Case 122 — A locked cabinet contains a damp envelope, but the cabinet's interior is dry. Which hypothesis deserves the closest examination?",
    "options": [
      "The cabinet must have leaked",
      "The envelope generated water",
      "The lock caused condensation on the paper",
      "The envelope may have been damp before it was placed inside"
    ],
    "answer": 3,
    "fact": "The dry interior suggests the envelope itself brought the moisture. Related principle: examine dust, powder and fibres and verify the route with physical tests."
  },
  {
    "id": "locked-room-123",
    "q": "Case 123 — A door bolt is found engaged, but its handle can be turned from outside with a narrow tool. Which conclusion avoids going beyond the available evidence?",
    "options": [
      "An engaged bolt makes every other method impossible",
      "The door opened by itself",
      "The bolt may have been manipulated through the gap or keyhole",
      "The handle's position proves who used it"
    ],
    "answer": 2,
    "fact": "A bolt's state does not rule out mechanical manipulation. Related principle: examine dust, powder and fibres and verify the route with physical tests."
  },
  {
    "id": "locked-room-124",
    "q": "Case 124 — A candle has burned down, but its wax trail stops at a closed window. The window ledge is dusty and undisturbed. Which explanation best accounts for the evidence?",
    "options": [
      "The candle vanished through the glass",
      "The wax proves the window was opened",
      "The candle was likely moved through the doorway before the room was sealed",
      "The room must have been cold"
    ],
    "answer": 2,
    "fact": "Wax on the floor can show the candle's path; undisturbed dust argues against using the window. Related principle: examine sealed letters and paper evidence and verify the route with physical tests."
  },
  {
    "id": "locked-room-125",
    "q": "Case 125 — A locked study contains wet footprints ending at a dry rug. No wet prints lead away. Which deduction is most strongly supported by these clues?",
    "options": [
      "The footprints were painted after the rug dried",
      "The person may have stepped onto the rug and removed wet footwear there",
      "The rug produced the water",
      "The person left through a wall"
    ],
    "answer": 1,
    "fact": "A dry rug can conceal later steps; inspect the rug and footwear before deciding. Related principle: examine sealed letters and paper evidence and verify the route with physical tests."
  },
  {
    "id": "locked-room-126",
    "q": "Case 126 — A key is found on the floor beneath a door whose gap is too narrow for the key to pass through. What should the investigator conclude first?",
    "options": [
      "The key was already inside before the door was shut",
      "The key slid under the door despite the measured gap",
      "The lock pulled the key through",
      "The key was delivered by the ceiling"
    ],
    "answer": 0,
    "fact": "The measured gap rules out sliding it beneath the door. Related principle: examine sealed letters and paper evidence and verify the route with physical tests."
  },
  {
    "id": "locked-room-127",
    "q": "Case 127 — A window is latched from inside, but a thin thread is caught in the latch. Which possibility should be tested before declaring the room impossible?",
    "options": [
      "The thread proves the glass was broken",
      "The latch closes itself whenever it rains",
      "The thread could not have entered the room",
      "The thread may have been used to pull the latch after the window was closed"
    ],
    "answer": 3,
    "fact": "A thread can operate a simple latch from outside if routed carefully. Related principle: examine sealed letters and paper evidence and verify the route with physical tests."
  },
  {
    "id": "locked-room-128",
    "q": "Case 128 — A room is sealed with a strip of paper across the door. The strip is intact, but a second doorway is found behind a curtain. Which answer explains the physical evidence without assuming anything supernatural?",
    "options": [
      "The paper strip proves nobody entered by any route",
      "The person passed through the paper",
      "The curtain changed the room's dimensions",
      "The person may have used the concealed second doorway"
    ],
    "answer": 3,
    "fact": "A seal only monitors the opening it covers. Related principle: examine sealed letters and paper evidence and verify the route with physical tests."
  },
  {
    "id": "locked-room-129",
    "q": "Case 129 — A locked cellar smells strongly of fresh paint, while the only paint tin is still sealed. Which detail most plausibly reveals the hidden route?",
    "options": [
      "The smell proves the cellar has no exit",
      "The sealed tin created wet paint",
      "The paint may have been applied before the tin was replaced or another source was used",
      "Paint smell can only come from outside"
    ],
    "answer": 2,
    "fact": "A sealed tin does not rule out paint already applied or another container. Related principle: examine sealed letters and paper evidence and verify the route with physical tests."
  },
  {
    "id": "locked-room-130",
    "q": "Case 130 — A clock inside a locked room is five minutes slow; the hallway clock is accurate. Which interpretation is consistent with the scene as described?",
    "options": [
      "The hallway clock must have been altered",
      "The room clock may not have been synchronized",
      "The locked room changed time",
      "The slow clock proves the occupant left at a specific minute"
    ],
    "answer": 1,
    "fact": "A clock's offset alone does not establish when someone entered or left. Related principle: examine sealed letters and paper evidence and verify the route with physical tests."
  },
  {
    "id": "locked-room-131",
    "q": "Case 131 — A glass of water is full, but a circular wet mark sits beside it on a polished desk. How could the apparent impossibility be explained?",
    "options": [
      "The glass may have been moved after condensation or a spill left the ring",
      "The ring proves the glass was never touched",
      "The desk created water",
      "The glass must be leaking through its base"
    ],
    "answer": 0,
    "fact": "A ring can remain after a glass is moved. Related principle: examine sealed letters and paper evidence and verify the route with physical tests."
  },
  {
    "id": "locked-room-132",
    "q": "Case 132 — A locked room has a pile of fine plaster below a ceiling vent; the vent cover screws are freshly scratched. Which hypothesis deserves the closest examination?",
    "options": [
      "The vent may have been loosened and used as an access route",
      "The plaster proves the ceiling is solid",
      "The screws scratched themselves",
      "The only route must be the locked door"
    ],
    "answer": 0,
    "fact": "Fresh tool marks and debris justify inspecting the vent. Related principle: examine sealed letters and paper evidence and verify the route with physical tests."
  },
  {
    "id": "locked-room-133",
    "q": "Case 133 — A room is locked from within, and a snow-covered sill outside has no footprints. Which conclusion avoids going beyond the available evidence?",
    "options": [
      "The absence of prints proves nobody approached earlier",
      "Snow cannot hide footprints",
      "The intruder must have flown",
      "The intruder may have entered before the snowfall"
    ],
    "answer": 3,
    "fact": "Footprints may be covered by later snowfall; timing matters. Related principle: examine sealed letters and paper evidence and verify the route with physical tests."
  },
  {
    "id": "locked-room-134",
    "q": "Case 134 — A locked cabinet contains a damp envelope, but the cabinet's interior is dry. Which explanation best accounts for the evidence?",
    "options": [
      "The cabinet must have leaked",
      "The envelope generated water",
      "The envelope may have been damp before it was placed inside",
      "The lock caused condensation on the paper"
    ],
    "answer": 2,
    "fact": "The dry interior suggests the envelope itself brought the moisture. Related principle: examine sealed letters and paper evidence and verify the route with physical tests."
  },
  {
    "id": "locked-room-135",
    "q": "Case 135 — A door bolt is found engaged, but its handle can be turned from outside with a narrow tool. Which deduction is most strongly supported by these clues?",
    "options": [
      "An engaged bolt makes every other method impossible",
      "The bolt may have been manipulated through the gap or keyhole",
      "The door opened by itself",
      "The handle's position proves who used it"
    ],
    "answer": 1,
    "fact": "A bolt's state does not rule out mechanical manipulation. Related principle: examine sealed letters and paper evidence and verify the route with physical tests."
  },
  {
    "id": "locked-room-136",
    "q": "Case 136 — A candle has burned down, but its wax trail stops at a closed window. The window ledge is dusty and undisturbed. What should the investigator conclude first?",
    "options": [
      "The candle vanished through the glass",
      "The candle was likely moved through the doorway before the room was sealed",
      "The wax proves the window was opened",
      "The room must have been cold"
    ],
    "answer": 1,
    "fact": "Wax on the floor can show the candle's path; undisturbed dust argues against using the window. Related principle: examine furniture and hidden compartments and verify the route with physical tests."
  },
  {
    "id": "locked-room-137",
    "q": "Case 137 — A locked study contains wet footprints ending at a dry rug. No wet prints lead away. Which possibility should be tested before declaring the room impossible?",
    "options": [
      "The person may have stepped onto the rug and removed wet footwear there",
      "The footprints were painted after the rug dried",
      "The rug produced the water",
      "The person left through a wall"
    ],
    "answer": 0,
    "fact": "A dry rug can conceal later steps; inspect the rug and footwear before deciding. Related principle: examine furniture and hidden compartments and verify the route with physical tests."
  },
  {
    "id": "locked-room-138",
    "q": "Case 138 — A key is found on the floor beneath a door whose gap is too narrow for the key to pass through. Which answer explains the physical evidence without assuming anything supernatural?",
    "options": [
      "The key slid under the door despite the measured gap",
      "The lock pulled the key through",
      "The key was delivered by the ceiling",
      "The key was already inside before the door was shut"
    ],
    "answer": 3,
    "fact": "The measured gap rules out sliding it beneath the door. Related principle: examine furniture and hidden compartments and verify the route with physical tests."
  },
  {
    "id": "locked-room-139",
    "q": "Case 139 — A window is latched from inside, but a thin thread is caught in the latch. Which detail most plausibly reveals the hidden route?",
    "options": [
      "The thread proves the glass was broken",
      "The latch closes itself whenever it rains",
      "The thread may have been used to pull the latch after the window was closed",
      "The thread could not have entered the room"
    ],
    "answer": 2,
    "fact": "A thread can operate a simple latch from outside if routed carefully. Related principle: examine furniture and hidden compartments and verify the route with physical tests."
  },
  {
    "id": "locked-room-140",
    "q": "Case 140 — A room is sealed with a strip of paper across the door. The strip is intact, but a second doorway is found behind a curtain. Which interpretation is consistent with the scene as described?",
    "options": [
      "The paper strip proves nobody entered by any route",
      "The person passed through the paper",
      "The person may have used the concealed second doorway",
      "The curtain changed the room's dimensions"
    ],
    "answer": 2,
    "fact": "A seal only monitors the opening it covers. Related principle: examine furniture and hidden compartments and verify the route with physical tests."
  },
  {
    "id": "locked-room-141",
    "q": "Case 141 — A locked cellar smells strongly of fresh paint, while the only paint tin is still sealed. How could the apparent impossibility be explained?",
    "options": [
      "The smell proves the cellar has no exit",
      "The paint may have been applied before the tin was replaced or another source was used",
      "The sealed tin created wet paint",
      "Paint smell can only come from outside"
    ],
    "answer": 1,
    "fact": "A sealed tin does not rule out paint already applied or another container. Related principle: examine furniture and hidden compartments and verify the route with physical tests."
  },
  {
    "id": "locked-room-142",
    "q": "Case 142 — A clock inside a locked room is five minutes slow; the hallway clock is accurate. Which hypothesis deserves the closest examination?",
    "options": [
      "The room clock may not have been synchronized",
      "The hallway clock must have been altered",
      "The locked room changed time",
      "The slow clock proves the occupant left at a specific minute"
    ],
    "answer": 0,
    "fact": "A clock's offset alone does not establish when someone entered or left. Related principle: examine furniture and hidden compartments and verify the route with physical tests."
  },
  {
    "id": "locked-room-143",
    "q": "Case 143 — A glass of water is full, but a circular wet mark sits beside it on a polished desk. Which conclusion avoids going beyond the available evidence?",
    "options": [
      "The ring proves the glass was never touched",
      "The desk created water",
      "The glass must be leaking through its base",
      "The glass may have been moved after condensation or a spill left the ring"
    ],
    "answer": 3,
    "fact": "A ring can remain after a glass is moved. Related principle: examine furniture and hidden compartments and verify the route with physical tests."
  },
  {
    "id": "locked-room-144",
    "q": "Case 144 — A locked room has a pile of fine plaster below a ceiling vent; the vent cover screws are freshly scratched. Which explanation best accounts for the evidence?",
    "options": [
      "The plaster proves the ceiling is solid",
      "The screws scratched themselves",
      "The only route must be the locked door",
      "The vent may have been loosened and used as an access route"
    ],
    "answer": 3,
    "fact": "Fresh tool marks and debris justify inspecting the vent. Related principle: examine furniture and hidden compartments and verify the route with physical tests."
  },
  {
    "id": "locked-room-145",
    "q": "Case 145 — A room is locked from within, and a snow-covered sill outside has no footprints. Which deduction is most strongly supported by these clues?",
    "options": [
      "The absence of prints proves nobody approached earlier",
      "Snow cannot hide footprints",
      "The intruder may have entered before the snowfall",
      "The intruder must have flown"
    ],
    "answer": 2,
    "fact": "Footprints may be covered by later snowfall; timing matters. Related principle: examine furniture and hidden compartments and verify the route with physical tests."
  },
  {
    "id": "locked-room-146",
    "q": "Case 146 — A locked cabinet contains a damp envelope, but the cabinet's interior is dry. What should the investigator conclude first?",
    "options": [
      "The cabinet must have leaked",
      "The envelope may have been damp before it was placed inside",
      "The envelope generated water",
      "The lock caused condensation on the paper"
    ],
    "answer": 1,
    "fact": "The dry interior suggests the envelope itself brought the moisture. Related principle: examine furniture and hidden compartments and verify the route with physical tests."
  },
  {
    "id": "locked-room-147",
    "q": "Case 147 — A door bolt is found engaged, but its handle can be turned from outside with a narrow tool. Which possibility should be tested before declaring the room impossible?",
    "options": [
      "The bolt may have been manipulated through the gap or keyhole",
      "An engaged bolt makes every other method impossible",
      "The door opened by itself",
      "The handle's position proves who used it"
    ],
    "answer": 0,
    "fact": "A bolt's state does not rule out mechanical manipulation. Related principle: examine furniture and hidden compartments and verify the route with physical tests."
  },
  {
    "id": "locked-room-148",
    "q": "Case 148 — A candle has burned down, but its wax trail stops at a closed window. The window ledge is dusty and undisturbed. Which answer explains the physical evidence without assuming anything supernatural?",
    "options": [
      "The candle was likely moved through the doorway before the room was sealed",
      "The candle vanished through the glass",
      "The wax proves the window was opened",
      "The room must have been cold"
    ],
    "answer": 0,
    "fact": "Wax on the floor can show the candle's path; undisturbed dust argues against using the window. Related principle: examine sound and acoustic clues and verify the route with physical tests."
  },
  {
    "id": "locked-room-149",
    "q": "Case 149 — A locked study contains wet footprints ending at a dry rug. No wet prints lead away. Which detail most plausibly reveals the hidden route?",
    "options": [
      "The footprints were painted after the rug dried",
      "The rug produced the water",
      "The person left through a wall",
      "The person may have stepped onto the rug and removed wet footwear there"
    ],
    "answer": 3,
    "fact": "A dry rug can conceal later steps; inspect the rug and footwear before deciding. Related principle: examine sound and acoustic clues and verify the route with physical tests."
  },
  {
    "id": "locked-room-150",
    "q": "Case 150 — A key is found on the floor beneath a door whose gap is too narrow for the key to pass through. Which interpretation is consistent with the scene as described?",
    "options": [
      "The key slid under the door despite the measured gap",
      "The lock pulled the key through",
      "The key was already inside before the door was shut",
      "The key was delivered by the ceiling"
    ],
    "answer": 2,
    "fact": "The measured gap rules out sliding it beneath the door. Related principle: examine sound and acoustic clues and verify the route with physical tests."
  },
  {
    "id": "locked-room-151",
    "q": "Case 151 — A window is latched from inside, but a thin thread is caught in the latch. How could the apparent impossibility be explained?",
    "options": [
      "The thread proves the glass was broken",
      "The thread may have been used to pull the latch after the window was closed",
      "The latch closes itself whenever it rains",
      "The thread could not have entered the room"
    ],
    "answer": 1,
    "fact": "A thread can operate a simple latch from outside if routed carefully. Related principle: examine sound and acoustic clues and verify the route with physical tests."
  },
  {
    "id": "locked-room-152",
    "q": "Case 152 — A room is sealed with a strip of paper across the door. The strip is intact, but a second doorway is found behind a curtain. Which hypothesis deserves the closest examination?",
    "options": [
      "The paper strip proves nobody entered by any route",
      "The person may have used the concealed second doorway",
      "The person passed through the paper",
      "The curtain changed the room's dimensions"
    ],
    "answer": 1,
    "fact": "A seal only monitors the opening it covers. Related principle: examine sound and acoustic clues and verify the route with physical tests."
  },
  {
    "id": "locked-room-153",
    "q": "Case 153 — A locked cellar smells strongly of fresh paint, while the only paint tin is still sealed. Which conclusion avoids going beyond the available evidence?",
    "options": [
      "The paint may have been applied before the tin was replaced or another source was used",
      "The smell proves the cellar has no exit",
      "The sealed tin created wet paint",
      "Paint smell can only come from outside"
    ],
    "answer": 0,
    "fact": "A sealed tin does not rule out paint already applied or another container. Related principle: examine sound and acoustic clues and verify the route with physical tests."
  },
  {
    "id": "locked-room-154",
    "q": "Case 154 — A clock inside a locked room is five minutes slow; the hallway clock is accurate. Which explanation best accounts for the evidence?",
    "options": [
      "The hallway clock must have been altered",
      "The locked room changed time",
      "The slow clock proves the occupant left at a specific minute",
      "The room clock may not have been synchronized"
    ],
    "answer": 3,
    "fact": "A clock's offset alone does not establish when someone entered or left. Related principle: examine sound and acoustic clues and verify the route with physical tests."
  },
  {
    "id": "locked-room-155",
    "q": "Case 155 — A glass of water is full, but a circular wet mark sits beside it on a polished desk. Which deduction is most strongly supported by these clues?",
    "options": [
      "The ring proves the glass was never touched",
      "The desk created water",
      "The glass may have been moved after condensation or a spill left the ring",
      "The glass must be leaking through its base"
    ],
    "answer": 2,
    "fact": "A ring can remain after a glass is moved. Related principle: examine sound and acoustic clues and verify the route with physical tests."
  },
  {
    "id": "locked-room-156",
    "q": "Case 156 — A locked room has a pile of fine plaster below a ceiling vent; the vent cover screws are freshly scratched. What should the investigator conclude first?",
    "options": [
      "The plaster proves the ceiling is solid",
      "The screws scratched themselves",
      "The vent may have been loosened and used as an access route",
      "The only route must be the locked door"
    ],
    "answer": 2,
    "fact": "Fresh tool marks and debris justify inspecting the vent. Related principle: examine sound and acoustic clues and verify the route with physical tests."
  },
  {
    "id": "locked-room-157",
    "q": "Case 157 — A room is locked from within, and a snow-covered sill outside has no footprints. Which possibility should be tested before declaring the room impossible?",
    "options": [
      "The absence of prints proves nobody approached earlier",
      "The intruder may have entered before the snowfall",
      "Snow cannot hide footprints",
      "The intruder must have flown"
    ],
    "answer": 1,
    "fact": "Footprints may be covered by later snowfall; timing matters. Related principle: examine sound and acoustic clues and verify the route with physical tests."
  },
  {
    "id": "locked-room-158",
    "q": "Case 158 — A locked cabinet contains a damp envelope, but the cabinet's interior is dry. Which answer explains the physical evidence without assuming anything supernatural?",
    "options": [
      "The envelope may have been damp before it was placed inside",
      "The cabinet must have leaked",
      "The envelope generated water",
      "The lock caused condensation on the paper"
    ],
    "answer": 0,
    "fact": "The dry interior suggests the envelope itself brought the moisture. Related principle: examine sound and acoustic clues and verify the route with physical tests."
  },
  {
    "id": "locked-room-159",
    "q": "Case 159 — A door bolt is found engaged, but its handle can be turned from outside with a narrow tool. Which detail most plausibly reveals the hidden route?",
    "options": [
      "An engaged bolt makes every other method impossible",
      "The door opened by itself",
      "The handle's position proves who used it",
      "The bolt may have been manipulated through the gap or keyhole"
    ],
    "answer": 3,
    "fact": "A bolt's state does not rule out mechanical manipulation. Related principle: examine sound and acoustic clues and verify the route with physical tests."
  },
  {
    "id": "locked-room-160",
    "q": "Case 160 — A candle has burned down, but its wax trail stops at a closed window. The window ledge is dusty and undisturbed. Which interpretation is consistent with the scene as described?",
    "options": [
      "The candle vanished through the glass",
      "The wax proves the window was opened",
      "The room must have been cold",
      "The candle was likely moved through the doorway before the room was sealed"
    ],
    "answer": 3,
    "fact": "Wax on the floor can show the candle's path; undisturbed dust argues against using the window. Related principle: examine smoke and airflow and verify the route with physical tests."
  },
  {
    "id": "locked-room-161",
    "q": "Case 161 — A locked study contains wet footprints ending at a dry rug. No wet prints lead away. How could the apparent impossibility be explained?",
    "options": [
      "The footprints were painted after the rug dried",
      "The rug produced the water",
      "The person may have stepped onto the rug and removed wet footwear there",
      "The person left through a wall"
    ],
    "answer": 2,
    "fact": "A dry rug can conceal later steps; inspect the rug and footwear before deciding. Related principle: examine smoke and airflow and verify the route with physical tests."
  },
  {
    "id": "locked-room-162",
    "q": "Case 162 — A key is found on the floor beneath a door whose gap is too narrow for the key to pass through. Which hypothesis deserves the closest examination?",
    "options": [
      "The key slid under the door despite the measured gap",
      "The key was already inside before the door was shut",
      "The lock pulled the key through",
      "The key was delivered by the ceiling"
    ],
    "answer": 1,
    "fact": "The measured gap rules out sliding it beneath the door. Related principle: examine smoke and airflow and verify the route with physical tests."
  },
  {
    "id": "locked-room-163",
    "q": "Case 163 — A window is latched from inside, but a thin thread is caught in the latch. Which conclusion avoids going beyond the available evidence?",
    "options": [
      "The thread may have been used to pull the latch after the window was closed",
      "The thread proves the glass was broken",
      "The latch closes itself whenever it rains",
      "The thread could not have entered the room"
    ],
    "answer": 0,
    "fact": "A thread can operate a simple latch from outside if routed carefully. Related principle: examine smoke and airflow and verify the route with physical tests."
  },
  {
    "id": "locked-room-164",
    "q": "Case 164 — A room is sealed with a strip of paper across the door. The strip is intact, but a second doorway is found behind a curtain. Which explanation best accounts for the evidence?",
    "options": [
      "The person may have used the concealed second doorway",
      "The paper strip proves nobody entered by any route",
      "The person passed through the paper",
      "The curtain changed the room's dimensions"
    ],
    "answer": 0,
    "fact": "A seal only monitors the opening it covers. Related principle: examine smoke and airflow and verify the route with physical tests."
  },
  {
    "id": "locked-room-165",
    "q": "Case 165 — A locked cellar smells strongly of fresh paint, while the only paint tin is still sealed. Which deduction is most strongly supported by these clues?",
    "options": [
      "The smell proves the cellar has no exit",
      "The sealed tin created wet paint",
      "Paint smell can only come from outside",
      "The paint may have been applied before the tin was replaced or another source was used"
    ],
    "answer": 3,
    "fact": "A sealed tin does not rule out paint already applied or another container. Related principle: examine smoke and airflow and verify the route with physical tests."
  },
  {
    "id": "locked-room-166",
    "q": "Case 166 — A clock inside a locked room is five minutes slow; the hallway clock is accurate. What should the investigator conclude first?",
    "options": [
      "The hallway clock must have been altered",
      "The locked room changed time",
      "The room clock may not have been synchronized",
      "The slow clock proves the occupant left at a specific minute"
    ],
    "answer": 2,
    "fact": "A clock's offset alone does not establish when someone entered or left. Related principle: examine smoke and airflow and verify the route with physical tests."
  },
  {
    "id": "locked-room-167",
    "q": "Case 167 — A glass of water is full, but a circular wet mark sits beside it on a polished desk. Which possibility should be tested before declaring the room impossible?",
    "options": [
      "The ring proves the glass was never touched",
      "The glass may have been moved after condensation or a spill left the ring",
      "The desk created water",
      "The glass must be leaking through its base"
    ],
    "answer": 1,
    "fact": "A ring can remain after a glass is moved. Related principle: examine smoke and airflow and verify the route with physical tests."
  },
  {
    "id": "locked-room-168",
    "q": "Case 168 — A locked room has a pile of fine plaster below a ceiling vent; the vent cover screws are freshly scratched. Which answer explains the physical evidence without assuming anything supernatural?",
    "options": [
      "The plaster proves the ceiling is solid",
      "The vent may have been loosened and used as an access route",
      "The screws scratched themselves",
      "The only route must be the locked door"
    ],
    "answer": 1,
    "fact": "Fresh tool marks and debris justify inspecting the vent. Related principle: examine smoke and airflow and verify the route with physical tests."
  },
  {
    "id": "locked-room-169",
    "q": "Case 169 — A room is locked from within, and a snow-covered sill outside has no footprints. Which detail most plausibly reveals the hidden route?",
    "options": [
      "The intruder may have entered before the snowfall",
      "The absence of prints proves nobody approached earlier",
      "Snow cannot hide footprints",
      "The intruder must have flown"
    ],
    "answer": 0,
    "fact": "Footprints may be covered by later snowfall; timing matters. Related principle: examine smoke and airflow and verify the route with physical tests."
  },
  {
    "id": "locked-room-170",
    "q": "Case 170 — A locked cabinet contains a damp envelope, but the cabinet's interior is dry. Which interpretation is consistent with the scene as described?",
    "options": [
      "The cabinet must have leaked",
      "The envelope generated water",
      "The lock caused condensation on the paper",
      "The envelope may have been damp before it was placed inside"
    ],
    "answer": 3,
    "fact": "The dry interior suggests the envelope itself brought the moisture. Related principle: examine smoke and airflow and verify the route with physical tests."
  },
  {
    "id": "locked-room-171",
    "q": "Case 171 — A door bolt is found engaged, but its handle can be turned from outside with a narrow tool. How could the apparent impossibility be explained?",
    "options": [
      "An engaged bolt makes every other method impossible",
      "The door opened by itself",
      "The bolt may have been manipulated through the gap or keyhole",
      "The handle's position proves who used it"
    ],
    "answer": 2,
    "fact": "A bolt's state does not rule out mechanical manipulation. Related principle: examine smoke and airflow and verify the route with physical tests."
  },
  {
    "id": "locked-room-172",
    "q": "Case 172 — A candle has burned down, but its wax trail stops at a closed window. The window ledge is dusty and undisturbed. Which hypothesis deserves the closest examination?",
    "options": [
      "The candle vanished through the glass",
      "The wax proves the window was opened",
      "The candle was likely moved through the doorway before the room was sealed",
      "The room must have been cold"
    ],
    "answer": 2,
    "fact": "Wax on the floor can show the candle's path; undisturbed dust argues against using the window. Related principle: examine rope, thread and simple mechanisms and verify the route with physical tests."
  },
  {
    "id": "locked-room-173",
    "q": "Case 173 — A locked study contains wet footprints ending at a dry rug. No wet prints lead away. Which conclusion avoids going beyond the available evidence?",
    "options": [
      "The footprints were painted after the rug dried",
      "The person may have stepped onto the rug and removed wet footwear there",
      "The rug produced the water",
      "The person left through a wall"
    ],
    "answer": 1,
    "fact": "A dry rug can conceal later steps; inspect the rug and footwear before deciding. Related principle: examine rope, thread and simple mechanisms and verify the route with physical tests."
  },
  {
    "id": "locked-room-174",
    "q": "Case 174 — A key is found on the floor beneath a door whose gap is too narrow for the key to pass through. Which explanation best accounts for the evidence?",
    "options": [
      "The key was already inside before the door was shut",
      "The key slid under the door despite the measured gap",
      "The lock pulled the key through",
      "The key was delivered by the ceiling"
    ],
    "answer": 0,
    "fact": "The measured gap rules out sliding it beneath the door. Related principle: examine rope, thread and simple mechanisms and verify the route with physical tests."
  },
  {
    "id": "locked-room-175",
    "q": "Case 175 — A window is latched from inside, but a thin thread is caught in the latch. Which deduction is most strongly supported by these clues?",
    "options": [
      "The thread proves the glass was broken",
      "The latch closes itself whenever it rains",
      "The thread could not have entered the room",
      "The thread may have been used to pull the latch after the window was closed"
    ],
    "answer": 3,
    "fact": "A thread can operate a simple latch from outside if routed carefully. Related principle: examine rope, thread and simple mechanisms and verify the route with physical tests."
  },
  {
    "id": "locked-room-176",
    "q": "Case 176 — A room is sealed with a strip of paper across the door. The strip is intact, but a second doorway is found behind a curtain. What should the investigator conclude first?",
    "options": [
      "The paper strip proves nobody entered by any route",
      "The person passed through the paper",
      "The curtain changed the room's dimensions",
      "The person may have used the concealed second doorway"
    ],
    "answer": 3,
    "fact": "A seal only monitors the opening it covers. Related principle: examine rope, thread and simple mechanisms and verify the route with physical tests."
  },
  {
    "id": "locked-room-177",
    "q": "Case 177 — A locked cellar smells strongly of fresh paint, while the only paint tin is still sealed. Which possibility should be tested before declaring the room impossible?",
    "options": [
      "The smell proves the cellar has no exit",
      "The sealed tin created wet paint",
      "The paint may have been applied before the tin was replaced or another source was used",
      "Paint smell can only come from outside"
    ],
    "answer": 2,
    "fact": "A sealed tin does not rule out paint already applied or another container. Related principle: examine rope, thread and simple mechanisms and verify the route with physical tests."
  },
  {
    "id": "locked-room-178",
    "q": "Case 178 — A clock inside a locked room is five minutes slow; the hallway clock is accurate. Which answer explains the physical evidence without assuming anything supernatural?",
    "options": [
      "The hallway clock must have been altered",
      "The room clock may not have been synchronized",
      "The locked room changed time",
      "The slow clock proves the occupant left at a specific minute"
    ],
    "answer": 1,
    "fact": "A clock's offset alone does not establish when someone entered or left. Related principle: examine rope, thread and simple mechanisms and verify the route with physical tests."
  },
  {
    "id": "locked-room-179",
    "q": "Case 179 — A glass of water is full, but a circular wet mark sits beside it on a polished desk. Which detail most plausibly reveals the hidden route?",
    "options": [
      "The glass may have been moved after condensation or a spill left the ring",
      "The ring proves the glass was never touched",
      "The desk created water",
      "The glass must be leaking through its base"
    ],
    "answer": 0,
    "fact": "A ring can remain after a glass is moved. Related principle: examine rope, thread and simple mechanisms and verify the route with physical tests."
  },
  {
    "id": "locked-room-180",
    "q": "Case 180 — A locked room has a pile of fine plaster below a ceiling vent; the vent cover screws are freshly scratched. Which interpretation is consistent with the scene as described?",
    "options": [
      "The vent may have been loosened and used as an access route",
      "The plaster proves the ceiling is solid",
      "The screws scratched themselves",
      "The only route must be the locked door"
    ],
    "answer": 0,
    "fact": "Fresh tool marks and debris justify inspecting the vent. Related principle: examine rope, thread and simple mechanisms and verify the route with physical tests."
  },
  {
    "id": "locked-room-181",
    "q": "Case 181 — A room is locked from within, and a snow-covered sill outside has no footprints. How could the apparent impossibility be explained?",
    "options": [
      "The absence of prints proves nobody approached earlier",
      "Snow cannot hide footprints",
      "The intruder must have flown",
      "The intruder may have entered before the snowfall"
    ],
    "answer": 3,
    "fact": "Footprints may be covered by later snowfall; timing matters. Related principle: examine rope, thread and simple mechanisms and verify the route with physical tests."
  },
  {
    "id": "locked-room-182",
    "q": "Case 182 — A locked cabinet contains a damp envelope, but the cabinet's interior is dry. Which hypothesis deserves the closest examination?",
    "options": [
      "The cabinet must have leaked",
      "The envelope generated water",
      "The envelope may have been damp before it was placed inside",
      "The lock caused condensation on the paper"
    ],
    "answer": 2,
    "fact": "The dry interior suggests the envelope itself brought the moisture. Related principle: examine rope, thread and simple mechanisms and verify the route with physical tests."
  },
  {
    "id": "locked-room-183",
    "q": "Case 183 — A door bolt is found engaged, but its handle can be turned from outside with a narrow tool. Which conclusion avoids going beyond the available evidence?",
    "options": [
      "An engaged bolt makes every other method impossible",
      "The bolt may have been manipulated through the gap or keyhole",
      "The door opened by itself",
      "The handle's position proves who used it"
    ],
    "answer": 1,
    "fact": "A bolt's state does not rule out mechanical manipulation. Related principle: examine rope, thread and simple mechanisms and verify the route with physical tests."
  },
  {
    "id": "locked-room-184",
    "q": "Case 184 — A candle has burned down, but its wax trail stops at a closed window. The window ledge is dusty and undisturbed. Which explanation best accounts for the evidence?",
    "options": [
      "The candle vanished through the glass",
      "The candle was likely moved through the doorway before the room was sealed",
      "The wax proves the window was opened",
      "The room must have been cold"
    ],
    "answer": 1,
    "fact": "Wax on the floor can show the candle's path; undisturbed dust argues against using the window. Related principle: examine staircases and alternate passages and verify the route with physical tests."
  },
  {
    "id": "locked-room-185",
    "q": "Case 185 — A locked study contains wet footprints ending at a dry rug. No wet prints lead away. Which deduction is most strongly supported by these clues?",
    "options": [
      "The person may have stepped onto the rug and removed wet footwear there",
      "The footprints were painted after the rug dried",
      "The rug produced the water",
      "The person left through a wall"
    ],
    "answer": 0,
    "fact": "A dry rug can conceal later steps; inspect the rug and footwear before deciding. Related principle: examine staircases and alternate passages and verify the route with physical tests."
  },
  {
    "id": "locked-room-186",
    "q": "Case 186 — A key is found on the floor beneath a door whose gap is too narrow for the key to pass through. What should the investigator conclude first?",
    "options": [
      "The key slid under the door despite the measured gap",
      "The lock pulled the key through",
      "The key was delivered by the ceiling",
      "The key was already inside before the door was shut"
    ],
    "answer": 3,
    "fact": "The measured gap rules out sliding it beneath the door. Related principle: examine staircases and alternate passages and verify the route with physical tests."
  },
  {
    "id": "locked-room-187",
    "q": "Case 187 — A window is latched from inside, but a thin thread is caught in the latch. Which possibility should be tested before declaring the room impossible?",
    "options": [
      "The thread proves the glass was broken",
      "The latch closes itself whenever it rains",
      "The thread may have been used to pull the latch after the window was closed",
      "The thread could not have entered the room"
    ],
    "answer": 2,
    "fact": "A thread can operate a simple latch from outside if routed carefully. Related principle: examine staircases and alternate passages and verify the route with physical tests."
  },
  {
    "id": "locked-room-188",
    "q": "Case 188 — A room is sealed with a strip of paper across the door. The strip is intact, but a second doorway is found behind a curtain. Which answer explains the physical evidence without assuming anything supernatural?",
    "options": [
      "The paper strip proves nobody entered by any route",
      "The person passed through the paper",
      "The person may have used the concealed second doorway",
      "The curtain changed the room's dimensions"
    ],
    "answer": 2,
    "fact": "A seal only monitors the opening it covers. Related principle: examine staircases and alternate passages and verify the route with physical tests."
  },
  {
    "id": "locked-room-189",
    "q": "Case 189 — A locked cellar smells strongly of fresh paint, while the only paint tin is still sealed. Which detail most plausibly reveals the hidden route?",
    "options": [
      "The smell proves the cellar has no exit",
      "The paint may have been applied before the tin was replaced or another source was used",
      "The sealed tin created wet paint",
      "Paint smell can only come from outside"
    ],
    "answer": 1,
    "fact": "A sealed tin does not rule out paint already applied or another container. Related principle: examine staircases and alternate passages and verify the route with physical tests."
  },
  {
    "id": "locked-room-190",
    "q": "Case 190 — A clock inside a locked room is five minutes slow; the hallway clock is accurate. Which interpretation is consistent with the scene as described?",
    "options": [
      "The room clock may not have been synchronized",
      "The hallway clock must have been altered",
      "The locked room changed time",
      "The slow clock proves the occupant left at a specific minute"
    ],
    "answer": 0,
    "fact": "A clock's offset alone does not establish when someone entered or left. Related principle: examine staircases and alternate passages and verify the route with physical tests."
  },
  {
    "id": "locked-room-191",
    "q": "Case 191 — A glass of water is full, but a circular wet mark sits beside it on a polished desk. How could the apparent impossibility be explained?",
    "options": [
      "The ring proves the glass was never touched",
      "The desk created water",
      "The glass must be leaking through its base",
      "The glass may have been moved after condensation or a spill left the ring"
    ],
    "answer": 3,
    "fact": "A ring can remain after a glass is moved. Related principle: examine staircases and alternate passages and verify the route with physical tests."
  },
  {
    "id": "locked-room-192",
    "q": "Case 192 — A locked room has a pile of fine plaster below a ceiling vent; the vent cover screws are freshly scratched. Which hypothesis deserves the closest examination?",
    "options": [
      "The plaster proves the ceiling is solid",
      "The screws scratched themselves",
      "The only route must be the locked door",
      "The vent may have been loosened and used as an access route"
    ],
    "answer": 3,
    "fact": "Fresh tool marks and debris justify inspecting the vent. Related principle: examine staircases and alternate passages and verify the route with physical tests."
  },
  {
    "id": "locked-room-193",
    "q": "Case 193 — A room is locked from within, and a snow-covered sill outside has no footprints. Which conclusion avoids going beyond the available evidence?",
    "options": [
      "The absence of prints proves nobody approached earlier",
      "Snow cannot hide footprints",
      "The intruder may have entered before the snowfall",
      "The intruder must have flown"
    ],
    "answer": 2,
    "fact": "Footprints may be covered by later snowfall; timing matters. Related principle: examine staircases and alternate passages and verify the route with physical tests."
  },
  {
    "id": "locked-room-194",
    "q": "Case 194 — A locked cabinet contains a damp envelope, but the cabinet's interior is dry. Which explanation best accounts for the evidence?",
    "options": [
      "The cabinet must have leaked",
      "The envelope may have been damp before it was placed inside",
      "The envelope generated water",
      "The lock caused condensation on the paper"
    ],
    "answer": 1,
    "fact": "The dry interior suggests the envelope itself brought the moisture. Related principle: examine staircases and alternate passages and verify the route with physical tests."
  },
  {
    "id": "locked-room-195",
    "q": "Case 195 — A door bolt is found engaged, but its handle can be turned from outside with a narrow tool. Which deduction is most strongly supported by these clues?",
    "options": [
      "The bolt may have been manipulated through the gap or keyhole",
      "An engaged bolt makes every other method impossible",
      "The door opened by itself",
      "The handle's position proves who used it"
    ],
    "answer": 0,
    "fact": "A bolt's state does not rule out mechanical manipulation. Related principle: examine staircases and alternate passages and verify the route with physical tests."
  },
  {
    "id": "locked-room-196",
    "q": "Case 196 — A candle has burned down, but its wax trail stops at a closed window. The window ledge is dusty and undisturbed. What should the investigator conclude first?",
    "options": [
      "The candle was likely moved through the doorway before the room was sealed",
      "The candle vanished through the glass",
      "The wax proves the window was opened",
      "The room must have been cold"
    ],
    "answer": 0,
    "fact": "Wax on the floor can show the candle's path; undisturbed dust argues against using the window. Related principle: examine glass, cracks and reflections and verify the route with physical tests."
  },
  {
    "id": "locked-room-197",
    "q": "Case 197 — A locked study contains wet footprints ending at a dry rug. No wet prints lead away. Which possibility should be tested before declaring the room impossible?",
    "options": [
      "The footprints were painted after the rug dried",
      "The rug produced the water",
      "The person left through a wall",
      "The person may have stepped onto the rug and removed wet footwear there"
    ],
    "answer": 3,
    "fact": "A dry rug can conceal later steps; inspect the rug and footwear before deciding. Related principle: examine glass, cracks and reflections and verify the route with physical tests."
  },
  {
    "id": "locked-room-198",
    "q": "Case 198 — A key is found on the floor beneath a door whose gap is too narrow for the key to pass through. Which answer explains the physical evidence without assuming anything supernatural?",
    "options": [
      "The key slid under the door despite the measured gap",
      "The lock pulled the key through",
      "The key was already inside before the door was shut",
      "The key was delivered by the ceiling"
    ],
    "answer": 2,
    "fact": "The measured gap rules out sliding it beneath the door. Related principle: examine glass, cracks and reflections and verify the route with physical tests."
  },
  {
    "id": "locked-room-199",
    "q": "Case 199 — A window is latched from inside, but a thin thread is caught in the latch. Which detail most plausibly reveals the hidden route?",
    "options": [
      "The thread proves the glass was broken",
      "The thread may have been used to pull the latch after the window was closed",
      "The latch closes itself whenever it rains",
      "The thread could not have entered the room"
    ],
    "answer": 1,
    "fact": "A thread can operate a simple latch from outside if routed carefully. Related principle: examine glass, cracks and reflections and verify the route with physical tests."
  },
  {
    "id": "locked-room-200",
    "q": "Case 200 — A room is sealed with a strip of paper across the door. The strip is intact, but a second doorway is found behind a curtain. Which interpretation is consistent with the scene as described?",
    "options": [
      "The paper strip proves nobody entered by any route",
      "The person may have used the concealed second doorway",
      "The person passed through the paper",
      "The curtain changed the room's dimensions"
    ],
    "answer": 1,
    "fact": "A seal only monitors the opening it covers. Related principle: examine glass, cracks and reflections and verify the route with physical tests."
  },
  {
    "id": "locked-room-201",
    "q": "Case 201 — A locked cellar smells strongly of fresh paint, while the only paint tin is still sealed. How could the apparent impossibility be explained?",
    "options": [
      "The paint may have been applied before the tin was replaced or another source was used",
      "The smell proves the cellar has no exit",
      "The sealed tin created wet paint",
      "Paint smell can only come from outside"
    ],
    "answer": 0,
    "fact": "A sealed tin does not rule out paint already applied or another container. Related principle: examine glass, cracks and reflections and verify the route with physical tests."
  },
  {
    "id": "locked-room-202",
    "q": "Case 202 — A clock inside a locked room is five minutes slow; the hallway clock is accurate. Which hypothesis deserves the closest examination?",
    "options": [
      "The hallway clock must have been altered",
      "The locked room changed time",
      "The slow clock proves the occupant left at a specific minute",
      "The room clock may not have been synchronized"
    ],
    "answer": 3,
    "fact": "A clock's offset alone does not establish when someone entered or left. Related principle: examine glass, cracks and reflections and verify the route with physical tests."
  },
  {
    "id": "locked-room-203",
    "q": "Case 203 — A glass of water is full, but a circular wet mark sits beside it on a polished desk. Which conclusion avoids going beyond the available evidence?",
    "options": [
      "The ring proves the glass was never touched",
      "The desk created water",
      "The glass may have been moved after condensation or a spill left the ring",
      "The glass must be leaking through its base"
    ],
    "answer": 2,
    "fact": "A ring can remain after a glass is moved. Related principle: examine glass, cracks and reflections and verify the route with physical tests."
  },
  {
    "id": "locked-room-204",
    "q": "Case 204 — A locked room has a pile of fine plaster below a ceiling vent; the vent cover screws are freshly scratched. Which explanation best accounts for the evidence?",
    "options": [
      "The plaster proves the ceiling is solid",
      "The screws scratched themselves",
      "The vent may have been loosened and used as an access route",
      "The only route must be the locked door"
    ],
    "answer": 2,
    "fact": "Fresh tool marks and debris justify inspecting the vent. Related principle: examine glass, cracks and reflections and verify the route with physical tests."
  },
  {
    "id": "locked-room-205",
    "q": "Case 205 — A room is locked from within, and a snow-covered sill outside has no footprints. Which deduction is most strongly supported by these clues?",
    "options": [
      "The absence of prints proves nobody approached earlier",
      "The intruder may have entered before the snowfall",
      "Snow cannot hide footprints",
      "The intruder must have flown"
    ],
    "answer": 1,
    "fact": "Footprints may be covered by later snowfall; timing matters. Related principle: examine glass, cracks and reflections and verify the route with physical tests."
  },
  {
    "id": "locked-room-206",
    "q": "Case 206 — A locked cabinet contains a damp envelope, but the cabinet's interior is dry. What should the investigator conclude first?",
    "options": [
      "The envelope may have been damp before it was placed inside",
      "The cabinet must have leaked",
      "The envelope generated water",
      "The lock caused condensation on the paper"
    ],
    "answer": 0,
    "fact": "The dry interior suggests the envelope itself brought the moisture. Related principle: examine glass, cracks and reflections and verify the route with physical tests."
  },
  {
    "id": "locked-room-207",
    "q": "Case 207 — A door bolt is found engaged, but its handle can be turned from outside with a narrow tool. Which possibility should be tested before declaring the room impossible?",
    "options": [
      "An engaged bolt makes every other method impossible",
      "The door opened by itself",
      "The handle's position proves who used it",
      "The bolt may have been manipulated through the gap or keyhole"
    ],
    "answer": 3,
    "fact": "A bolt's state does not rule out mechanical manipulation. Related principle: examine glass, cracks and reflections and verify the route with physical tests."
  },
  {
    "id": "locked-room-208",
    "q": "Case 208 — A candle has burned down, but its wax trail stops at a closed window. The window ledge is dusty and undisturbed. Which answer explains the physical evidence without assuming anything supernatural?",
    "options": [
      "The candle vanished through the glass",
      "The wax proves the window was opened",
      "The room must have been cold",
      "The candle was likely moved through the doorway before the room was sealed"
    ],
    "answer": 3,
    "fact": "Wax on the floor can show the candle's path; undisturbed dust argues against using the window. Related principle: examine door bolts and latches and verify the route with physical tests."
  },
  {
    "id": "locked-room-209",
    "q": "Case 209 — A locked study contains wet footprints ending at a dry rug. No wet prints lead away. Which detail most plausibly reveals the hidden route?",
    "options": [
      "The footprints were painted after the rug dried",
      "The rug produced the water",
      "The person may have stepped onto the rug and removed wet footwear there",
      "The person left through a wall"
    ],
    "answer": 2,
    "fact": "A dry rug can conceal later steps; inspect the rug and footwear before deciding. Related principle: examine door bolts and latches and verify the route with physical tests."
  },
  {
    "id": "locked-room-210",
    "q": "Case 210 — A key is found on the floor beneath a door whose gap is too narrow for the key to pass through. Which interpretation is consistent with the scene as described?",
    "options": [
      "The key slid under the door despite the measured gap",
      "The key was already inside before the door was shut",
      "The lock pulled the key through",
      "The key was delivered by the ceiling"
    ],
    "answer": 1,
    "fact": "The measured gap rules out sliding it beneath the door. Related principle: examine door bolts and latches and verify the route with physical tests."
  },
  {
    "id": "locked-room-211",
    "q": "Case 211 — A window is latched from inside, but a thin thread is caught in the latch. How could the apparent impossibility be explained?",
    "options": [
      "The thread may have been used to pull the latch after the window was closed",
      "The thread proves the glass was broken",
      "The latch closes itself whenever it rains",
      "The thread could not have entered the room"
    ],
    "answer": 0,
    "fact": "A thread can operate a simple latch from outside if routed carefully. Related principle: examine door bolts and latches and verify the route with physical tests."
  },
  {
    "id": "locked-room-212",
    "q": "Case 212 — A room is sealed with a strip of paper across the door. The strip is intact, but a second doorway is found behind a curtain. Which hypothesis deserves the closest examination?",
    "options": [
      "The person may have used the concealed second doorway",
      "The paper strip proves nobody entered by any route",
      "The person passed through the paper",
      "The curtain changed the room's dimensions"
    ],
    "answer": 0,
    "fact": "A seal only monitors the opening it covers. Related principle: examine door bolts and latches and verify the route with physical tests."
  },
  {
    "id": "locked-room-213",
    "q": "Case 213 — A locked cellar smells strongly of fresh paint, while the only paint tin is still sealed. Which conclusion avoids going beyond the available evidence?",
    "options": [
      "The smell proves the cellar has no exit",
      "The sealed tin created wet paint",
      "Paint smell can only come from outside",
      "The paint may have been applied before the tin was replaced or another source was used"
    ],
    "answer": 3,
    "fact": "A sealed tin does not rule out paint already applied or another container. Related principle: examine door bolts and latches and verify the route with physical tests."
  },
  {
    "id": "locked-room-214",
    "q": "Case 214 — A clock inside a locked room is five minutes slow; the hallway clock is accurate. Which explanation best accounts for the evidence?",
    "options": [
      "The hallway clock must have been altered",
      "The locked room changed time",
      "The room clock may not have been synchronized",
      "The slow clock proves the occupant left at a specific minute"
    ],
    "answer": 2,
    "fact": "A clock's offset alone does not establish when someone entered or left. Related principle: examine door bolts and latches and verify the route with physical tests."
  },
  {
    "id": "locked-room-215",
    "q": "Case 215 — A glass of water is full, but a circular wet mark sits beside it on a polished desk. Which deduction is most strongly supported by these clues?",
    "options": [
      "The ring proves the glass was never touched",
      "The glass may have been moved after condensation or a spill left the ring",
      "The desk created water",
      "The glass must be leaking through its base"
    ],
    "answer": 1,
    "fact": "A ring can remain after a glass is moved. Related principle: examine door bolts and latches and verify the route with physical tests."
  },
  {
    "id": "locked-room-216",
    "q": "Case 216 — A locked room has a pile of fine plaster below a ceiling vent; the vent cover screws are freshly scratched. What should the investigator conclude first?",
    "options": [
      "The plaster proves the ceiling is solid",
      "The vent may have been loosened and used as an access route",
      "The screws scratched themselves",
      "The only route must be the locked door"
    ],
    "answer": 1,
    "fact": "Fresh tool marks and debris justify inspecting the vent. Related principle: examine door bolts and latches and verify the route with physical tests."
  },
  {
    "id": "locked-room-217",
    "q": "Case 217 — A room is locked from within, and a snow-covered sill outside has no footprints. Which possibility should be tested before declaring the room impossible?",
    "options": [
      "The intruder may have entered before the snowfall",
      "The absence of prints proves nobody approached earlier",
      "Snow cannot hide footprints",
      "The intruder must have flown"
    ],
    "answer": 0,
    "fact": "Footprints may be covered by later snowfall; timing matters. Related principle: examine door bolts and latches and verify the route with physical tests."
  },
  {
    "id": "locked-room-218",
    "q": "Case 218 — A locked cabinet contains a damp envelope, but the cabinet's interior is dry. Which answer explains the physical evidence without assuming anything supernatural?",
    "options": [
      "The cabinet must have leaked",
      "The envelope generated water",
      "The lock caused condensation on the paper",
      "The envelope may have been damp before it was placed inside"
    ],
    "answer": 3,
    "fact": "The dry interior suggests the envelope itself brought the moisture. Related principle: examine door bolts and latches and verify the route with physical tests."
  },
  {
    "id": "locked-room-219",
    "q": "Case 219 — A door bolt is found engaged, but its handle can be turned from outside with a narrow tool. Which detail most plausibly reveals the hidden route?",
    "options": [
      "An engaged bolt makes every other method impossible",
      "The door opened by itself",
      "The bolt may have been manipulated through the gap or keyhole",
      "The handle's position proves who used it"
    ],
    "answer": 2,
    "fact": "A bolt's state does not rule out mechanical manipulation. Related principle: examine door bolts and latches and verify the route with physical tests."
  },
  {
    "id": "locked-room-220",
    "q": "Case 220 — A candle has burned down, but its wax trail stops at a closed window. The window ledge is dusty and undisturbed. Which interpretation is consistent with the scene as described?",
    "options": [
      "The candle vanished through the glass",
      "The wax proves the window was opened",
      "The candle was likely moved through the doorway before the room was sealed",
      "The room must have been cold"
    ],
    "answer": 2,
    "fact": "Wax on the floor can show the candle's path; undisturbed dust argues against using the window. Related principle: examine windows and shutters and verify the route with physical tests."
  },
  {
    "id": "locked-room-221",
    "q": "Case 221 — A locked study contains wet footprints ending at a dry rug. No wet prints lead away. How could the apparent impossibility be explained?",
    "options": [
      "The footprints were painted after the rug dried",
      "The person may have stepped onto the rug and removed wet footwear there",
      "The rug produced the water",
      "The person left through a wall"
    ],
    "answer": 1,
    "fact": "A dry rug can conceal later steps; inspect the rug and footwear before deciding. Related principle: examine windows and shutters and verify the route with physical tests."
  },
  {
    "id": "locked-room-222",
    "q": "Case 222 — A key is found on the floor beneath a door whose gap is too narrow for the key to pass through. Which hypothesis deserves the closest examination?",
    "options": [
      "The key was already inside before the door was shut",
      "The key slid under the door despite the measured gap",
      "The lock pulled the key through",
      "The key was delivered by the ceiling"
    ],
    "answer": 0,
    "fact": "The measured gap rules out sliding it beneath the door. Related principle: examine windows and shutters and verify the route with physical tests."
  },
  {
    "id": "locked-room-223",
    "q": "Case 223 — A window is latched from inside, but a thin thread is caught in the latch. Which conclusion avoids going beyond the available evidence?",
    "options": [
      "The thread proves the glass was broken",
      "The latch closes itself whenever it rains",
      "The thread could not have entered the room",
      "The thread may have been used to pull the latch after the window was closed"
    ],
    "answer": 3,
    "fact": "A thread can operate a simple latch from outside if routed carefully. Related principle: examine windows and shutters and verify the route with physical tests."
  },
  {
    "id": "locked-room-224",
    "q": "Case 224 — A room is sealed with a strip of paper across the door. The strip is intact, but a second doorway is found behind a curtain. Which explanation best accounts for the evidence?",
    "options": [
      "The paper strip proves nobody entered by any route",
      "The person passed through the paper",
      "The curtain changed the room's dimensions",
      "The person may have used the concealed second doorway"
    ],
    "answer": 3,
    "fact": "A seal only monitors the opening it covers. Related principle: examine windows and shutters and verify the route with physical tests."
  },
  {
    "id": "locked-room-225",
    "q": "Case 225 — A locked cellar smells strongly of fresh paint, while the only paint tin is still sealed. Which deduction is most strongly supported by these clues?",
    "options": [
      "The smell proves the cellar has no exit",
      "The sealed tin created wet paint",
      "The paint may have been applied before the tin was replaced or another source was used",
      "Paint smell can only come from outside"
    ],
    "answer": 2,
    "fact": "A sealed tin does not rule out paint already applied or another container. Related principle: examine windows and shutters and verify the route with physical tests."
  },
  {
    "id": "locked-room-226",
    "q": "Case 226 — A clock inside a locked room is five minutes slow; the hallway clock is accurate. What should the investigator conclude first?",
    "options": [
      "The hallway clock must have been altered",
      "The room clock may not have been synchronized",
      "The locked room changed time",
      "The slow clock proves the occupant left at a specific minute"
    ],
    "answer": 1,
    "fact": "A clock's offset alone does not establish when someone entered or left. Related principle: examine windows and shutters and verify the route with physical tests."
  },
  {
    "id": "locked-room-227",
    "q": "Case 227 — A glass of water is full, but a circular wet mark sits beside it on a polished desk. Which possibility should be tested before declaring the room impossible?",
    "options": [
      "The glass may have been moved after condensation or a spill left the ring",
      "The ring proves the glass was never touched",
      "The desk created water",
      "The glass must be leaking through its base"
    ],
    "answer": 0,
    "fact": "A ring can remain after a glass is moved. Related principle: examine windows and shutters and verify the route with physical tests."
  },
  {
    "id": "locked-room-228",
    "q": "Case 228 — A locked room has a pile of fine plaster below a ceiling vent; the vent cover screws are freshly scratched. Which answer explains the physical evidence without assuming anything supernatural?",
    "options": [
      "The vent may have been loosened and used as an access route",
      "The plaster proves the ceiling is solid",
      "The screws scratched themselves",
      "The only route must be the locked door"
    ],
    "answer": 0,
    "fact": "Fresh tool marks and debris justify inspecting the vent. Related principle: examine windows and shutters and verify the route with physical tests."
  },
  {
    "id": "locked-room-229",
    "q": "Case 229 — A room is locked from within, and a snow-covered sill outside has no footprints. Which detail most plausibly reveals the hidden route?",
    "options": [
      "The absence of prints proves nobody approached earlier",
      "Snow cannot hide footprints",
      "The intruder must have flown",
      "The intruder may have entered before the snowfall"
    ],
    "answer": 3,
    "fact": "Footprints may be covered by later snowfall; timing matters. Related principle: examine windows and shutters and verify the route with physical tests."
  },
  {
    "id": "locked-room-230",
    "q": "Case 230 — A locked cabinet contains a damp envelope, but the cabinet's interior is dry. Which interpretation is consistent with the scene as described?",
    "options": [
      "The cabinet must have leaked",
      "The envelope generated water",
      "The envelope may have been damp before it was placed inside",
      "The lock caused condensation on the paper"
    ],
    "answer": 2,
    "fact": "The dry interior suggests the envelope itself brought the moisture. Related principle: examine windows and shutters and verify the route with physical tests."
  },
  {
    "id": "locked-room-231",
    "q": "Case 231 — A door bolt is found engaged, but its handle can be turned from outside with a narrow tool. How could the apparent impossibility be explained?",
    "options": [
      "An engaged bolt makes every other method impossible",
      "The bolt may have been manipulated through the gap or keyhole",
      "The door opened by itself",
      "The handle's position proves who used it"
    ],
    "answer": 1,
    "fact": "A bolt's state does not rule out mechanical manipulation. Related principle: examine windows and shutters and verify the route with physical tests."
  },
  {
    "id": "locked-room-232",
    "q": "Case 232 — A candle has burned down, but its wax trail stops at a closed window. The window ledge is dusty and undisturbed. Which hypothesis deserves the closest examination?",
    "options": [
      "The candle vanished through the glass",
      "The candle was likely moved through the doorway before the room was sealed",
      "The wax proves the window was opened",
      "The room must have been cold"
    ],
    "answer": 1,
    "fact": "Wax on the floor can show the candle's path; undisturbed dust argues against using the window. Related principle: examine keys and duplicate locks and verify the route with physical tests."
  },
  {
    "id": "locked-room-233",
    "q": "Case 233 — A locked study contains wet footprints ending at a dry rug. No wet prints lead away. Which conclusion avoids going beyond the available evidence?",
    "options": [
      "The person may have stepped onto the rug and removed wet footwear there",
      "The footprints were painted after the rug dried",
      "The rug produced the water",
      "The person left through a wall"
    ],
    "answer": 0,
    "fact": "A dry rug can conceal later steps; inspect the rug and footwear before deciding. Related principle: examine keys and duplicate locks and verify the route with physical tests."
  },
  {
    "id": "locked-room-234",
    "q": "Case 234 — A key is found on the floor beneath a door whose gap is too narrow for the key to pass through. Which explanation best accounts for the evidence?",
    "options": [
      "The key slid under the door despite the measured gap",
      "The lock pulled the key through",
      "The key was delivered by the ceiling",
      "The key was already inside before the door was shut"
    ],
    "answer": 3,
    "fact": "The measured gap rules out sliding it beneath the door. Related principle: examine keys and duplicate locks and verify the route with physical tests."
  },
  {
    "id": "locked-room-235",
    "q": "Case 235 — A window is latched from inside, but a thin thread is caught in the latch. Which deduction is most strongly supported by these clues?",
    "options": [
      "The thread proves the glass was broken",
      "The latch closes itself whenever it rains",
      "The thread may have been used to pull the latch after the window was closed",
      "The thread could not have entered the room"
    ],
    "answer": 2,
    "fact": "A thread can operate a simple latch from outside if routed carefully. Related principle: examine keys and duplicate locks and verify the route with physical tests."
  },
  {
    "id": "locked-room-236",
    "q": "Case 236 — A room is sealed with a strip of paper across the door. The strip is intact, but a second doorway is found behind a curtain. What should the investigator conclude first?",
    "options": [
      "The paper strip proves nobody entered by any route",
      "The person passed through the paper",
      "The person may have used the concealed second doorway",
      "The curtain changed the room's dimensions"
    ],
    "answer": 2,
    "fact": "A seal only monitors the opening it covers. Related principle: examine keys and duplicate locks and verify the route with physical tests."
  },
  {
    "id": "locked-room-237",
    "q": "Case 237 — A locked cellar smells strongly of fresh paint, while the only paint tin is still sealed. Which possibility should be tested before declaring the room impossible?",
    "options": [
      "The smell proves the cellar has no exit",
      "The paint may have been applied before the tin was replaced or another source was used",
      "The sealed tin created wet paint",
      "Paint smell can only come from outside"
    ],
    "answer": 1,
    "fact": "A sealed tin does not rule out paint already applied or another container. Related principle: examine keys and duplicate locks and verify the route with physical tests."
  },
  {
    "id": "locked-room-238",
    "q": "Case 238 — A clock inside a locked room is five minutes slow; the hallway clock is accurate. Which answer explains the physical evidence without assuming anything supernatural?",
    "options": [
      "The room clock may not have been synchronized",
      "The hallway clock must have been altered",
      "The locked room changed time",
      "The slow clock proves the occupant left at a specific minute"
    ],
    "answer": 0,
    "fact": "A clock's offset alone does not establish when someone entered or left. Related principle: examine keys and duplicate locks and verify the route with physical tests."
  },
  {
    "id": "locked-room-239",
    "q": "Case 239 — A glass of water is full, but a circular wet mark sits beside it on a polished desk. Which detail most plausibly reveals the hidden route?",
    "options": [
      "The ring proves the glass was never touched",
      "The desk created water",
      "The glass must be leaking through its base",
      "The glass may have been moved after condensation or a spill left the ring"
    ],
    "answer": 3,
    "fact": "A ring can remain after a glass is moved. Related principle: examine keys and duplicate locks and verify the route with physical tests."
  },
  {
    "id": "locked-room-240",
    "q": "Case 240 — A locked room has a pile of fine plaster below a ceiling vent; the vent cover screws are freshly scratched. Which interpretation is consistent with the scene as described?",
    "options": [
      "The plaster proves the ceiling is solid",
      "The screws scratched themselves",
      "The only route must be the locked door",
      "The vent may have been loosened and used as an access route"
    ],
    "answer": 3,
    "fact": "Fresh tool marks and debris justify inspecting the vent. Related principle: examine keys and duplicate locks and verify the route with physical tests."
  },
  {
    "id": "locked-room-241",
    "q": "Case 241 — A room is locked from within, and a snow-covered sill outside has no footprints. How could the apparent impossibility be explained?",
    "options": [
      "The absence of prints proves nobody approached earlier",
      "Snow cannot hide footprints",
      "The intruder may have entered before the snowfall",
      "The intruder must have flown"
    ],
    "answer": 2,
    "fact": "Footprints may be covered by later snowfall; timing matters. Related principle: examine keys and duplicate locks and verify the route with physical tests."
  },
  {
    "id": "locked-room-242",
    "q": "Case 242 — A locked cabinet contains a damp envelope, but the cabinet's interior is dry. Which hypothesis deserves the closest examination?",
    "options": [
      "The cabinet must have leaked",
      "The envelope may have been damp before it was placed inside",
      "The envelope generated water",
      "The lock caused condensation on the paper"
    ],
    "answer": 1,
    "fact": "The dry interior suggests the envelope itself brought the moisture. Related principle: examine keys and duplicate locks and verify the route with physical tests."
  },
  {
    "id": "locked-room-243",
    "q": "Case 243 — A door bolt is found engaged, but its handle can be turned from outside with a narrow tool. Which conclusion avoids going beyond the available evidence?",
    "options": [
      "The bolt may have been manipulated through the gap or keyhole",
      "An engaged bolt makes every other method impossible",
      "The door opened by itself",
      "The handle's position proves who used it"
    ],
    "answer": 0,
    "fact": "A bolt's state does not rule out mechanical manipulation. Related principle: examine keys and duplicate locks and verify the route with physical tests."
  },
  {
    "id": "locked-room-244",
    "q": "Case 244 — A candle has burned down, but its wax trail stops at a closed window. The window ledge is dusty and undisturbed. Which explanation best accounts for the evidence?",
    "options": [
      "The candle was likely moved through the doorway before the room was sealed",
      "The candle vanished through the glass",
      "The wax proves the window was opened",
      "The room must have been cold"
    ],
    "answer": 0,
    "fact": "Wax on the floor can show the candle's path; undisturbed dust argues against using the window. Related principle: examine vents and chimneys and verify the route with physical tests."
  },
  {
    "id": "locked-room-245",
    "q": "Case 245 — A locked study contains wet footprints ending at a dry rug. No wet prints lead away. Which deduction is most strongly supported by these clues?",
    "options": [
      "The footprints were painted after the rug dried",
      "The rug produced the water",
      "The person left through a wall",
      "The person may have stepped onto the rug and removed wet footwear there"
    ],
    "answer": 3,
    "fact": "A dry rug can conceal later steps; inspect the rug and footwear before deciding. Related principle: examine vents and chimneys and verify the route with physical tests."
  },
  {
    "id": "locked-room-246",
    "q": "Case 246 — A key is found on the floor beneath a door whose gap is too narrow for the key to pass through. What should the investigator conclude first?",
    "options": [
      "The key slid under the door despite the measured gap",
      "The lock pulled the key through",
      "The key was already inside before the door was shut",
      "The key was delivered by the ceiling"
    ],
    "answer": 2,
    "fact": "The measured gap rules out sliding it beneath the door. Related principle: examine vents and chimneys and verify the route with physical tests."
  },
  {
    "id": "locked-room-247",
    "q": "Case 247 — A window is latched from inside, but a thin thread is caught in the latch. Which possibility should be tested before declaring the room impossible?",
    "options": [
      "The thread proves the glass was broken",
      "The thread may have been used to pull the latch after the window was closed",
      "The latch closes itself whenever it rains",
      "The thread could not have entered the room"
    ],
    "answer": 1,
    "fact": "A thread can operate a simple latch from outside if routed carefully. Related principle: examine vents and chimneys and verify the route with physical tests."
  },
  {
    "id": "locked-room-248",
    "q": "Case 248 — A room is sealed with a strip of paper across the door. The strip is intact, but a second doorway is found behind a curtain. Which answer explains the physical evidence without assuming anything supernatural?",
    "options": [
      "The paper strip proves nobody entered by any route",
      "The person may have used the concealed second doorway",
      "The person passed through the paper",
      "The curtain changed the room's dimensions"
    ],
    "answer": 1,
    "fact": "A seal only monitors the opening it covers. Related principle: examine vents and chimneys and verify the route with physical tests."
  },
  {
    "id": "locked-room-249",
    "q": "Case 249 — A locked cellar smells strongly of fresh paint, while the only paint tin is still sealed. Which detail most plausibly reveals the hidden route?",
    "options": [
      "The paint may have been applied before the tin was replaced or another source was used",
      "The smell proves the cellar has no exit",
      "The sealed tin created wet paint",
      "Paint smell can only come from outside"
    ],
    "answer": 0,
    "fact": "A sealed tin does not rule out paint already applied or another container. Related principle: examine vents and chimneys and verify the route with physical tests."
  },
  {
    "id": "locked-room-250",
    "q": "Case 250 — A clock inside a locked room is five minutes slow; the hallway clock is accurate. Which interpretation is consistent with the scene as described?",
    "options": [
      "The hallway clock must have been altered",
      "The locked room changed time",
      "The slow clock proves the occupant left at a specific minute",
      "The room clock may not have been synchronized"
    ],
    "answer": 3,
    "fact": "A clock's offset alone does not establish when someone entered or left. Related principle: examine vents and chimneys and verify the route with physical tests."
  },
  {
    "id": "locked-room-251",
    "q": "Case 251 — A glass of water is full, but a circular wet mark sits beside it on a polished desk. How could the apparent impossibility be explained?",
    "options": [
      "The ring proves the glass was never touched",
      "The desk created water",
      "The glass may have been moved after condensation or a spill left the ring",
      "The glass must be leaking through its base"
    ],
    "answer": 2,
    "fact": "A ring can remain after a glass is moved. Related principle: examine vents and chimneys and verify the route with physical tests."
  },
  {
    "id": "locked-room-252",
    "q": "Case 252 — A locked room has a pile of fine plaster below a ceiling vent; the vent cover screws are freshly scratched. Which hypothesis deserves the closest examination?",
    "options": [
      "The plaster proves the ceiling is solid",
      "The screws scratched themselves",
      "The vent may have been loosened and used as an access route",
      "The only route must be the locked door"
    ],
    "answer": 2,
    "fact": "Fresh tool marks and debris justify inspecting the vent. Related principle: examine vents and chimneys and verify the route with physical tests."
  },
  {
    "id": "locked-room-253",
    "q": "Case 253 — A room is locked from within, and a snow-covered sill outside has no footprints. Which conclusion avoids going beyond the available evidence?",
    "options": [
      "The absence of prints proves nobody approached earlier",
      "The intruder may have entered before the snowfall",
      "Snow cannot hide footprints",
      "The intruder must have flown"
    ],
    "answer": 1,
    "fact": "Footprints may be covered by later snowfall; timing matters. Related principle: examine vents and chimneys and verify the route with physical tests."
  },
  {
    "id": "locked-room-254",
    "q": "Case 254 — A locked cabinet contains a damp envelope, but the cabinet's interior is dry. Which explanation best accounts for the evidence?",
    "options": [
      "The envelope may have been damp before it was placed inside",
      "The cabinet must have leaked",
      "The envelope generated water",
      "The lock caused condensation on the paper"
    ],
    "answer": 0,
    "fact": "The dry interior suggests the envelope itself brought the moisture. Related principle: examine vents and chimneys and verify the route with physical tests."
  },
  {
    "id": "locked-room-255",
    "q": "Case 255 — A door bolt is found engaged, but its handle can be turned from outside with a narrow tool. Which deduction is most strongly supported by these clues?",
    "options": [
      "An engaged bolt makes every other method impossible",
      "The door opened by itself",
      "The handle's position proves who used it",
      "The bolt may have been manipulated through the gap or keyhole"
    ],
    "answer": 3,
    "fact": "A bolt's state does not rule out mechanical manipulation. Related principle: examine vents and chimneys and verify the route with physical tests."
  },
  {
    "id": "locked-room-256",
    "q": "Case 256 — A candle has burned down, but its wax trail stops at a closed window. The window ledge is dusty and undisturbed. What should the investigator conclude first?",
    "options": [
      "The candle vanished through the glass",
      "The wax proves the window was opened",
      "The room must have been cold",
      "The candle was likely moved through the doorway before the room was sealed"
    ],
    "answer": 3,
    "fact": "Wax on the floor can show the candle's path; undisturbed dust argues against using the window. Related principle: examine mirrors and sightlines and verify the route with physical tests."
  },
  {
    "id": "locked-room-257",
    "q": "Case 257 — A locked study contains wet footprints ending at a dry rug. No wet prints lead away. Which possibility should be tested before declaring the room impossible?",
    "options": [
      "The footprints were painted after the rug dried",
      "The rug produced the water",
      "The person may have stepped onto the rug and removed wet footwear there",
      "The person left through a wall"
    ],
    "answer": 2,
    "fact": "A dry rug can conceal later steps; inspect the rug and footwear before deciding. Related principle: examine mirrors and sightlines and verify the route with physical tests."
  },
  {
    "id": "locked-room-258",
    "q": "Case 258 — A key is found on the floor beneath a door whose gap is too narrow for the key to pass through. Which answer explains the physical evidence without assuming anything supernatural?",
    "options": [
      "The key slid under the door despite the measured gap",
      "The key was already inside before the door was shut",
      "The lock pulled the key through",
      "The key was delivered by the ceiling"
    ],
    "answer": 1,
    "fact": "The measured gap rules out sliding it beneath the door. Related principle: examine mirrors and sightlines and verify the route with physical tests."
  },
  {
    "id": "locked-room-259",
    "q": "Case 259 — A window is latched from inside, but a thin thread is caught in the latch. Which detail most plausibly reveals the hidden route?",
    "options": [
      "The thread may have been used to pull the latch after the window was closed",
      "The thread proves the glass was broken",
      "The latch closes itself whenever it rains",
      "The thread could not have entered the room"
    ],
    "answer": 0,
    "fact": "A thread can operate a simple latch from outside if routed carefully. Related principle: examine mirrors and sightlines and verify the route with physical tests."
  },
  {
    "id": "locked-room-260",
    "q": "Case 260 — A room is sealed with a strip of paper across the door. The strip is intact, but a second doorway is found behind a curtain. Which interpretation is consistent with the scene as described?",
    "options": [
      "The person may have used the concealed second doorway",
      "The paper strip proves nobody entered by any route",
      "The person passed through the paper",
      "The curtain changed the room's dimensions"
    ],
    "answer": 0,
    "fact": "A seal only monitors the opening it covers. Related principle: examine mirrors and sightlines and verify the route with physical tests."
  },
  {
    "id": "locked-room-261",
    "q": "Case 261 — A locked cellar smells strongly of fresh paint, while the only paint tin is still sealed. How could the apparent impossibility be explained?",
    "options": [
      "The smell proves the cellar has no exit",
      "The sealed tin created wet paint",
      "Paint smell can only come from outside",
      "The paint may have been applied before the tin was replaced or another source was used"
    ],
    "answer": 3,
    "fact": "A sealed tin does not rule out paint already applied or another container. Related principle: examine mirrors and sightlines and verify the route with physical tests."
  },
  {
    "id": "locked-room-262",
    "q": "Case 262 — A clock inside a locked room is five minutes slow; the hallway clock is accurate. Which hypothesis deserves the closest examination?",
    "options": [
      "The hallway clock must have been altered",
      "The locked room changed time",
      "The room clock may not have been synchronized",
      "The slow clock proves the occupant left at a specific minute"
    ],
    "answer": 2,
    "fact": "A clock's offset alone does not establish when someone entered or left. Related principle: examine mirrors and sightlines and verify the route with physical tests."
  },
  {
    "id": "locked-room-263",
    "q": "Case 263 — A glass of water is full, but a circular wet mark sits beside it on a polished desk. Which conclusion avoids going beyond the available evidence?",
    "options": [
      "The ring proves the glass was never touched",
      "The glass may have been moved after condensation or a spill left the ring",
      "The desk created water",
      "The glass must be leaking through its base"
    ],
    "answer": 1,
    "fact": "A ring can remain after a glass is moved. Related principle: examine mirrors and sightlines and verify the route with physical tests."
  },
  {
    "id": "locked-room-264",
    "q": "Case 264 — A locked room has a pile of fine plaster below a ceiling vent; the vent cover screws are freshly scratched. Which explanation best accounts for the evidence?",
    "options": [
      "The plaster proves the ceiling is solid",
      "The vent may have been loosened and used as an access route",
      "The screws scratched themselves",
      "The only route must be the locked door"
    ],
    "answer": 1,
    "fact": "Fresh tool marks and debris justify inspecting the vent. Related principle: examine mirrors and sightlines and verify the route with physical tests."
  },
  {
    "id": "locked-room-265",
    "q": "Case 265 — A room is locked from within, and a snow-covered sill outside has no footprints. Which deduction is most strongly supported by these clues?",
    "options": [
      "The intruder may have entered before the snowfall",
      "The absence of prints proves nobody approached earlier",
      "Snow cannot hide footprints",
      "The intruder must have flown"
    ],
    "answer": 0,
    "fact": "Footprints may be covered by later snowfall; timing matters. Related principle: examine mirrors and sightlines and verify the route with physical tests."
  },
  {
    "id": "locked-room-266",
    "q": "Case 266 — A locked cabinet contains a damp envelope, but the cabinet's interior is dry. What should the investigator conclude first?",
    "options": [
      "The cabinet must have leaked",
      "The envelope generated water",
      "The lock caused condensation on the paper",
      "The envelope may have been damp before it was placed inside"
    ],
    "answer": 3,
    "fact": "The dry interior suggests the envelope itself brought the moisture. Related principle: examine mirrors and sightlines and verify the route with physical tests."
  },
  {
    "id": "locked-room-267",
    "q": "Case 267 — A door bolt is found engaged, but its handle can be turned from outside with a narrow tool. Which possibility should be tested before declaring the room impossible?",
    "options": [
      "An engaged bolt makes every other method impossible",
      "The door opened by itself",
      "The bolt may have been manipulated through the gap or keyhole",
      "The handle's position proves who used it"
    ],
    "answer": 2,
    "fact": "A bolt's state does not rule out mechanical manipulation. Related principle: examine mirrors and sightlines and verify the route with physical tests."
  },
  {
    "id": "locked-room-268",
    "q": "Case 268 — A candle has burned down, but its wax trail stops at a closed window. The window ledge is dusty and undisturbed. Which answer explains the physical evidence without assuming anything supernatural?",
    "options": [
      "The candle vanished through the glass",
      "The wax proves the window was opened",
      "The candle was likely moved through the doorway before the room was sealed",
      "The room must have been cold"
    ],
    "answer": 2,
    "fact": "Wax on the floor can show the candle's path; undisturbed dust argues against using the window. Related principle: examine clocks and timelines and verify the route with physical tests."
  },
  {
    "id": "locked-room-269",
    "q": "Case 269 — A locked study contains wet footprints ending at a dry rug. No wet prints lead away. Which detail most plausibly reveals the hidden route?",
    "options": [
      "The footprints were painted after the rug dried",
      "The person may have stepped onto the rug and removed wet footwear there",
      "The rug produced the water",
      "The person left through a wall"
    ],
    "answer": 1,
    "fact": "A dry rug can conceal later steps; inspect the rug and footwear before deciding. Related principle: examine clocks and timelines and verify the route with physical tests."
  },
  {
    "id": "locked-room-270",
    "q": "Case 270 — A key is found on the floor beneath a door whose gap is too narrow for the key to pass through. Which interpretation is consistent with the scene as described?",
    "options": [
      "The key was already inside before the door was shut",
      "The key slid under the door despite the measured gap",
      "The lock pulled the key through",
      "The key was delivered by the ceiling"
    ],
    "answer": 0,
    "fact": "The measured gap rules out sliding it beneath the door. Related principle: examine clocks and timelines and verify the route with physical tests."
  },
  {
    "id": "locked-room-271",
    "q": "Case 271 — A window is latched from inside, but a thin thread is caught in the latch. How could the apparent impossibility be explained?",
    "options": [
      "The thread proves the glass was broken",
      "The latch closes itself whenever it rains",
      "The thread could not have entered the room",
      "The thread may have been used to pull the latch after the window was closed"
    ],
    "answer": 3,
    "fact": "A thread can operate a simple latch from outside if routed carefully. Related principle: examine clocks and timelines and verify the route with physical tests."
  },
  {
    "id": "locked-room-272",
    "q": "Case 272 — A room is sealed with a strip of paper across the door. The strip is intact, but a second doorway is found behind a curtain. Which hypothesis deserves the closest examination?",
    "options": [
      "The paper strip proves nobody entered by any route",
      "The person passed through the paper",
      "The curtain changed the room's dimensions",
      "The person may have used the concealed second doorway"
    ],
    "answer": 3,
    "fact": "A seal only monitors the opening it covers. Related principle: examine clocks and timelines and verify the route with physical tests."
  },
  {
    "id": "locked-room-273",
    "q": "Case 273 — A locked cellar smells strongly of fresh paint, while the only paint tin is still sealed. Which conclusion avoids going beyond the available evidence?",
    "options": [
      "The smell proves the cellar has no exit",
      "The sealed tin created wet paint",
      "The paint may have been applied before the tin was replaced or another source was used",
      "Paint smell can only come from outside"
    ],
    "answer": 2,
    "fact": "A sealed tin does not rule out paint already applied or another container. Related principle: examine clocks and timelines and verify the route with physical tests."
  },
  {
    "id": "locked-room-274",
    "q": "Case 274 — A clock inside a locked room is five minutes slow; the hallway clock is accurate. Which explanation best accounts for the evidence?",
    "options": [
      "The hallway clock must have been altered",
      "The room clock may not have been synchronized",
      "The locked room changed time",
      "The slow clock proves the occupant left at a specific minute"
    ],
    "answer": 1,
    "fact": "A clock's offset alone does not establish when someone entered or left. Related principle: examine clocks and timelines and verify the route with physical tests."
  },
  {
    "id": "locked-room-275",
    "q": "Case 275 — A glass of water is full, but a circular wet mark sits beside it on a polished desk. Which deduction is most strongly supported by these clues?",
    "options": [
      "The glass may have been moved after condensation or a spill left the ring",
      "The ring proves the glass was never touched",
      "The desk created water",
      "The glass must be leaking through its base"
    ],
    "answer": 0,
    "fact": "A ring can remain after a glass is moved. Related principle: examine clocks and timelines and verify the route with physical tests."
  },
  {
    "id": "locked-room-276",
    "q": "Case 276 — A locked room has a pile of fine plaster below a ceiling vent; the vent cover screws are freshly scratched. What should the investigator conclude first?",
    "options": [
      "The vent may have been loosened and used as an access route",
      "The plaster proves the ceiling is solid",
      "The screws scratched themselves",
      "The only route must be the locked door"
    ],
    "answer": 0,
    "fact": "Fresh tool marks and debris justify inspecting the vent. Related principle: examine clocks and timelines and verify the route with physical tests."
  },
  {
    "id": "locked-room-277",
    "q": "Case 277 — A room is locked from within, and a snow-covered sill outside has no footprints. Which possibility should be tested before declaring the room impossible?",
    "options": [
      "The absence of prints proves nobody approached earlier",
      "Snow cannot hide footprints",
      "The intruder must have flown",
      "The intruder may have entered before the snowfall"
    ],
    "answer": 3,
    "fact": "Footprints may be covered by later snowfall; timing matters. Related principle: examine clocks and timelines and verify the route with physical tests."
  },
  {
    "id": "locked-room-278",
    "q": "Case 278 — A locked cabinet contains a damp envelope, but the cabinet's interior is dry. Which answer explains the physical evidence without assuming anything supernatural?",
    "options": [
      "The cabinet must have leaked",
      "The envelope generated water",
      "The envelope may have been damp before it was placed inside",
      "The lock caused condensation on the paper"
    ],
    "answer": 2,
    "fact": "The dry interior suggests the envelope itself brought the moisture. Related principle: examine clocks and timelines and verify the route with physical tests."
  },
  {
    "id": "locked-room-279",
    "q": "Case 279 — A door bolt is found engaged, but its handle can be turned from outside with a narrow tool. Which detail most plausibly reveals the hidden route?",
    "options": [
      "An engaged bolt makes every other method impossible",
      "The bolt may have been manipulated through the gap or keyhole",
      "The door opened by itself",
      "The handle's position proves who used it"
    ],
    "answer": 1,
    "fact": "A bolt's state does not rule out mechanical manipulation. Related principle: examine clocks and timelines and verify the route with physical tests."
  },
  {
    "id": "locked-room-280",
    "q": "Case 280 — A candle has burned down, but its wax trail stops at a closed window. The window ledge is dusty and undisturbed. Which interpretation is consistent with the scene as described?",
    "options": [
      "The candle vanished through the glass",
      "The candle was likely moved through the doorway before the room was sealed",
      "The wax proves the window was opened",
      "The room must have been cold"
    ],
    "answer": 1,
    "fact": "Wax on the floor can show the candle's path; undisturbed dust argues against using the window. Related principle: examine footprints and floor traces and verify the route with physical tests."
  },
  {
    "id": "locked-room-281",
    "q": "Case 281 — A locked study contains wet footprints ending at a dry rug. No wet prints lead away. How could the apparent impossibility be explained?",
    "options": [
      "The person may have stepped onto the rug and removed wet footwear there",
      "The footprints were painted after the rug dried",
      "The rug produced the water",
      "The person left through a wall"
    ],
    "answer": 0,
    "fact": "A dry rug can conceal later steps; inspect the rug and footwear before deciding. Related principle: examine footprints and floor traces and verify the route with physical tests."
  },
  {
    "id": "locked-room-282",
    "q": "Case 282 — A key is found on the floor beneath a door whose gap is too narrow for the key to pass through. Which hypothesis deserves the closest examination?",
    "options": [
      "The key slid under the door despite the measured gap",
      "The lock pulled the key through",
      "The key was delivered by the ceiling",
      "The key was already inside before the door was shut"
    ],
    "answer": 3,
    "fact": "The measured gap rules out sliding it beneath the door. Related principle: examine footprints and floor traces and verify the route with physical tests."
  },
  {
    "id": "locked-room-283",
    "q": "Case 283 — A window is latched from inside, but a thin thread is caught in the latch. Which conclusion avoids going beyond the available evidence?",
    "options": [
      "The thread proves the glass was broken",
      "The latch closes itself whenever it rains",
      "The thread may have been used to pull the latch after the window was closed",
      "The thread could not have entered the room"
    ],
    "answer": 2,
    "fact": "A thread can operate a simple latch from outside if routed carefully. Related principle: examine footprints and floor traces and verify the route with physical tests."
  },
  {
    "id": "locked-room-284",
    "q": "Case 284 — A room is sealed with a strip of paper across the door. The strip is intact, but a second doorway is found behind a curtain. Which explanation best accounts for the evidence?",
    "options": [
      "The paper strip proves nobody entered by any route",
      "The person passed through the paper",
      "The person may have used the concealed second doorway",
      "The curtain changed the room's dimensions"
    ],
    "answer": 2,
    "fact": "A seal only monitors the opening it covers. Related principle: examine footprints and floor traces and verify the route with physical tests."
  },
  {
    "id": "locked-room-285",
    "q": "Case 285 — A locked cellar smells strongly of fresh paint, while the only paint tin is still sealed. Which deduction is most strongly supported by these clues?",
    "options": [
      "The smell proves the cellar has no exit",
      "The paint may have been applied before the tin was replaced or another source was used",
      "The sealed tin created wet paint",
      "Paint smell can only come from outside"
    ],
    "answer": 1,
    "fact": "A sealed tin does not rule out paint already applied or another container. Related principle: examine footprints and floor traces and verify the route with physical tests."
  },
  {
    "id": "locked-room-286",
    "q": "Case 286 — A clock inside a locked room is five minutes slow; the hallway clock is accurate. What should the investigator conclude first?",
    "options": [
      "The room clock may not have been synchronized",
      "The hallway clock must have been altered",
      "The locked room changed time",
      "The slow clock proves the occupant left at a specific minute"
    ],
    "answer": 0,
    "fact": "A clock's offset alone does not establish when someone entered or left. Related principle: examine footprints and floor traces and verify the route with physical tests."
  },
  {
    "id": "locked-room-287",
    "q": "Case 287 — A glass of water is full, but a circular wet mark sits beside it on a polished desk. Which possibility should be tested before declaring the room impossible?",
    "options": [
      "The ring proves the glass was never touched",
      "The desk created water",
      "The glass must be leaking through its base",
      "The glass may have been moved after condensation or a spill left the ring"
    ],
    "answer": 3,
    "fact": "A ring can remain after a glass is moved. Related principle: examine footprints and floor traces and verify the route with physical tests."
  },
  {
    "id": "locked-room-288",
    "q": "Case 288 — A locked room has a pile of fine plaster below a ceiling vent; the vent cover screws are freshly scratched. Which answer explains the physical evidence without assuming anything supernatural?",
    "options": [
      "The plaster proves the ceiling is solid",
      "The screws scratched themselves",
      "The only route must be the locked door",
      "The vent may have been loosened and used as an access route"
    ],
    "answer": 3,
    "fact": "Fresh tool marks and debris justify inspecting the vent. Related principle: examine footprints and floor traces and verify the route with physical tests."
  },
  {
    "id": "locked-room-289",
    "q": "Case 289 — A room is locked from within, and a snow-covered sill outside has no footprints. Which detail most plausibly reveals the hidden route?",
    "options": [
      "The absence of prints proves nobody approached earlier",
      "Snow cannot hide footprints",
      "The intruder may have entered before the snowfall",
      "The intruder must have flown"
    ],
    "answer": 2,
    "fact": "Footprints may be covered by later snowfall; timing matters. Related principle: examine footprints and floor traces and verify the route with physical tests."
  },
  {
    "id": "locked-room-290",
    "q": "Case 290 — A locked cabinet contains a damp envelope, but the cabinet's interior is dry. Which interpretation is consistent with the scene as described?",
    "options": [
      "The cabinet must have leaked",
      "The envelope may have been damp before it was placed inside",
      "The envelope generated water",
      "The lock caused condensation on the paper"
    ],
    "answer": 1,
    "fact": "The dry interior suggests the envelope itself brought the moisture. Related principle: examine footprints and floor traces and verify the route with physical tests."
  },
  {
    "id": "locked-room-291",
    "q": "Case 291 — A door bolt is found engaged, but its handle can be turned from outside with a narrow tool. How could the apparent impossibility be explained?",
    "options": [
      "The bolt may have been manipulated through the gap or keyhole",
      "An engaged bolt makes every other method impossible",
      "The door opened by itself",
      "The handle's position proves who used it"
    ],
    "answer": 0,
    "fact": "A bolt's state does not rule out mechanical manipulation. Related principle: examine footprints and floor traces and verify the route with physical tests."
  },
  {
    "id": "locked-room-292",
    "q": "Case 292 — A candle has burned down, but its wax trail stops at a closed window. The window ledge is dusty and undisturbed. Which hypothesis deserves the closest examination?",
    "options": [
      "The candle was likely moved through the doorway before the room was sealed",
      "The candle vanished through the glass",
      "The wax proves the window was opened",
      "The room must have been cold"
    ],
    "answer": 0,
    "fact": "Wax on the floor can show the candle's path; undisturbed dust argues against using the window. Related principle: examine candles and light sources and verify the route with physical tests."
  },
  {
    "id": "locked-room-293",
    "q": "Case 293 — A locked study contains wet footprints ending at a dry rug. No wet prints lead away. Which conclusion avoids going beyond the available evidence?",
    "options": [
      "The footprints were painted after the rug dried",
      "The rug produced the water",
      "The person left through a wall",
      "The person may have stepped onto the rug and removed wet footwear there"
    ],
    "answer": 3,
    "fact": "A dry rug can conceal later steps; inspect the rug and footwear before deciding. Related principle: examine candles and light sources and verify the route with physical tests."
  },
  {
    "id": "locked-room-294",
    "q": "Case 294 — A key is found on the floor beneath a door whose gap is too narrow for the key to pass through. Which explanation best accounts for the evidence?",
    "options": [
      "The key slid under the door despite the measured gap",
      "The lock pulled the key through",
      "The key was already inside before the door was shut",
      "The key was delivered by the ceiling"
    ],
    "answer": 2,
    "fact": "The measured gap rules out sliding it beneath the door. Related principle: examine candles and light sources and verify the route with physical tests."
  },
  {
    "id": "locked-room-295",
    "q": "Case 295 — A window is latched from inside, but a thin thread is caught in the latch. Which deduction is most strongly supported by these clues?",
    "options": [
      "The thread proves the glass was broken",
      "The thread may have been used to pull the latch after the window was closed",
      "The latch closes itself whenever it rains",
      "The thread could not have entered the room"
    ],
    "answer": 1,
    "fact": "A thread can operate a simple latch from outside if routed carefully. Related principle: examine candles and light sources and verify the route with physical tests."
  },
  {
    "id": "locked-room-296",
    "q": "Case 296 — A room is sealed with a strip of paper across the door. The strip is intact, but a second doorway is found behind a curtain. What should the investigator conclude first?",
    "options": [
      "The paper strip proves nobody entered by any route",
      "The person may have used the concealed second doorway",
      "The person passed through the paper",
      "The curtain changed the room's dimensions"
    ],
    "answer": 1,
    "fact": "A seal only monitors the opening it covers. Related principle: examine candles and light sources and verify the route with physical tests."
  },
  {
    "id": "locked-room-297",
    "q": "Case 297 — A locked cellar smells strongly of fresh paint, while the only paint tin is still sealed. Which possibility should be tested before declaring the room impossible?",
    "options": [
      "The paint may have been applied before the tin was replaced or another source was used",
      "The smell proves the cellar has no exit",
      "The sealed tin created wet paint",
      "Paint smell can only come from outside"
    ],
    "answer": 0,
    "fact": "A sealed tin does not rule out paint already applied or another container. Related principle: examine candles and light sources and verify the route with physical tests."
  },
  {
    "id": "locked-room-298",
    "q": "Case 298 — A clock inside a locked room is five minutes slow; the hallway clock is accurate. Which answer explains the physical evidence without assuming anything supernatural?",
    "options": [
      "The hallway clock must have been altered",
      "The locked room changed time",
      "The slow clock proves the occupant left at a specific minute",
      "The room clock may not have been synchronized"
    ],
    "answer": 3,
    "fact": "A clock's offset alone does not establish when someone entered or left. Related principle: examine candles and light sources and verify the route with physical tests."
  },
  {
    "id": "locked-room-299",
    "q": "Case 299 — A glass of water is full, but a circular wet mark sits beside it on a polished desk. Which detail most plausibly reveals the hidden route?",
    "options": [
      "The ring proves the glass was never touched",
      "The desk created water",
      "The glass may have been moved after condensation or a spill left the ring",
      "The glass must be leaking through its base"
    ],
    "answer": 2,
    "fact": "A ring can remain after a glass is moved. Related principle: examine candles and light sources and verify the route with physical tests."
  },
  {
    "id": "locked-room-300",
    "q": "Case 300 — A locked room has a pile of fine plaster below a ceiling vent; the vent cover screws are freshly scratched. Which interpretation is consistent with the scene as described?",
    "options": [
      "The plaster proves the ceiling is solid",
      "The screws scratched themselves",
      "The vent may have been loosened and used as an access route",
      "The only route must be the locked door"
    ],
    "answer": 2,
    "fact": "Fresh tool marks and debris justify inspecting the vent. Related principle: examine candles and light sources and verify the route with physical tests."
  }
];
