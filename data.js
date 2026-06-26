// Illustrative Dubai property listings (made-up sample data). Prices in AED.
const LISTINGS = [
  {
    id: 1,
    title: "Burj-view 2BR Apartment",
    type: "Apartment",
    area: "Downtown Dubai",
    price: 2950000,
    beds: 2, baths: 3, size: 1280,
    status: "For Sale",
    featured: true,
    img: "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1100&q=75",
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
    featured: true,
    img: "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1100&q=75",
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
    featured: true,
    img: "https://images.unsplash.com/photo-1613977257363-707ba9348227?auto=format&fit=crop&w=1100&q=75",
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
    img: "https://images.unsplash.com/photo-1493809842364-78817add7ffb?auto=format&fit=crop&w=1100&q=75",
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
    featured: true,
    img: "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=1100&q=75",
    blurb: "Modern one-bedroom overlooking the Dubai Water Canal, walkable to Bay Avenue and a short hop to Downtown."
  },
  {
    id: 6,
    title: "Contemporary Villa, Arabian Ranches",
    type: "Villa",
    area: "Arabian Ranches",
    price: 6200000,
    beds: 4, baths: 4, size: 4100,
    status: "For Sale",
    img: "https://images.unsplash.com/photo-1568605114967-8130f3a36994?auto=format&fit=crop&w=1100&q=75",
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
    featured: true,
    img: "https://images.unsplash.com/photo-1567496898669-ee935f5f647a?auto=format&fit=crop&w=1100&q=75",
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
    img: "https://images.unsplash.com/photo-1502005229762-cf1b2da7c5d6?auto=format&fit=crop&w=1100&q=75",
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
    featured: true,
    img: "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=1100&q=75",
    blurb: "Renovated garden-home villa on a frond, private pool, open-plan living and a chef's kitchen with island."
  },
  {
    id: 10,
    title: "Mansion in Emirates Hills",
    type: "Villa",
    area: "Emirates Hills",
    price: 45000000,
    beds: 7, baths: 9, size: 14500,
    status: "For Sale",
    featured: true,
    img: "https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&w=1100&q=75",
    blurb: "Bespoke lakeside mansion in Dubai's most prestigious gated community, with cinema, spa and resort-style gardens."
  },
  {
    id: 11,
    title: "Townhouse in Dubai Hills",
    type: "Townhouse",
    area: "Dubai Hills Estate",
    price: 4350000,
    beds: 3, baths: 4, size: 2400,
    status: "For Sale",
    img: "https://images.unsplash.com/photo-1576941089067-2de3c901e126?auto=format&fit=crop&w=1100&q=75",
    blurb: "Bright corner townhouse facing the park, with a private garden, two parking bays and access to Dubai Hills Mall."
  },
  {
    id: 12,
    title: "DIFC Loft Apartment",
    type: "Apartment",
    area: "DIFC",
    price: 3200000,
    beds: 2, baths: 2, size: 1420,
    status: "For Sale",
    img: "https://images.unsplash.com/photo-1502005097973-6a7082348e28?auto=format&fit=crop&w=1100&q=75",
    blurb: "Industrial-luxe loft in the financial district, double-height windows, walkable to galleries and fine dining."
  },
  {
    id: 13,
    title: "JBR Beachfront 3BR",
    type: "Apartment",
    area: "Jumeirah Beach Residence",
    price: 5600000,
    beds: 3, baths: 4, size: 1980,
    status: "For Sale",
    img: "https://images.unsplash.com/photo-1493809842364-78817add7ffb?auto=format&fit=crop&w=1100&q=75",
    blurb: "Direct beach-access apartment on The Walk, full sea views, upgraded interiors and a wraparound balcony."
  },
  {
    id: 14,
    title: "Penthouse on the Palm",
    type: "Penthouse",
    area: "Palm Jumeirah",
    price: 31000000,
    beds: 4, baths: 5, size: 6100,
    status: "For Sale",
    featured: true,
    img: "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1100&q=75",
    blurb: "Sky-mansion penthouse with private pool, 360° sea and skyline views and a dedicated lift lobby."
  },
  {
    id: 15,
    title: "Family Villa, Dubai Hills",
    type: "Villa",
    area: "Dubai Hills Estate",
    price: 9750000,
    beds: 5, baths: 6, size: 6200,
    status: "For Sale",
    img: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1100&q=75",
    blurb: "Modern family villa backing the golf course, with a basement, elevator, home gym and landscaped pool deck."
  },
  {
    id: 16,
    title: "Downtown 3BR Residence",
    type: "Apartment",
    area: "Downtown Dubai",
    price: 6900000,
    beds: 3, baths: 4, size: 2150,
    status: "For Sale",
    img: "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1100&q=75",
    blurb: "Corner residence in a landmark tower, Opera District views, branded interiors and full hotel-style service."
  }
];

// Expose for all pages
window.LISTINGS = LISTINGS;
