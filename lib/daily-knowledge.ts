export type DailyGKQuestion = { id: string; question: string; answer: string };
const capitals: [string, string][] = [
["Afghanistan","Kabul"],["Albania","Tirana"],["Algeria","Algiers"],["Andorra","Andorra la Vella"],["Angola","Luanda"],["Argentina","Buenos Aires"],["Armenia","Yerevan"],["Australia","Canberra"],["Austria","Vienna"],["Azerbaijan","Baku"],
["Bahamas","Nassau"],["Bahrain","Manama"],["Bangladesh","Dhaka"],["Barbados","Bridgetown"],["Belarus","Minsk"],["Belgium","Brussels"],["Belize","Belmopan"],["Benin","Porto-Novo"],["Bhutan","Thimphu"],["Bolivia","Sucre"],
["Bosnia and Herzegovina","Sarajevo"],["Botswana","Gaborone"],["Brazil","Brasilia"],["Brunei","Bandar Seri Begawan"],["Bulgaria","Sofia"],["Burkina Faso","Ouagadougou"],["Burundi","Gitega"],["Cambodia","Phnom Penh"],["Cameroon","Yaounde"],["Canada","Ottawa"],
["Cape Verde","Praia"],["Central African Republic","Bangui"],["Chad","N'Djamena"],["Chile","Santiago"],["China","Beijing"],["Colombia","Bogota"],["Comoros","Moroni"],["Costa Rica","San Jose"],["Croatia","Zagreb"],["Cuba","Havana"],
["Cyprus","Nicosia"],["Czechia","Prague"],["Democratic Republic of the Congo","Kinshasa"],["Denmark","Copenhagen"],["Djibouti","Djibouti"],["Dominica","Roseau"],["Dominican Republic","Santo Domingo"],["Ecuador","Quito"],["Egypt","Cairo"],["El Salvador","San Salvador"],
["Equatorial Guinea","Malabo"],["Eritrea","Asmara"],["Estonia","Tallinn"],["Eswatini","Mbabane"],["Ethiopia","Addis Ababa"],["Fiji","Suva"],["Finland","Helsinki"],["France","Paris"],["Gabon","Libreville"],["Gambia","Banjul"],
["Georgia","Tbilisi"],["Germany","Berlin"],["Ghana","Accra"],["Greece","Athens"],["Grenada","Saint George's"],["Guatemala","Guatemala City"],["Guinea","Conakry"],["Guinea-Bissau","Bissau"],["Guyana","Georgetown"],["Haiti","Port-au-Prince"],
["Honduras","Tegucigalpa"],["Hungary","Budapest"],["Iceland","Reykjavik"],["India","New Delhi"],["Indonesia","Jakarta"],["Iran","Tehran"],["Iraq","Baghdad"],["Ireland","Dublin"],["Israel","Jerusalem"],["Italy","Rome"],
["Jamaica","Kingston"],["Japan","Tokyo"],["Jordan","Amman"],["Kazakhstan","Astana"],["Kenya","Nairobi"],["Kiribati","South Tarawa"],["Kuwait","Kuwait City"],["Kyrgyzstan","Bishkek"],["Laos","Vientiane"],["Latvia","Riga"],
["Lebanon","Beirut"],["Lesotho","Maseru"],["Liberia","Monrovia"],["Libya","Tripoli"],["Liechtenstein","Vaduz"],["Lithuania","Vilnius"],["Luxembourg","Luxembourg"],["Madagascar","Antananarivo"],["Malawi","Lilongwe"],["Malaysia","Kuala Lumpur"]
];
const forms = [
  (country: string) => `What is the capital city of ${country}?`,
  (country: string) => `Which city is the national capital of ${country}?`,
  (country: string) => `Name the capital of ${country}.`,
  (country: string) => `Which city serves as ${country}'s capital?`
];
export const DAILY_GK_QUESTIONS: DailyGKQuestion[] = capitals.flatMap(([country, answer]) => forms.map((form, variant) => {
  const question = form(country);
  return { id: `capital-${country.toLowerCase().replace(/[^a-z0-9]+/g,"-")}-${variant}`, question, answer };
}));
export function getDailyGKQuestion(date = new Date()): DailyGKQuestion {
  const start = Date.UTC(date.getUTCFullYear(), 0, 1);
  const dayIndex = Math.floor((Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()) - start) / 86400000);
  return DAILY_GK_QUESTIONS[((dayIndex % DAILY_GK_QUESTIONS.length) + DAILY_GK_QUESTIONS.length) % DAILY_GK_QUESTIONS.length];
}
