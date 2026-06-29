// Illustrative Dubai property listings (made-up sample data). Prices in AED.
// Photography: PRIME / betterhomes property shoots.
const P_ = "assets/props/";
const IMG = {
  living:    P_ + "1fkPuSuiUkcs4055pRbqy9txkMuHfUDdr.jpg",
  stairLiv:  P_ + "1-G8vp5y85vM8f71-9qJCfUFmyLt7oKYs.jpg",
  staircase: P_ + "1tYFkzWmd2fP1eJPg802tlnh57ApUBO8m.jpg",
  entrance:  P_ + "1wlh4htk834IBKv9uIAGWujzMb1RJlsHc.jpg",
  games:     P_ + "1h6YpmJcbW9r6MluU0xU8dt2ophUuD1xw.jpg",
  kitchen:   P_ + "1dOXt9Hwy64oHH0oJ19h1VZZSGWfjrUzy.jpg",
  lounge:    P_ + "1tDU4USMpOObW4kyzWUF3sSHfB7MUm3Q2.jpg",
  bedroom:   P_ + "11Bi9y5wylOEfY_y82eWA5MkuQrY-eKdU.jpg",
  gym:       P_ + "18mjRZ4iqp8HsMCwQDsp6vXHkutOHAaAP.jpg",
  garden:    P_ + "1IZglcj8FkipsZVq6yMzXuLaGP8KEG3nW.jpg",
  garden2:   P_ + "1e1ENawa1vz9hOKpaum9_NvQ7S-GyWR8L.jpg",
  kitchen2:  P_ + "1vxOomoVdc7tJmgoi3ogNzNhq4fYNyqsR.jpg",
  bath:      P_ + "1zOwWnmDgU4QN2li3psLbn_dL2d9NWhj1.jpg",
};
// Ordered pool used to build a small gallery for each property's detail page.
const IMG_POOL = [IMG.living, IMG.stairLiv, IMG.staircase, IMG.entrance, IMG.games, IMG.kitchen, IMG.lounge, IMG.bedroom, IMG.gym, IMG.garden, IMG.garden2, IMG.kitchen2, IMG.bath];

