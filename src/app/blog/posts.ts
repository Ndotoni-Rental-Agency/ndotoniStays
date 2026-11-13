// Stay guides for ndotonistays.com. Inline text supports **bold** and [link text](/href).
// Keep claims checkable: listings below each guide come from live search, not an editorial ranking.

export type Block =
  | { p: string }
  | { list: string[]; ordered?: boolean }
  | { checklist: string[] }
  | { tip: string; title?: string }
  | { warn: string; title?: string }
  | { table: { head: string[]; rows: string[][]; caption?: string } };

export type StayGuide = {
  slug: string; title: string; description: string; category: string; date: string; updated?: string;
  region: string; stayCategory: string;
  /** Index into ./photography; guides without one get a typographic cover so photos never repeat. */
  photo?: number;
  intro: string;
  takeaways: string[];
  sections: { title: string; blocks: Block[] }[];
  faqs: { q: string; a: string }[];
};

export const blogPosts: StayGuide[] = [
  {
    slug: 'short-stay-apartments-dar-es-salaam',
    title: 'Short-stay apartments in Dar es Salaam: how to choose',
    description: 'Compare location, the full booking total and the amenities you will actually use before choosing a furnished stay in Dar es Salaam.',
    category: 'City stays', date: '2026-11-07', region: 'Dar es Salaam', stayCategory: 'NIGHTLY_STAY', photo: 0,
    intro: 'Dar es Salaam is big, and traffic shapes every plan. The best apartment for your trip is the one closest to where you actually need to be, with the few things you rely on confirmed before you arrive.',
    takeaways: [
      'Pick the area by your itinerary, not by the neighbourhood’s reputation.',
      'Compare options using the same dates and guest count, so totals are comparable.',
      'Confirm Wi-Fi, water, power backup and check-in time with the host.',
      'Read the cancellation terms before you pay.',
    ],
    sections: [
      { title: 'Start with where you need to be', blocks: [
        { p: 'List the places you will visit most — an office, family, a hospital, an event venue — and the times you need to get there. Then look at each property’s location against that list.' },
        { table: { head: ['If your trip is mostly…', 'Start looking around'], rows: [
          ['Offices, embassies, restaurants on the peninsula', 'Masaki, Oyster Bay, Msasani'],
          ['Central and northern business areas', 'Mikocheni, Kinondoni, Mwenge'],
          ['The city centre and port', 'City Centre, Upanga, Kariakoo'],
          ['The northern beaches', 'Mbezi Beach, Kunduchi, Tegeta'],
          ['The airport or an early flight', 'Areas near Julius Nyerere International Airport'],
        ], caption: 'A starting point only — journey times depend heavily on the hour.' } },
        { tip: 'Ask the host how long the trip to your main destination takes at your actual travel time. Rush-hour and midday journeys can be very different.', title: 'Ask about the commute' },
      ] },
      { title: 'Compare the whole stay, not the nightly rate', blocks: [
        { p: 'Enter the same dates and guest count for each option and compare the **final booking total**. A displayed nightly rate is a starting point; cleaning fees, extra guests and longer stays can change the total.' },
        { checklist: [
          'Final total for your exact dates',
          'Cancellation terms and deadline',
          'Check-in and check-out times, and whether late arrival is possible',
          'Whether cleaning, laundry and drinking water are included',
        ] },
      ] },
      { title: 'Confirm the amenities you will use', blocks: [
        { checklist: [
          '**Working:** Wi-Fi in the unit, a table, enough sockets.',
          '**Power:** is there a generator, inverter or other backup?',
          '**Water:** is there a storage tank or reliable supply?',
          '**Comfort:** air conditioning in the bedroom, not just the living room.',
          '**Access:** stairs, lift and bathroom layout if step-free access matters.',
          '**Parking:** secure parking if you will have a car.',
        ] },
        { p: 'Amenities listed on a page are the host’s description. When something matters for your trip, message the host and get the answer in writing in the chat.' },
      ] },
    ],
    faqs: [
      { q: 'Which area is best for a first visit to Dar es Salaam?', a: 'It depends on where you need to be. Many visitors stay on the Msasani peninsula or in Mikocheni for easy access to restaurants and offices, but choose by your itinerary and travel times.' },
      { q: 'Can I message the host before booking?', a: 'Yes. Use the listing page to ask questions about access, amenities and check-in before you pay.' },
    ],
  },
  {
    slug: 'monthly-furnished-stays-dar-es-salaam',
    title: 'Staying a month or longer in Dar es Salaam: furnished stays guide',
    description: 'What to check when booking a furnished place for several weeks — total cost, utilities, cleaning, working setup and flexibility.',
    category: 'Longer stays', date: '2026-11-07', region: 'Dar es Salaam', stayCategory: 'NIGHTLY_STAY', photo: 1,
    intro: 'Relocating, on a project or between homes? A furnished stay for a few weeks gives you time to settle without signing a long lease. Longer stays bring different questions, though — about utilities, cleaning and what happens if your plans change.',
    takeaways: [
      'Ask whether electricity, water and Wi-Fi are included for long stays.',
      'Agree on cleaning frequency and laundry up front.',
      'Check the cancellation terms against how likely your dates are to move.',
      'Staying many months? Compare with a long-term rental on ndotoni.com.',
    ],
    sections: [
      { title: 'Ask about the costs that grow with time', blocks: [
        { p: 'For a weekend, small extras barely matter. Over a month they add up. Before booking, ask the host directly:' },
        { checklist: [
          'Is electricity (LUKU) included, capped, or paid separately?',
          'Is water included, and is there a storage tank?',
          'Is Wi-Fi included, and how fast is it in practice?',
          'How often is the unit cleaned, and are linens changed?',
          'Is laundry available in the unit or nearby?',
        ] },
      ] },
      { title: 'Set up for working', blocks: [
        { p: 'If you will work from the apartment, ask for a photo of the desk or table and confirm the connection. Keep a mobile data bundle as a backup — useful during outages anywhere.' },
      ] },
      { title: 'Plan for changes', blocks: [
        { p: 'Read the cancellation policy carefully and ask how the host handles extending or shortening a stay. Keep that conversation in the chat so there is a record.' },
        { tip: 'Staying for six months or more? A long-term rental can work out cheaper. Browse unfurnished and furnished homes on [ndotoni.com](https://www.ndotoni.com/search).', title: 'Staying much longer?' },
      ] },
    ],
    faqs: [
      { q: 'Do hosts offer discounts for monthly stays?', a: 'Some do. Enter your full dates to see the total, and ask the host if anything differs for longer bookings.' },
    ],
  },
  {
    slug: 'beach-stays-dar-es-salaam',
    title: 'Beach stays in Dar es Salaam: what to check before booking',
    description: 'Plan a coastal break with practical checks for beach access, facilities, transport and booking terms.',
    category: 'Beach escapes', date: '2026-11-07', region: 'Dar es Salaam', stayCategory: 'BEACH',
    intro: 'A sea view, a place near the coast and direct beach access are three different experiences. Before you book a beach escape, find out exactly which one you are getting.',
    takeaways: [
      'Ask if the stay is beachfront, or a walk or drive from the shore.',
      'Confirm whether beach access is public, private or through another venue.',
      'For children, ask specifically about pools, balconies and open water.',
      'Check how you will get there and back, especially across to Kigamboni.',
    ],
    sections: [
      { title: 'Clarify what “beach” means for each listing', blocks: [
        { checklist: [
          'Is the property directly on the beach?',
          'If not, how far is the walk or drive to the shore?',
          'Is access public, private, or through a hotel or club (and is there an entry charge)?',
          'Is the beach suitable for swimming at the time of year you are visiting?',
        ] },
        { p: 'Popular coastal areas around the city include the northern beaches — Mbezi Beach, Kunduchi and beyond — and Kigamboni, across the harbour, reached by the Nyerere Bridge or the ferry.' },
      ] },
      { title: 'Check the practical details', blocks: [
        { p: 'Confirm transport, parking, food options and cooking facilities. For a group, check sleeping capacity and visitor rules separately — the number of overnight guests can differ from the number allowed to visit.' },
        { warn: 'Travelling with children? Ask about pool fencing, balcony railings and access to open water, and agree who is supervising.', title: 'Safety with children' },
      ] },
      { title: 'Make the booking fit your plans', blocks: [
        { p: 'Enter your dates to check availability and the final total. Read cancellation and check-in terms, especially if you are coordinating transport or several guests.' },
      ] },
    ],
    faqs: [
      { q: 'Does a beach-category listing include private beach access?', a: 'Not necessarily. Category membership comes from the listing; confirm beach access and facilities with the host.' },
    ],
  },
  {
    slug: 'where-to-stay-dodoma-business',
    title: 'Where to stay in Dodoma for a business trip',
    description: 'Choose a Dodoma stay around your meeting location, working needs and arrival schedule.',
    category: 'Business travel', date: '2026-11-07', region: 'Dodoma', stayCategory: 'NIGHTLY_STAY', photo: 2,
    intro: 'Dodoma is Tanzania’s capital, and many visits revolve around government offices, Parliament sessions and conferences. A good base is one that keeps your mornings short and your evenings productive.',
    takeaways: [
      'Choose by distance to your meeting venue, not by the city name.',
      'Confirm Wi-Fi, a workspace and power backup directly with the host.',
      'If you need a receipt or invoice for your employer, ask before booking.',
      'Book early around busy periods such as Parliament sessions.',
    ],
    sections: [
      { title: 'Plan around your appointments', blocks: [
        { p: 'Check each property’s location against your meeting venue. Ask the host about taxis or ride-hailing in the area, parking, and access for an early departure or late arrival.' },
        { tip: 'Demand for accommodation can rise when Parliament is in session or a large conference is on. If your dates overlap, book early.', title: 'Timing' },
      ] },
      { title: 'Confirm working facilities directly', blocks: [
        { checklist: [
          'Wi-Fi in the unit (and what happens during an outage)',
          'A table and chair suitable for working',
          'Enough power sockets near the workspace',
          'A quiet room for calls',
          'Whether visitors are allowed if you plan to meet colleagues',
        ] },
      ] },
      { title: 'Check documents and flexibility', blocks: [
        { p: 'If your employer needs a receipt or invoice, confirm what the host can provide before booking. Read the cancellation policy against the likelihood of your meeting dates changing.' },
      ] },
    ],
    faqs: [
      { q: 'Are the listings below verified for business facilities?', a: 'No. They are overnight listings returned for Dodoma. Confirm Wi-Fi, a desk and other facilities with the host.' },
    ],
  },
  {
    slug: 'party-venues-dar-es-salaam',
    title: 'Party venues in Dar es Salaam: a booking checklist',
    description: 'Compare guest limits, event permission, music rules and costs when choosing a celebration venue.',
    category: 'Celebrations', date: '2026-11-07', region: 'Dar es Salaam', stayCategory: 'PARTY',
    intro: 'Birthdays, send-offs, kitchen parties, graduations — a private venue makes a celebration feel personal. Start with a space listed for parties and tell the host exactly what you are planning: an overnight booking does not automatically include permission to hold an event.',
    takeaways: [
      'Share your event type, guest count and hours with the host before booking.',
      'Get the guest limit, music rules and finishing time in writing.',
      'Ask what the price covers: furniture, cleaning, parking, kitchen.',
      'Confirm deposit, damage and cancellation terms.',
    ],
    sections: [
      { title: 'Confirm permission and capacity', blocks: [
        { checklist: [
          'Event type, date and hours agreed with the host',
          'Maximum number of guests, including those not staying overnight',
          'Music and amplified sound — allowed, and until what time?',
          'Decorations, outside caterers, DJs and photographers allowed?',
        ] },
      ] },
      { title: 'Check what the price covers', blocks: [
        { table: { head: ['Ask about', 'Why it matters'], rows: [
          ['Tables, chairs, tents', 'Hiring them separately adds cost and logistics'],
          ['Kitchen and outdoor areas', 'Caterers need space, water and power'],
          ['Cleaning after the event', 'May be included, extra, or your responsibility'],
          ['Parking', 'Guests arriving by car need somewhere to go'],
          ['Deposit and damage terms', 'Know what you could be charged for'],
        ] } },
        { p: 'If guests will sleep at the property, confirm sleeping capacity separately from the event capacity.' },
      ] },
      { title: 'Plan the day for your guests', blocks: [
        { p: 'Share a map pin and directions with guests, and check toilets, lighting and accessibility. Ask about staff presence and controlled entry rather than relying on general claims that a venue is safe.' },
        { tip: 'Do a short visit before the day if you can. Walk the space with your caterer or decorator so there are no surprises.', title: 'Visit first' },
      ] },
    ],
    faqs: [
      { q: 'Is the displayed rate a full event quote?', a: 'Not always. The displayed rate may be for the space only. Ask the host for a complete quote for your event.' },
    ],
  },
  {
    slug: 'photoshoot-locations-dar-es-salaam',
    title: 'Photoshoot locations in Dar es Salaam: how to book a space',
    description: 'Find a home, studio or outdoor space for a shoot — and agree light, time, crew size and usage rights with the host.',
    category: 'Photoshoots', date: '2026-11-07', region: 'Dar es Salaam', stayCategory: 'PHOTOSHOOT',
    intro: 'Fashion shoots, product content, wedding portraits, music videos — a real home or styled space often looks better than a studio backdrop. Booking one well means agreeing a few things the host will not think to mention.',
    takeaways: [
      'Ask for photos of the exact rooms you plan to use, at the time of day you will shoot.',
      'Agree crew size, equipment and hours before booking.',
      'Confirm power sockets and whether a generator is allowed.',
      'If the images are commercial, agree that in the chat.',
    ],
    sections: [
      { title: 'Scout the light before you book', blocks: [
        { p: 'Ask the host which rooms get morning or afternoon light, and request recent phone photos at your planned shoot time. Large windows, plain walls and outdoor greenery are worth asking about specifically.' },
      ] },
      { title: 'Agree the practical details', blocks: [
        { checklist: [
          'Start and finish times, including setup and pack-down',
          'Number of people on set (crew, models, clients)',
          'Equipment: lights, stands, backdrops, smoke or confetti',
          'Power: number of sockets, and backup power if any',
          'Moving furniture — allowed, and must it be put back?',
          'Changing room and bathroom access',
        ] },
      ] },
      { title: 'Usage and respect for the space', blocks: [
        { p: 'If the images will be used commercially — advertising, a brand campaign, a film — tell the host up front and agree it in the chat. Ask whether the address or exterior may be shown.' },
        { warn: 'Protect floors and furniture from equipment and props. Damage terms usually apply to shoots just as they do to stays.', title: 'Protect the space' },
      ] },
    ],
    faqs: [
      { q: 'Can I book a space for a few hours only?', a: 'Booking terms vary by listing. Check the listing and ask the host whether a shorter booking is possible.' },
    ],
  },
  {
    slug: 'meeting-spaces-dar-es-salaam',
    title: 'Meeting and workshop spaces in Dar es Salaam: a checklist',
    description: 'Choose a space for a team meeting, training or workshop — seating, connectivity, power, catering and access.',
    category: 'Meetings', date: '2026-11-07', region: 'Dar es Salaam', stayCategory: 'MEETING',
    intro: 'A small off-site, a board meeting, a training day: a private space keeps people focused. Use this checklist to make sure the room works before anyone arrives.',
    takeaways: [
      'Confirm seating capacity in the layout you need (boardroom, classroom, U-shape).',
      'Test Wi-Fi and ask about power backup for a full day.',
      'Check screen, projector or TV, and the cables for your laptop.',
      'Agree catering, water and break arrangements.',
    ],
    sections: [
      { title: 'Room and setup', blocks: [
        { checklist: [
          'Seats available in your preferred layout',
          'Tables for writing or laptops',
          'Air conditioning or ventilation for the full group',
          'Whiteboard or flip chart',
          'Screen or TV and the right cable (HDMI/USB-C)',
        ] },
      ] },
      { title: 'Connectivity and power', blocks: [
        { p: 'Ask the host for the Wi-Fi speed and whether it handles several people on video calls at once. Ask about generator or inverter backup — and bring a mobile hotspot as a fallback.' },
      ] },
      { title: 'Food, access and timing', blocks: [
        { checklist: [
          'Can you bring in catering? Is there a kitchen or serving area?',
          'Drinking water, tea and coffee — included or extra?',
          'Parking for attendees',
          'Earliest arrival for setup and latest departure',
          'Accessibility for anyone with limited mobility',
        ] },
      ] },
    ],
    faqs: [
      { q: 'Can I get an invoice for my company?', a: 'Ask the host before booking what documentation they can provide.' },
    ],
  },
  {
    slug: 'safari-stays-arusha',
    title: 'Safari stays in Arusha: planning your base',
    description: 'How to choose a place to stay in Arusha before or after a safari — location, early starts, luggage and what to confirm with your host.',
    category: 'Safari', date: '2026-11-07', region: 'Arusha', stayCategory: 'SAFARI',
    intro: 'Arusha is the gateway to Tanzania’s northern safari circuit, including Tarangire, Lake Manyara, Ngorongoro and the Serengeti. Most travellers spend a night or two here before or after their trip, so the right base is about easy logistics and a good night’s sleep.',
    takeaways: [
      'Ask your safari operator where they pick up, then choose a stay nearby.',
      'Confirm early check-out and breakfast for dawn departures.',
      'Ask whether you can store luggage while you are on safari.',
      'Allow for travel time from Kilimanjaro or Arusha airport.',
    ],
    sections: [
      { title: 'Choose around pickup and arrival', blocks: [
        { p: 'Safari operators usually collect guests from their accommodation or a set meeting point. Check this first. If you are flying in, factor in the drive from Kilimanjaro International Airport or Arusha Airport.' },
      ] },
      { title: 'Confirm what early starts need', blocks: [
        { checklist: [
          'Check-out possible before sunrise?',
          'Breakfast or a packed breakfast available early?',
          'Secure luggage storage while you are away',
          'Laundry before or after your safari',
          'Hot water and a reliable power supply',
        ] },
      ] },
      { title: 'Make the most of the extra day', blocks: [
        { p: 'If you have time, ask your host about local experiences: coffee farms on the slopes of Mount Meru, Arusha National Park for a short game drive or walk, or the town’s markets.' },
        { tip: 'Book your Arusha stay for the night before and the night after your safari at the same time — one less thing to arrange on a tired arrival.', title: 'Book both ends' },
      ] },
    ],
    faqs: [
      { q: 'Do safari stays include game drives?', a: 'Usually not. A stay listed in the safari category is accommodation; book drives and park fees through a licensed operator unless the host confirms otherwise.' },
    ],
  },
];

export function getPostBySlug(slug: string) { return blogPosts.find(post => post.slug === slug); }
export function guideSearchHref(post: StayGuide) {
  return `/search?${new URLSearchParams({ region: post.region, category: post.stayCategory })}`;
}

const blockText = (b: Block): string =>
  'p' in b ? b.p : 'list' in b ? b.list.join(' ') : 'checklist' in b ? b.checklist.join(' ')
  : 'tip' in b ? b.tip : 'warn' in b ? b.warn : b.table.rows.flat().join(' ');

export function readingMinutes(post: StayGuide): number {
  const text = [post.intro, ...post.sections.flatMap(s => s.blocks.map(blockText)), ...post.faqs.map(f => f.a)].join(' ');
  return Math.max(2, Math.round(text.split(/\s+/).length / 200));
}
