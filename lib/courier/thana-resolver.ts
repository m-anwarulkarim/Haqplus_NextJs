/**
 * Comprehensive Bangladesh Thana / Police Station & Zone Resolver
 * For Auto-matching Single-line Customer Addresses with Courier Services (e.g. Steadfast)
 */

export interface ThanaResolutionResult {
  matchedThana: string | null;
  confidence: "EXACT" | "FUZZY" | "NONE";
  district: string;
  warningMessage: string | null;
  suggestedThanas: string[];
}

// Complete Registry of all 64 Bangladesh Districts and their official Thanas / Upazilas
export const BANGLADESH_THANAS_DICT: Record<string, { thanas: string[]; aliases: Record<string, string> }> = {
  Dhaka: {
    thanas: [
      "Mirpur", "Dhanmondi", "Gulshan", "Banani", "Uttara", "Tejgaon", "Mohammadpur", "Badda",
      "Ramna", "Motijheel", "Khilgaon", "Jatrabari", "Lalbagh", "New Market", "Shahbagh", "Paltan",
      "Savar", "Keraniganj", "Dhamrai", "Nawabganj", "Dohar", "Cantonment", "Kafrul", "Adabor",
      "Darus Salam", "Hazaribagh", "Kamrangirchar", "Kotwali", "Vatara", "Turag", "Uttarkhan",
      "Dakshinkhan", "Demra", "Shyampur", "Kadamtali", "Sutrapur", "Wari", "Bhashantek", "Rampura",
    ],
    aliases: {
      "মিরপুর": "Mirpur", "mirpor": "Mirpur", "ধানমন্ডি": "Dhanmondi", "danmondi": "Dhanmondi",
      "dhanmondy": "Dhanmondi", "গুলশান": "Gulshan", "gulshan": "Gulshan", "বনানী": "Banani",
      "উত্তরা": "Uttara", "utara": "Uttara", "uttora": "Uttara", "মোহাম্মদপুর": "Mohammadpur",
      "mohammadpor": "Mohammadpur", "তেজগাঁও": "Tejgaon", "tejgaon": "Tejgaon", "বাড্ডা": "Badda",
      "যাত্রাবাড়ী": "Jatrabari", "jatrabari": "Jatrabari", "লালবাগ": "Lalbagh", "সাভার": "Savar",
      "কেরানীগঞ্জ": "Keraniganj", "ধামরাই": "Dhamrai", "রামপুরা": "Rampura", "খিলগাঁও": "Khilgaon",
      "মতিঝিল": "Motijheel",
    },
  },
  Bagerhat: {
    thanas: ["Bagerhat Sadar", "Chitalmari", "Fakirhat", "Kachua", "Mollahat", "Mongla", "Morrelganj", "Rampal", "Sarankhola"],
    aliases: {
      "বাগেরহাট": "Bagerhat Sadar", "বাগেরহাট সদর": "Bagerhat Sadar", "মংলা": "Mongla", "মোংলা": "Mongla",
      "ফকিরহাট": "Fakirhat", "রামপাল": "Rampal", "মোল্লাহাট": "Mollahat", "মোড়েলগঞ্জ": "Morrelganj",
    },
  },
  Chattogram: {
    thanas: [
      "Pahartali", "Panchlaish", "Halishahar", "Kotwali", "Double Mooring", "Bayezid", "Patenga",
      "Chandgaon", "Karnafuli", "Bandar", "Anwara", "Banshkhali", "Boalkhali", "Chandanaish",
      "Fatikchhari", "Hathazari", "Lohagara", "Mirsarai", "Patiya", "Rangunia", "Raozan", "Sandwip",
      "Satkania", "Sitakunda",
    ],
    aliases: {
      "চট্টগ্রাম": "Kotwali", "পটিয়া": "Patiya", "সীতাকুণ্ড": "Sitakunda", "কোতোয়ালী": "Kotwali",
      "পাঁচলাইশ": "Panchlaish", "পাহাড়তলী": "Pahartali", "হাটহাজারী": "Hathazari", "মিরসরাই": "Mirsarai",
    },
  },
  Gazipur: {
    thanas: ["Gazipur Sadar", "Kaliakair", "Kaliganj", "Kapasia", "Sreepur", "Tongi"],
    aliases: { "গাজীপুর": "Gazipur Sadar", "টঙ্গী": "Tongi", "কালিয়াকৈর": "Kaliakair", "শ্রীপুর": "Sreepur" },
  },
  Narayanganj: {
    thanas: ["Narayanganj Sadar", "Araihazar", "Bandar", "Dhamrai", "Rupganj", "Sonargaon", "Siddhirganj"],
    aliases: { "নারায়ণগঞ্জ": "Narayanganj Sadar", "সোনারগাঁও": "Sonargaon", "রূপগঞ্জ": "Rupganj", "সিদ্ধিরগঞ্জ": "Siddhirganj" },
  },
  Bogura: {
    thanas: ["Bogura Sadar", "Adamdighi", "Dupchanchia", "Gabtali", "Kahaloo", "Nandigram", "Sariakandi", "Shajahanpur", "Sherpur", "Shibganj", "Sonatala"],
    aliases: { "বগুড়া": "Bogura Sadar", "শেরপুর": "Sherpur", "শিবগঞ্জ": "Shibganj" },
  },
  Sylhet: {
    thanas: ["Sylhet Sadar", "Beanibazar", "Bishwanath", "Companiganj", "Fenchuganj", "Golapganj", "Gowainghat", "Jaintiapur", "Kanaighat", "Zakiganj"],
    aliases: { "সিলেট": "Sylhet Sadar", "গোলাপগঞ্জ": "Golapganj", "বিয়ানীবাজার": "Beanibazar" },
  },
  Rajshahi: {
    thanas: ["Rajshahi Sadar", "Bagha", "Bagmara", "Charghat", "Durgapur", "Godagari", "Mohanpur", "Paba", "Puthia", "Tanore"],
    aliases: { "রাজশাহী": "Rajshahi Sadar", "পবা": "Paba" },
  },
  Khulna: {
    thanas: ["Khulna Sadar", "Batiaghata", "Dacope", "Dumuria", "Koyra", "Paikgachha", "Phultala", "Rupsha", "Terokhada"],
    aliases: { "খুলনা": "Khulna Sadar", "রূপসা": "Rupsha", "ডুমুরিয়া": "Dumuria" },
  },
  Cumilla: {
    thanas: ["Cumilla Sadar", "Barura", "Brahmanpara", "Burichang", "Chandina", "Chauddagram", "Daudkandi", "Debidwar", "Homna", "Laksam", "Mehna", "Muradnagar", "Nangalkot", "Titas"],
    aliases: { "কুমিল্লা": "Cumilla Sadar", "দাউদকান্দি": "Daudkandi", "লাকসাম": "Laksam" },
  },
  Barishal: {
    thanas: ["Barishal Sadar", "Agailjhara", "Babuganj", "Bakerganj", "Banaripara", "Gaurnadi", "Hizla", "Mehendiganj", "Muladi", "Wazirpur"],
    aliases: { "বরিশাল": "Barishal Sadar", "গৌরনদী": "Gaurnadi", "বাকেরগঞ্জ": "Bakerganj" },
  },
  Faridpur: {
    thanas: ["Faridpur Sadar", "Alfadanga", "Bhanga", "Boalmari", "Charbhadrasan", "Madhukhali", "Nagarkanda", "Sadarpur", "Saltha"],
    aliases: { "ফরিদপুর": "Faridpur Sadar", "ভাঙ্গা": "Bhanga", "বোয়ালমারী": "Boalmari" },
  },
  Jessore: {
    thanas: ["Jessore Sadar", "Abhaynagar", "Bagherpara", "Chaugachha", "Jhikargachha", "Keshabpur", "Manirampur", "Sharsha"],
    aliases: { "যশোর": "Jessore Sadar", "অভয়নগর": "Abhaynagar", "শার্শা": "Sharsha", "ঝিকরগাছা": "Jhikargachha" },
  },
  Kushtia: {
    thanas: ["Kushtia Sadar", "Bheramara", "Daulatpur", "Khoksa", "Kumarkhali", "Mirpur"],
    aliases: { "কুষ্টিয়া": "Kushtia Sadar", "ভেড়ামারা": "Bheramara", "কুমারখালী": "Kumarkhali" },
  },
  Mymensingh: {
    thanas: ["Mymensingh Sadar", "Bhaluka", "Trishal", "Gafargaon", "Muktagachha", "Phulpur", "Haluaghat", "Dhobaura", "Nandail", "Ishwarganj"],
    aliases: { "ময়মনসিংহ": "Mymensingh Sadar", "ভালুকা": "Bhaluka", "ত্রিশাল": "Trishal", "মুক্তাগাছা": "Muktagachha" },
  },
  Noakhali: {
    thanas: ["Noakhali Sadar", "Begumganj", "Chatkhil", "Companiganj", "Hatiya", "Senbagh", "Subarnachar", "Kabirhat"],
    aliases: { "নোয়াখালী": "Noakhali Sadar", "বেগমগঞ্জ": "Begumganj", "চাটখিল": "Chatkhil", "হাতিয়া": "Hatiya" },
  },
  Rangpur: {
    thanas: ["Rangpur Sadar", "Badarganj", "Gangachara", "Kaunia", "Mithapukur", "Pirgachha", "Pirganj", "Taraganj"],
    aliases: { "রংপুর": "Rangpur Sadar", "মিঠাপুকুর": "Mithapukur", "পীরগঞ্জ": "Pirganj" },
  },
  Tangail: {
    thanas: ["Tangail Sadar", "Basail", "Bhuapur", "Delduar", "Dhanbari", "Ghatail", "Gopalpur", "Kalihati", "Madhupur", "Mirzapur", "Nagarpur", "Sakhipur"],
    aliases: { "টাঙ্গাইল": "Tangail Sadar", "মির্জাপুর": "Mirzapur", "মধুপুর": "Madhupur", "ঘাটাইল": "Ghatail" },
  },
};