const LISTINGS = [
  { id: 1, title: "Burj-view 2BR Apartment", type: "Apartment", area: "Downtown Dubai", price: 2950000, beds: 2, baths: 3, size: 1280, status: "For Sale", featured: true, tag: "New listing", added: "2026-06-20", img: IMG.living,
    blurb: "High-floor apartment with uninterrupted Burj Khalifa and fountain views, floor-to-ceiling glass and a fitted Italian kitchen." },
  { id: 2, title: "Marina Front Penthouse", type: "Penthouse", area: "Dubai Marina", price: 8400000, beds: 4, baths: 5, size: 3650, status: "For Sale", featured: true, tag: "Exclusive", added: "2026-06-18", img: IMG.stairLiv,
    blurb: "Duplex penthouse wrapping the marina skyline, private terrace with plunge pool and a double-height living space." },
  { id: 3, title: "Signature Villa on the Palm", type: "Villa", area: "Palm Jumeirah", price: 22500000, beds: 5, baths: 6, size: 7200, status: "For Sale", featured: true, tag: "Architect designed", added: "2026-06-10", img: IMG.garden,
    blurb: "Beachfront villa with private sandy frontage, infinity pool and direct Atlantis views across the Arabian Gulf." },
  { id: 4, title: "Cosy Studio in JVC", type: "Apartment", area: "Jumeirah Village Circle", price: 52000, beds: 0, baths: 1, size: 410, status: "For Rent", tag: "New listing", added: "2026-06-22", img: IMG.bedroom,
    blurb: "Bright, efficient studio in a quiet community with pool, gym and easy access to Al Khail Road. Annual rent." },
  { id: 5, title: "Business Bay 1BR with Canal View", type: "Apartment", area: "Business Bay", price: 1650000, beds: 1, baths: 2, size: 760, status: "For Sale", featured: true, added: "2026-05-30", img: IMG.entrance,
    blurb: "Modern one-bedroom overlooking the Dubai Water Canal, walkable to Bay Avenue and a short hop to Downtown." },
  { id: 6, title: "Contemporary Villa, Arabian Ranches", type: "Villa", area: "Arabian Ranches", price: 6200000, beds: 4, baths: 4, size: 4100, status: "For Sale", added: "2026-05-22", img: IMG.garden2,
    blurb: "Family villa with landscaped garden, maid's room and golf-course community amenities including schools and parks." },
  { id: 7, title: "Sky Penthouse, Business Bay", type: "Penthouse", area: "Business Bay", price: 11900000, beds: 3, baths: 4, size: 2980, status: "For Sale", featured: true, tag: "Exclusive", added: "2026-06-05", img: IMG.games,
    blurb: "Full-floor penthouse with wraparound balcony, smart-home system and panoramic views of the Downtown skyline." },
  { id: 8, title: "Marina 2BR — Furnished", type: "Apartment", area: "Dubai Marina", price: 145000, beds: 2, baths: 2, size: 1150, status: "For Rent", added: "2026-06-12", img: IMG.lounge,
    blurb: "Fully furnished two-bedroom steps from the Marina Walk, tram and JBR beach. Annual rent, chiller free." },
  { id: 9, title: "Garden Villa, Palm Jumeirah", type: "Villa", area: "Palm Jumeirah", price: 18000000, beds: 4, baths: 5, size: 5600, status: "For Sale", featured: true, added: "2026-05-15", img: IMG.staircase,
    blurb: "Renovated garden-home villa on a frond, private pool, open-plan living and a chef's kitchen with island." },
  { id: 10, title: "Mansion in Emirates Hills", type: "Villa", area: "Emirates Hills", price: 45000000, beds: 7, baths: 9, size: 14500, status: "For Sale", featured: true, tag: "Architect designed", added: "2026-06-01", img: IMG.gym,
    blurb: "Bespoke lakeside mansion in Dubai's most prestigious gated community, with cinema, spa and resort-style gardens." },
  { id: 11, title: "Townhouse in Dubai Hills", type: "Townhouse", area: "Dubai Hills Estate", price: 4350000, beds: 3, baths: 4, size: 2400, status: "For Sale", added: "2026-05-10", img: IMG.kitchen,
    blurb: "Bright corner townhouse facing the park, with a private garden, two parking bays and access to Dubai Hills Mall." },
  { id: 12, title: "DIFC Loft Apartment", type: "Apartment", area: "DIFC", price: 3200000, beds: 2, baths: 2, size: 1420, status: "For Sale", added: "2026-04-28", img: IMG.kitchen2,
    blurb: "Industrial-luxe loft in the financial district, double-height windows, walkable to galleries and fine dining." },
  { id: 13, title: "JBR Beachfront 3BR", type: "Apartment", area: "Jumeirah Beach Residence", price: 5600000, beds: 3, baths: 4, size: 1980, status: "For Sale", added: "2026-05-18", img: IMG.bath,
    blurb: "Direct beach-access apartment on The Walk, full sea views, upgraded interiors and a wraparound balcony." },
  { id: 14, title: "Penthouse on the Palm", type: "Penthouse", area: "Palm Jumeirah", price: 31000000, beds: 4, baths: 5, size: 6100, status: "For Sale", featured: true, tag: "Exclusive", added: "2026-06-08", img: IMG.stairLiv,
    blurb: "Sky-mansion penthouse with private pool, 360° sea and skyline views and a dedicated lift lobby." },
  { id: 15, title: "Family Villa, Dubai Hills", type: "Villa", area: "Dubai Hills Estate", price: 9750000, beds: 5, baths: 6, size: 6200, status: "For Sale", added: "2026-05-02", img: IMG.games,
    blurb: "Modern family villa backing the golf course, with a basement, elevator, home gym and landscaped pool deck." },
  { id: 16, title: "Downtown 3BR Residence", type: "Apartment", area: "Downtown Dubai", price: 6900000, beds: 3, baths: 4, size: 2150, status: "For Sale", added: "2026-04-20", img: IMG.living,
    blurb: "Corner residence in a landmark tower, Opera District views, branded interiors and full hotel-style service." },

  // Rentals (annual, AED)
  { id: 17, title: "Marina Penthouse — Rental", type: "Penthouse", area: "Dubai Marina", price: 480000, beds: 3, baths: 4, size: 2600, status: "For Rent", featured: true, tag: "New listing", added: "2026-06-21", img: IMG.lounge,
    blurb: "Furnished marina penthouse with private terrace, residents' beach and concierge. Annual rent, flexible cheques." },
  { id: 18, title: "Downtown 2BR — Rental", type: "Apartment", area: "Downtown Dubai", price: 185000, beds: 2, baths: 2, size: 1180, status: "For Rent", added: "2026-06-15", img: IMG.living,
    blurb: "Bright two-bedroom with Burj views, walkable to Dubai Mall. Fully furnished, chiller-free, annual rent." },
  { id: 19, title: "Palm Garden Villa — Rental", type: "Villa", area: "Palm Jumeirah", price: 1200000, beds: 4, baths: 5, size: 5200, status: "For Rent", featured: true, tag: "Exclusive", added: "2026-06-09", img: IMG.garden2,
    blurb: "Beachfront frond villa with private pool and garden, available furnished or unfurnished. Annual rent." },
  { id: 20, title: "Business Bay Studio — Rental", type: "Apartment", area: "Business Bay", price: 68000, beds: 0, baths: 1, size: 440, status: "For Rent", added: "2026-06-19", img: IMG.bedroom,
    blurb: "Smart studio with canal glimpses, gym and pool, moments from Bay Avenue. Annual rent, 4 cheques." }
];

// gallery for a property's detail page: its own image + a few others from the pool
function galleryFor(item) {
  const start = IMG_POOL.indexOf(item.img);
  const out = [item.img];
  for (let k = 1; out.length < 4 && k < IMG_POOL.length; k++) {
    const im = IMG_POOL[(start + k) % IMG_POOL.length];
    if (!out.includes(im)) out.push(im);
  }
  return out;
}

window.LISTINGS = LISTINGS;
window.galleryFor = galleryFor;
