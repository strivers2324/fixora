interface LocationDataType {
  districts: string[];
  areas: { [key: string]: string[] };
  subAreas: { [key: string]: string[] };
}

export const LOCATION_DATA: LocationDataType = {
  districts: ["Dhaka"],

  areas: {
    Dhaka: [
      "Adabor",
      "Badda",
      "Bangshal",
      "Biman Bandar",
      "Cantonment",
      "Chawkbazar",
      "Dakshinkhan",
      "Darus Salam",
      "Demra",
      "Dhanmondi",
      "Gazipur Sadar",
      "Gendaria",
      "Gulshan",
      "Hazaribagh",
      "Jatrabari",
      "Kadamtali",
      "Kafrul",
      "Kalabagan",
      "Kamrangirchar",
      "Keraniganj",
      "Khilgaon",
      "Khilkhet",
      "Kotwali",
      "Lalbagh",
      "Mirpur-1",
      "Mirpur-2",
      "Mirpur-10",
      "Mirpur-11",
      "Mirpur-11.5",
      "Mirpur-14",
      "Mohammadpur",
      "Motijheel",
      "Narayanganj Sadar",
      "New Market",
      "Pallabi",
      "Paltan",
      "Ramna",
      "Rampura",
      "Sabujbagh",
      "Savar",
      "Shahbagh",
      "Sher-e-Bangla Nagar",
      "Shyampur",
      "Sutrapur",
      "Tejgaon",
      "Tejgaon Industrial Area",
      "Turag",
      "Uttara",
    ],
  },

  subAreas: {
    Adabor: ["Adabor 1-17", "Baitul Aman Housing", "Shekhertek", "Sunibir Housing", "Monsehwar Road"],

    Badda: ["North Badda", "South Badda", "Merul Badda", "Aftabnagar", "Middle Badda", "Badda Link Road"],

    Bangshal: ["Bangshal Road", "Nazira Bazar", "Alubazar", "English Road", "Phulbaria"],

    "Biman Bandar": ["Airport Terminal 1 & 2", "Haji Camp", "Kawla", "Ashkona", "Airport Railway Station"],

    Cantonment: ["Manikdi", "Matikata", "Vashantek", "ECB Chattar", "Garrison Area"],

    Chawkbazar: ["Chawkbazar Shahi Mosque", "Urdu Road", "Water Works Road", "Bakshibazar", "Khaje Dewan"],

    Dakshinkhan: ["Dakshinkhan Bazar", "Faydabad", "Azampur", "Mollartek", "Gawair"],

    "Darus Salam": ["Gabtoli", "Technical Mor", "Lalkuthi", "Darus Salam Road", "Bordhon Bari"],

    Demra: ["Staff Quarter", "Sarulia", "Konapara", "Amulia", "Bamail"],

    Dhanmondi: [
      "Road 27 (Old)",
      "Road 32",
      "Road 15",
      "Satmasjid Road",
      "Shimanto Square",
      "Jhigatola",
      "Dhanmondi Lake",
    ],

    "Gazipur Sadar": ["Joydebpur", "Gazipur Chowrasta", "Board Bazar", "National University", "Salna"],

    Gendaria: ["Gendaria Rail Station", "Dhupkhola Field", "Satis Sarkar Road", "Faridabad", "Doyaganj"],

    Gulshan: ["Gulshan 1", "Gulshan 2", "Niketan", "Shooting Club", "Police Plaza", "Gudaraghat"],

    Hazaribagh: ["Tanneries Area (Old)", "Rayer Bazar", "Mitali Road", "Section", "Goajairbagh"],

    Jatrabari: ["Jatrabari Mor", "Sayedabad", "Dholairpar", "Bibir Bagicha", "Kazla"],

    Kadamtali: ["Matuail", "Dania", "Rayerbag", "Merajnagar", "Shanir Akhra"],

    Kafrul: ["Ibrahimpur", "North Kafrul", "Shewrapara (Part)", "Kazipara (Part)"],

    Kalabagan: ["Panthapath", "Green Road (South)", "Kathalbagan", "Lake Circus", "Dolphin Goli"],

    Kamrangirchar: ["Ashrafabad", "Borogram", "Lohar Pool", "Company Ghat", "Nawabganj Section"],

    Keraniganj: ["Jinjira", "Aganagar", "Kaliganj", "Hasnabad", "Kadamtoli (Keraniganj)"],

    Khilgaon: ["Khilgaon Chowdhury Para", "Taltola", "Goran", "Sipahibagh", "Tilpapara", "Nandipara"],

    Khilkhet: ["Nikunja 1", "Nikunja 2", "Khilkhet Bazar", "Namapara", "Tanpara"],

    Kotwali: ["Babubazar", "Islampur", "Badamtoli", "Ahsan Manzil Area", "Mitford"],

    Lalbagh: ["Lalbagh Fort", "Kellamore", "Azimpur", "Pilkhana", "Dhakeshwari"],

    "Mirpur-1": ["Sony Cinema Hall", "Zoo Road", "Box Nagar", "Ansar Camp", "Mazar Road"],
    "Mirpur-2": ["Mirpur Stadium", "Commerce College", "Love Road", "Proshika Mor"],
    "Mirpur-10": ["Mirpur 10 Gol Chattar", "Fire Service", "Benarosi Palli", "Senpara Parbata"],
    "Mirpur-11": ["Mirpur 11 Bazar", "Avenue 5", "Nannu Market", "Paris Road"],
    "Mirpur-11.5": ["Purobi", "Pallabi Extension", "Sagufta", "Kalshi (North)"],
    "Mirpur-14": ["Kochukhet", "BRP Gate", "Dental College", "Cantonment Side"],

    Mohammadpur: ["Town Hall", "Tajmahal Road", "Humayun Road", "Bosila", "Japan Garden City", "Mohammadpur Housing"],

    Motijheel: ["Shapla Chattar", "Dilkusha", "Arambagh", "Fakirapool", "Kamalapur"],

    "Narayanganj Sadar": ["Chashara", "Nitaiganj", "Tanbazar", "Khanpur", "Ukilpara"],

    "New Market": ["New Market", "Nilkhet", "Elephant Road", "Katabon", "Bata Signal"],

    Pallabi: ["Mirpur 12", "Kalshi New Road", "Muslim Bazar", "Pallabi Thana Area"],

    Paltan: ["Purana Paltan", "Naya Paltan", "Bijoy Nagar", "Segunbagicha", "Topkhana Road"],

    Ramna: ["Bailey Road", "Moghbazar", "Eskaton", "Siddheswari", "Ramna Park Area"],

    Rampura: ["Rampura TV Center", "Banassree", "Mahanagar Project", "Ulon", "Wapda Road"],

    Sabujbagh: ["Basabo", "Madartek", "Mugdapara", "Rajarbagh", "Kamalapur (East)"],

    Savar: ["Savar Bazar", "Hemayetpur", "EPZ Area", "Jahangirnagar Univ. Area", "Radio Colony"],

    Shahbagh: ["Shahbagh Mor", "Dhaka University", "PG Hospital Area", "Aziz Super Market"],

    "Sher-e-Bangla Nagar": ["Agargaon", "West Agargaon", "Shishu Mela", "Passport Office Area", "Taltola"],

    Shyampur: ["Jurain", "Postogola", "IG Gate", "Karimullahbagh"],

    Sutrapur: ["Laxmibazar", "Dholaikhal", "Rokonpur", "Kagojitola"],

    Tejgaon: ["Farmgate", "Tejturibazar", "Monipuri Para", "Tejgaon Railgate"],

    "Tejgaon Industrial Area": ["Satrasta", "Nabisco", "Kunipara", "Begunbari", "Tejgaon Link Road"],

    Turag: ["Diabari", "Baunia", "Uttara Sector 16 & 18", "Kamarpara"],

    Uttara: ["Sector 1-14", "Uttara Model Town", "Sonargaon Janapath", "Jashimuddin", "House Building"],
  },
};