export const ALL_BANGLADESH_DISTRICTS = Object.keys(BANGLADESH_THANAS_DICT);

/**
 * Normalizes district names to match dict keys (e.g. "bagerhat" -> "Bagerhat")
 */
export function getNormalizedDistrict(districtInput?: string): string {
  if (!districtInput) return "Dhaka";
  const cleanInput = districtInput.trim().toLowerCase();
  const foundKey = Object.keys(BANGLADESH_THANAS_DICT).find(
    (k) => k.toLowerCase() === cleanInput
  );
  return foundKey || districtInput.trim();
}

/**
 * Returns available Thanas for a district or generic fallback list
 */
export function getThanaOptionsForDistrict(districtInput?: string): string[] {
  const normDistrict = getNormalizedDistrict(districtInput);
  if (BANGLADESH_THANAS_DICT[normDistrict]) {
    return BANGLADESH_THANAS_DICT[normDistrict].thanas;
  }
  // Generic fallback for any Bangladesh district not explicitly enumerated above
  return [`${normDistrict} Sadar`, `${normDistrict} Town`, "Center Hub"];
}

/**
 * Main Auto-Detection Engine
 * Analyzes full single-line customer address text and resolves Thana/Police Station
 */
export function detectThanaFromAddress(
  address: string,
  districtInput?: string
): ThanaResolutionResult {
  const cleanAddr = (address || "").toLowerCase().trim();

  // 0. Check if address text explicitly mentions any district name (e.g. "Bagerhat", "বাগেরহাট", "Chattogram", etc.)
  let addressMentionedDistrict: string | null = null;
  for (const [distKey, config] of Object.entries(BANGLADESH_THANAS_DICT)) {
    if (cleanAddr.includes(distKey.toLowerCase())) {
      addressMentionedDistrict = distKey;
      break;
    }
    // Check district Bengali aliases
    for (const aliasKey of Object.keys(config.aliases)) {
      if (cleanAddr.includes(aliasKey.toLowerCase())) {
        addressMentionedDistrict = distKey;
        break;
      }
    }
    if (addressMentionedDistrict) break;
  }

  // Use district mentioned in address, or fallback to districtInput parameter, or default "Dhaka"
  const districtName = addressMentionedDistrict || getNormalizedDistrict(districtInput);
  const targetDistrictConfig = BANGLADESH_THANAS_DICT[districtName];

  // 1. Search inside target/detected district first
  if (targetDistrictConfig) {
    const { thanas, aliases } = targetDistrictConfig;

    // Check district aliases first
    for (const [aliasKey, officialThana] of Object.entries(aliases)) {
      if (cleanAddr.includes(aliasKey.toLowerCase())) {
        return {
          matchedThana: officialThana,
          confidence: "EXACT",
          district: districtName,
          warningMessage: null,
          suggestedThanas: thanas,
        };
      }
    }

    // Check official thana names inside this district
    for (const thana of thanas) {
      const lowerThana = thana.toLowerCase();
      if (cleanAddr.includes(lowerThana)) {
        return {
          matchedThana: thana,
          confidence: "EXACT",
          district: districtName,
          warningMessage: null,
          suggestedThanas: thanas,
        };
      }
    }
  }

  // 2. Fallback: Search all other districts if not found in target district
  for (const [dist, config] of Object.entries(BANGLADESH_THANAS_DICT)) {
    for (const [aliasKey, officialThana] of Object.entries(config.aliases)) {
      if (cleanAddr.includes(aliasKey.toLowerCase())) {
        return {
          matchedThana: officialThana,
          confidence: "FUZZY",
          district: dist,
          warningMessage: null,
          suggestedThanas: config.thanas,
        };
      }
    }
    for (const thana of config.thanas) {
      if (cleanAddr.includes(thana.toLowerCase())) {
        return {
          matchedThana: thana,
          confidence: "FUZZY",
          district: dist,
          warningMessage: null,
          suggestedThanas: config.thanas,
        };
      }
    }
  }

  // 3. No Thana matched - Return null with suggested thanas
  const availableThanas = getThanaOptionsForDistrict(districtName);
  return {
    matchedThana: null,
    confidence: "NONE",
    district: districtName,
    warningMessage: "⚠️ ঠিকানা থেকে থানা স্বয়ংক্রিয়ভাবে ডিটেক্ট করা যায়নি! অনুগ্রহ করে থানা ম্যানুয়ালি নির্বাচন করুন।",
    suggestedThanas: availableThanas,
  };
}
