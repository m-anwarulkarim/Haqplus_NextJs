export interface BDDistrict {
  id: string;
  name: string;
  divisionId: string;
  areas: string[];
}

export interface BDDivision {
  id: string;
  name: string;
  districts: string[];
}

export const BD_DIVISIONS: BDDivision[] = [
  {
    id: "dhaka",
    name: "Dhaka",
    districts: [
      "Dhaka",
      "Gazipur",
      "Narayanganj",
      "Tangail",
      "Narsingdi",
      "Manikganj",
      "Munshiganj",
      "Faridpur",
      "Madaripur",
      "Gopalganj",
      "Rajbari",
      "Shariatpur",
      "Kishoreganj",
    ],
  },
  {
    id: "chattogram",
    name: "Chattogram",
    districts: [
      "Chattogram",
      "Cox's Bazar",
      "Cumilla",
      "Feni",
      "Brahmanbaria",
      "Noakhali",
      "Chandpur",
      "Lakshmipur",
      "Rangamati",
      "Khagrachhari",
      "Bandarban",
    ],
  },
  {
    id: "rajshahi",
    name: "Rajshahi",
    districts: [
      "Rajshahi",
      "Bogura",
      "Pabna",
      "Sirajganj",
      "Naogaon",
      "Natore",
      "Chapainawabganj",
      "Joypurhat",
    ],
  },
  {
    id: "khulna",
    name: "Khulna",
    districts: [
      "Khulna",
      "Jashore",
      "Kushtia",
      "Satkhira",
      "Bagerhat",
      "Jhenaidah",
      "Chuadanga",
      "Magura",
      "Meherpur",
      "Narail",
    ],
  },
  {
    id: "barishal",
    name: "Barishal",
    districts: [
      "Barishal",
      "Patuakhali",
      "Bhola",
      "Pirojpur",
      "Barguna",
      "Jhalokathi",
    ],
  },
  {
    id: "sylhet",
    name: "Sylhet",
    districts: ["Sylhet", "Moulvibazar", "Habiganj", "Sunamganj"],
  },
  {
    id: "rangpur",
    name: "Rangpur",
    districts: [
      "Rangpur",
      "Dinajpur",
      "Kurigram",
      "Gaibandha",
      "Nilphamari",
      "Lalmonirhat",
      "Thakurgaon",
      "Panchagarh",
    ],
  },
  {
    id: "mymensingh",
    name: "Mymensingh",
    districts: ["Mymensingh", "Jamalpur", "Netrokona", "Sherpur"],
  },
];

export const BD_POPULAR_AREAS: Record<string, string[]> = {
  Dhaka: [
    "Dhanmondi",
    "Gulshan-1",
    "Gulshan-2",
    "Banani",
    "Uttara",
    "Mirpur",
    "Mohammadpur",
    "Bashundhara R/A",
    "Badda",
    "Khilgaon",
    "Motijheel",
    "Malibagh",
    "Rampura",
    "Tejgaon",
    "Shahbagh",
    "Old Dhaka",
    "Baridhara",
    "Nikunja",
    "Jatrabari",
  ],
  Gazipur: ["Tongi", "Chowrasta", "Joydebpur", "Board Bazar", "Konabari"],
  Narayanganj: ["Chashara", "Fatullah", "Siddhirganj", "Bandar", "Kanchpur"],
  Chattogram: [
    "Agrabad",
    "GEC Circle",
    "Nasirabad",
    "Halishahar",
    "Khulshi",
    "Chawkbazar",
    "Panchlaish",
    "Pahartali",
    "Bakalia",
    "Kotwali",
  ],
  Rajshahi: ["Kazihata", "Shaheb Bazar", "Boalia", "Motihar", "Rajpara"],
  Khulna: ["Sonadanga", "Boyra", "Khalishpur", "Daulatpur", "Shibbari"],
  Sylhet: ["Zindabazar", "Ambarkhana", "Upashahar", "Subidbazar", "Shahi Eidgah"],
  Bogura: ["Shatmatha", "Jaleshwaritola", "Thonthonia", "Banani"],
  Cumilla: ["Kandirpar", "Badur Tola", "Shasongachha", "Kotbari"],
};

export function getDistrictsByDivision(divisionName: string): string[] {
  const division = BD_DIVISIONS.find(
    (d) => d.name.toLowerCase() === divisionName.toLowerCase()
  );
  return division ? division.districts : [];
}

export function getAreasByDistrict(districtName: string): string[] {
  if (BD_POPULAR_AREAS[districtName]) {
    return BD_POPULAR_AREAS[districtName];
  }
  return ["Sadar / Central", "North Suburb", "South Suburb", "Outer Area"];
}
