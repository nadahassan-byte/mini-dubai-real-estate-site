// Illustrative Dubai property listings. Prices in AED.
const LISTINGS = [
  {
    id: 1,
    title: "Burj-view 2BR Apartment",
    type: "Apartment",
    area: "Downtown Dubai",
    price: 2950000,
    beds: 2, baths: 3, size: 1280,
    status: "For Sale",
    img: "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=900&q=70",
    blurb: "High-floor apartment with uninterrupted Burj Khalifa and fountain views, floor-to-ceiling glass and a fitted Italian kitchen."
  },
  {
    id: 2,
    title: "Marina Front Penthouse",
    type: "Penthouse",
    area: "Dubai Marina",
    price: 8400000,
    beds: 4, baths: 5, size: 3650,
    status: "For Sale",
    img: "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=900&q=70",
    blurb: "Duplex penthouse wrapping the marina skyline, private terrace with plunge pool and a double-height living space."
  },
  {
    id: 3,
    title: "Signature Villa on the Palm",
    type: "Villa",
    area: "Palm Jumeirah",
    price: 22500000,
    beds: 5, baths: 6, size: 7200,
    status: "For Sale",
    img: "https://images.unsplash.com/photo-1613977257363-707ba9348227?auto=format&fit=crop&w=900&q=70",
    blurb: "Beachfront villa with private sandy frontage, infinity pool and direct Atlantis views across the Arabian Gulf."
  },
  {
    id: 4,
    title: "Cosy Studio in JVC",
    type: "Apartment",
    area: "Jumeirah Village Circle",
    price: 52000,
    beds: 0, baths: 1, size: 410,
    status: "For Rent",
    img: "https://images.unsplash.com/photo-1493809842364-78817add7ffb?auto=format&fit=crop&w=900&q=70",
    blurb: "Bright, efficient studio in a quiet community with pool, gym and easy access to Al Khail Road. Annual rent."
  },
  {
    id: 5,
    title: "Business Bay 1BR with Canal View",
    type: "Apartment",
    area: "Business Bay",
    price: 1650000,
    beds: 1, baths: 2, size: 760,
    status: "For Sale",
    img: "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=900&q=70",
    blurb: "Modern one-bedroom overlooking the Dubai Water Canal, walkable to Bay Avenue and a short hop to Downtown."
  },
  {
    id: 6,
    title: "Contemporary Villa in Arabian Ranches",
    type: "Villa",
    area: "Arabian Ranches",
    price: 6200000,
    beds: 4, baths: 4, size: 4100,
    status: "For Sale",
    img: "https://images.unsplash.com/photo-1568605114967-8130f3a36994?auto=format&fit=crop&w=900&q=70",
    blurb: "Family villa with landscaped garden, maid's room and golf-course community amenities including schools and parks."
  },
  {
    id: 7,
    title: "Sky Penthouse, Business Bay",
    type: "Penthouse",
    area: "Business Bay",
    price: 11900000,
    beds: 3, baths: 4, size: 2980,
    status: "For Sale",
    img: "https://images.unsplash.com/photo-1567496898669-ee935f5f647a?auto=format&fit=crop&w=900&q=70",
    blurb: "Full-floor penthouse with wraparound balcony, smart-home system and panoramic views of the Downtown skyline."
  },
  {
    id: 8,
    title: "Marina 2BR — Furnished",
    type: "Apartment",
    area: "Dubai Marina",
    price: 145000,
    beds: 2, baths: 2, size: 1150,
    status: "For Rent",
    img: "https://images.unsplash.com/photo-1502005229762-cf1b2da7c5d6?auto=format&fit=crop&w=900&q=70",
    blurb: "Fully furnished two-bedroom steps from the Marina Walk, tram and JBR beach. Annual rent, chiller free."
  },
  {
    id: 9,
    title: "Garden Villa, Palm Jumeirah",
    type: "Villa",
    area: "Palm Jumeirah",
    price: 18000000,
    beds: 4, baths: 5, size: 5600,
    status: "For Sale",
    img: "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=900&q=70",
    blurb: "Renovated garden-home villa on a frond, private pool, open-plan living and a chef's kitchen with island."
  }
];
