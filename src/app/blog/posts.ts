export type StayGuide = {
  slug: string; title: string; description: string; category: string; date: string;
  region: string; stayCategory: string;
  intro: string; sections: { title: string; paragraphs: string[] }[];
};
export const blogPosts: StayGuide[] = [
  {
    slug: 'short-stay-apartments-dar-es-salaam',
    title: 'Short-stay apartments in Dar es Salaam: how to choose',
    description: 'Compare location, nightly costs and practical amenities before choosing a furnished stay in Dar es Salaam.',
    category: 'City stays', date: '2026-11-07', region: 'Dar es Salaam', stayCategory: 'NIGHTLY_STAY',
    intro: 'A comfortable short stay starts with the right fit for your trip. Use this guide to compare apartments listed on Ndotoni Stays, then check your dates and guest count before booking.',
    sections: [
      { title: 'Start with where you need to be', paragraphs: ['List the places you will visit most: an office, family home, hospital or event venue. Compare each property’s location with those destinations, and ask the host about access and transport at your expected arrival time.', 'If you are comparing Masaki, Mikocheni or another neighborhood, choose the individual property based on your itinerary. A neighborhood name alone does not tell you the journey time or what the building offers.'] },
      { title: 'Compare the whole stay, not just the nightly rate', paragraphs: ['Enter the same dates and guest count for each option. Check the final booking total, any additional charges, cancellation terms and check-in arrangements. A displayed nightly rate is a starting point, not a confirmed total.', 'For a longer visit, confirm whether laundry, cleaning, cooking facilities, water and electricity are included. Ask about any separate charges before paying.'] },
      { title: 'Choose amenities you will actually use', paragraphs: ['For work, confirm the Wi-Fi and workspace with the host. For a family trip, check bedroom arrangements, guest capacity and kitchen access. If step-free access matters, confirm the entrance, lift and bathroom layout directly.', 'Use the listings below as options to investigate. They are drawn from the platform’s overnight-stay search, rather than an independent ranking of every apartment in Dar es Salaam.'] },
    ],
  },
  {
    slug: 'beach-stays-dar-es-salaam', title: 'Beach stays in Dar es Salaam: what to check before booking',
    description: 'Plan a coastal break with practical checks for beach access, facilities, transport and booking terms.',
    category: 'Beach escapes', date: '2026-11-07', region: 'Dar es Salaam', stayCategory: 'BEACH',
    intro: 'A sea view, a place near the coast and direct beach access are different experiences. Before choosing a beach escape, establish exactly what the listing offers and how it fits your plans.',
    sections: [
      { title: 'Clarify what “beach” means for each listing', paragraphs: ['Ask whether the property is beachfront or requires a walk or drive to reach the shore. Confirm whether access is public or through another venue, and whether there are entry charges.', 'Check recent listing photos and ask the host about the route. Do not assume a beach-category listing includes private beach access or swimming facilities.'] },
      { title: 'Check the practical details', paragraphs: ['Confirm transport, parking, food options and cooking facilities. For a group, check the sleeping capacity and visitor rules separately; capacity for overnight guests may differ from the number allowed at a gathering.', 'If traveling with children, ask specifically about balconies, pools and access to open water. Confirm supervision arrangements for your group.'] },
      { title: 'Make the booking fit your plans', paragraphs: ['Enter your dates to check availability and the final total. Read cancellation and check-in terms, especially if you are coordinating transport or several guests.', 'Below are listings returned for the beach category on Ndotoni Stays. Category membership comes from listing data; confirm the specific facilities with the host.'] },
    ],
  },
  {
    slug: 'where-to-stay-dodoma-business', title: 'Where to stay in Dodoma for a business trip',
    description: 'Choose a Dodoma stay around your meeting location, working needs and arrival schedule.',
    category: 'Business travel', date: '2026-11-07', region: 'Dodoma', stayCategory: 'NIGHTLY_STAY',
    intro: 'For a business trip, a useful stay is one that supports your actual schedule. Start with your meeting location and arrival time, then check the facilities you need to work and rest.',
    sections: [
      { title: 'Plan around your appointments', paragraphs: ['Check the property’s location against your meeting venue rather than choosing by city name alone. Ask the host about transport options, parking and access for an early departure or late arrival.'] },
      { title: 'Confirm working facilities directly', paragraphs: ['Ask whether Wi-Fi is available in the unit and whether there is a suitable table and power socket. If continuous connectivity is essential, ask about backup arrangements and prepare your own alternative.', 'Check whether the room is private or shared and whether visitors are allowed if you expect to meet colleagues. A sleeping apartment is not automatically a meeting venue.'] },
      { title: 'Check documents and booking flexibility', paragraphs: ['If your employer requires a receipt or invoice, confirm what can be supplied before booking. Read the cancellation policy against the likelihood of your meeting dates changing.', 'The properties below are overnight listings returned for Dodoma. Inclusion does not mean that Wi-Fi, a desk or business facilities have been independently verified.'] },
    ],
  },
  {
    slug: 'party-venues-dar-es-salaam', title: 'Party venues in Dar es Salaam: a booking checklist',
    description: 'Compare guest limits, event permission, music rules and costs when choosing a celebration venue.',
    category: 'Celebrations', date: '2026-11-07', region: 'Dar es Salaam', stayCategory: 'PARTY',
    intro: 'Start with a space listed for parties and explain your event to the host. Booking overnight accommodation does not automatically give permission to hold an event.',
    sections: [
      { title: 'Confirm permission and capacity', paragraphs: ['Share the event type, expected attendance, date and hours. Obtain confirmation of the permitted guest count, including visitors who will not stay overnight.', 'Ask about music, amplified sound, finishing times, decorations and outside suppliers. Confirm any venue or local requirements with the host before committing to other arrangements.'] },
      { title: 'Check what the price covers', paragraphs: ['Ask whether tables, chairs, cleaning, parking and access to kitchens or outdoor areas are included. Confirm deposits, damage terms and cancellation conditions.', 'If guests will sleep at the property, confirm that accommodation is included and check the separate sleeping capacity.'] },
      { title: 'Plan access for your guests', paragraphs: ['Check the arrival route, parking, toilets and accessibility. Ask about staff presence, controlled entry and emergency arrangements instead of relying on general claims that a venue is safe.', 'The options below come from Ndotoni Stays’ party category. Confirm your particular event with the host; the displayed rate may not be a complete event quote.'] },
    ],
  },
];
export function getPostBySlug(slug: string) { return blogPosts.find(post => post.slug === slug); }
export function guideSearchHref(post: StayGuide) {
  return `/search?${new URLSearchParams({ region: post.region, category: post.stayCategory })}`;
}
