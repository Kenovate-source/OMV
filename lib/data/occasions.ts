// Complete the Look's occasion architecture. Adding a new occasion is a
// one-line addition to a category's `occasions` array — no component
// changes needed. Curated looks (below) are a separate, smaller mapping
// so an occasion can exist in the browsable catalogue before a specific
// curated look has been built for it (see CURATED_LOOKS).

export interface OccasionCategory {
  name: string;
  occasions: string[];
}

export const OCCASION_CATALOGUE: OccasionCategory[] = [
  {
    name: "Everyday",
    occasions: [
      "Casual", "Everyday Wear", "Weekend", "Errands", "Shopping", "Brunch",
      "Lunch", "Dinner", "Date Night", "Movie Night", "Hangout", "House Party",
    ],
  },
  {
    name: "Work & Professional",
    occasions: [
      "Office", "Business Meeting", "Business Casual", "Job Interview",
      "Conference", "Networking", "Corporate Event", "Work Dinner",
      "Presentation", "Company Party",
    ],
  },
  {
    name: "Weddings & Celebrations",
    occasions: [
      "Wedding Guest", "Traditional Wedding", "White Wedding", "Engagement",
      "Introduction Ceremony", "Bridal Shower", "Bachelor/Bachelorette Event",
      "Anniversary", "Birthday", "Birthday Dinner", "Baby Shower",
      "Naming Ceremony", "Graduation", "Prom", "Award Ceremony",
    ],
  },
  {
    name: "Religious",
    occasions: [
      "Church", "Sunday Service", "Church Wedding", "Church Event", "Mosque",
      "Friday Prayer", "Religious Celebration", "Religious Festival",
    ],
  },
  {
    name: "Travel & Vacation",
    occasions: [
      "Beach", "Resort", "Poolside", "Vacation", "City Tour", "Road Trip",
      "Airport / Travel Day", "Picnic", "Camping", "Cruise",
    ],
  },
  {
    name: "School",
    occasions: [
      "School", "University", "Lecture", "Campus Hangout", "School Event",
      "Graduation", "School Party",
    ],
  },
  {
    name: "Sports & Active",
    occasions: [
      "Gym", "Running", "Football", "Basketball", "Tennis", "Hiking",
      "Cycling", "Yoga", "Workout", "Outdoor Activities",
    ],
  },
  {
    name: "Special Nights",
    occasions: [
      "Romantic Date", "Fine Dining", "Gala", "Red Carpet", "Cocktail Event",
      "Night Out", "Club", "Concert", "Theatre", "Fashion Event",
    ],
  },
  {
    name: "Formal",
    occasions: [
      "Black Tie", "White Tie", "Formal Dinner", "Awards", "Charity Event",
      "Luxury Event", "Reception",
    ],
  },
  {
    name: "Cultural & Traditional",
    occasions: [
      "Traditional Ceremony", "Cultural Festival", "Cultural Event",
      "Family Gathering", "Festival", "Heritage Celebration",
    ],
  },
];

export interface CuratedLook {
  dress?: string;
  top?: string;
  shirt?: string;
  jacket?: string;
  trousers?: string;
  skirt?: string;
  traditionalWear?: string;
  shoes?: string;
  bag?: string;
  headwear?: string;
  accessory?: string;
}

// Only a subset of occasions have a hand-curated look today, matched to
// what's actually in the (small, mock) catalogue — the browsable occasion
// list above is intentionally much larger than this, and occasions
// without a curated look yet get an honest "not curated yet" state rather
// than a fabricated one. Expanding this as the catalogue grows is a
// data-only change.
export const CURATED_LOOKS: Record<string, CuratedLook> = {
  "Wedding Guest": {
    dress: "w-emerald-wrap-dress",
    bag: "a-gold-clutch",
    headwear: "w-heritage-headwrap",
  },
  "Church": {
    dress: "w-emerald-wrap-dress",
    headwear: "w-heritage-headwrap",
  },
  "Sunday Service": {
    dress: "w-emerald-wrap-dress",
    headwear: "w-heritage-headwrap",
  },
  "Office": {
    shirt: "m-linen-shirt",
    trousers: "m-tailored-chino",
    accessory: "m-leather-belt",
  },
  "Business Casual": {
    shirt: "m-linen-shirt",
    trousers: "m-tailored-chino",
    accessory: "m-leather-belt",
  },
  "Everyday Wear": {
    top: "w-ivory-blouse",
    trousers: "w-tailored-trouser",
  },
  "Weekend": {
    top: "w-ivory-blouse",
    trousers: "w-tailored-trouser",
  },
  "Birthday": {
    top: "w-ivory-blouse",
    trousers: "w-tailored-trouser",
    bag: "a-gold-clutch",
  },
};
