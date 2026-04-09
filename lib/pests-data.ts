export type RiskLevel =
  | "Severe Disease"
  | "High Risk"
  | "Structural"
  | "Sanitary"
  | "Stinging"
  | "Nuisance";

export type PestCategory =
  | "Insect"
  | "Arachnid"
  | "Rodent"
  | "Wildlife";

export interface Pest {
  id: string;
  name: string;
  scientificName: string;
  category: PestCategory;
  icon: string;
  image: string;
  riskLevel: RiskLevel;
  season: string;
  lifeCycle: string;
  dangerToFamily: string;
  description: string;
  prevention: string[];
  signs: string[];
  funFact: string;
}

export const pestCategories: { label: string; value: PestCategory | "All" | "Stinging" }[] = [
  { label: "All", value: "All" },
  { label: "Insects", value: "Insect" },
  { label: "Arachnids", value: "Arachnid" },
  { label: "Rodents", value: "Rodent" },
  { label: "Wildlife", value: "Wildlife" },
];

export const pestsData: Pest[] = [
  {
    id: "deer-tick",
    name: "Deer Tick",
    scientificName: "Ixodes scapularis",
    category: "Arachnid",
    icon: "🕷️",
    image: "/pests/deer-tick.webp",
    riskLevel: "Severe Disease",
    season: "Year-Round (Peaks Spring & Fall)",
    lifeCycle:
      "Egg, 6-legged Larva, 8-legged Nymph, Adult. Takes 2 years to complete.",
    dangerToFamily:
      "Primary transmitter of Lyme disease, Babesiosis, and Anaplasmosis on Long Island.",
    description:
      "Deer ticks thrive in leaf litter, shaded woods, and tall grass. Nymphs, which are the size of a poppy seed, are responsible for the vast majority of human Lyme disease infections due to how difficult they are to spot.",
    prevention: [
      "Keep grass mowed below 3 inches",
      "Create a 3-foot wood chip barrier between lawn and woods",
      "Treat clothing with permethrin before hiking",
      "Perform full body tick checks after being outdoors",
    ],
    signs: [
      "Finding ticks on pets or family members",
      "Bull's-eye rash (erythema migrans) after a bite",
      "Deer frequently visiting your yard",
    ],
    funFact:
      "A nymph deer tick is smaller than the period at the end of this sentence — yet it can transmit Lyme disease in under 36 hours.",
  },
  {
    id: "lone-star-tick",
    name: "Lone Star Tick",
    scientificName: "Amblyomma americanum",
    category: "Arachnid",
    icon: "🕷️",
    image: "/pests/lone-star-tick.webp",
    riskLevel: "Severe Disease",
    season: "Spring to Late Fall",
    lifeCycle: "Three-host tick lifecycle spanning 1 to 2 years.",
    dangerToFamily:
      "Bites can cause Alpha-gal syndrome (a severe allergy to red meat) and Ehrlichiosis.",
    description:
      "Highly aggressive and faster than other ticks. Females have a distinct white spot (the 'lone star') on their back. They are actively expanding across Suffolk County and the East End.",
    prevention: [
      "Apply DEET-based repellent to exposed skin",
      "Wear light-colored clothing to spot ticks easily",
      "Stay on cleared trails and avoid brushing against vegetation",
      "Shower within 2 hours of coming indoors",
    ],
    signs: [
      "Aggressive tick bites during daytime outdoor activities",
      "Developing meat allergy symptoms after a tick bite",
      "Ticks actively crawling toward you in grassy areas",
    ],
    funFact:
      "A single bite from a Lone Star tick can permanently make you allergic to red meat — a condition called Alpha-gal syndrome.",
  },
  {
    id: "dog-tick",
    name: "American Dog Tick",
    scientificName: "Dermacentor variabilis",
    category: "Arachnid",
    icon: "🕷️",
    image: "/pests/dog-tick.webp",
    riskLevel: "High Risk",
    season: "Spring to Mid-Summer",
    lifeCycle:
      "Can complete life cycle in as little as a few months if hosts are plentiful.",
    dangerToFamily:
      "Primary carrier of Rocky Mountain Spotted Fever and Tularemia.",
    description:
      "Significantly larger than deer ticks. They prefer grassy fields, trails, and scrubland. Often found latching onto dogs after walks in elevated brush.",
    prevention: [
      "Keep dogs on tick prevention medication year-round",
      "Avoid tall grass during peak tick season",
      "Inspect pets thoroughly after outdoor activity",
      "Maintain your yard's perimeter with regular mowing",
    ],
    signs: [
      "Large engorged ticks found on dogs",
      "Fever or headache after a bite (seek medical attention)",
      "Tick activity along fence lines and paths",
    ],
    funFact:
      "A fully engorged female American Dog Tick swells to over 100x her unfed body weight — the equivalent of a human gaining 15,000 pounds from a single meal.",
  },
  {
    id: "culex-mosquito",
    name: "Common House Mosquito",
    scientificName: "Culex pipiens",
    category: "Insect",
    icon: "🦟",
    image: "/pests/culex-mosquito.webp",
    riskLevel: "High Risk",
    season: "Summer (May to September)",
    lifeCycle:
      "Eggs laid in stagnant water. Larva to adult takes only 7-10 days in heat.",
    dangerToFamily:
      "Primary transmitter of West Nile Virus in the New York area.",
    description:
      "These mosquitoes primarily bite at dusk and dawn. They readily breed in any standing water, including gutters, old tires, and clogged birdbaths around your home.",
    prevention: [
      "Eliminate all standing water weekly (gutters, buckets, toys)",
      "Install or repair window and door screens",
      "Use outdoor fans on decks — mosquitoes are weak fliers",
      "Schedule regular barrier treatments during peak season",
    ],
    signs: [
      "Buzzing sounds at dusk near doorways",
      "Itchy welts appearing overnight",
      "Standing water sources around property",
    ],
    funFact:
      "Only female mosquitoes bite — they need the protein in blood to develop their eggs. Males survive entirely on flower nectar.",
  },
  {
    id: "asian-tiger",
    name: "Asian Tiger Mosquito",
    scientificName: "Aedes albopictus",
    category: "Insect",
    icon: "🦟",
    image: "/pests/asian-tiger.webp",
    riskLevel: "High Risk",
    season: "Mid-Summer to early Fall",
    lifeCycle: "Aggressive breeders in artificial containers.",
    dangerToFamily:
      "Can carry Zika and Dengue. Extremely painful, aggressive bites that interrupt outdoor activities.",
    description:
      "Unlike native mosquitoes, Asian Tiger mosquitoes bite intensely during the middle of the day. They have distinct black and white striped bodies and legs.",
    prevention: [
      "Empty saucers, tarps, and any containers that collect water",
      "Treat ornamental ponds with mosquito dunks",
      "Wear long sleeves during daytime outdoor activities",
      "Consider professional misting systems for severe infestations",
    ],
    signs: [
      "Aggressive daytime biting (unusual for mosquitoes)",
      "Black and white striped mosquitoes visible",
      "Bites are unusually painful compared to native species",
    ],
    funFact:
      "Asian Tiger mosquitoes can breed in a tablespoon of water — something as small as a bottle cap is enough.",
  },
  {
    id: "sub-termites",
    name: "Subterranean Termites",
    scientificName: "Reticulitermes flavipes",
    category: "Insect",
    icon: "🏚️",
    image: "/pests/sub-termites.webp",
    riskLevel: "Structural",
    season: "Year-round (Swarmers emerge in Spring)",
    lifeCycle:
      "Queen can live up to 25 years. Colonies reach hundreds of thousands.",
    dangerToFamily:
      "No direct health risk, but can cause catastrophic financial damage to home foundations.",
    description:
      "The most destructive wood-destroying insect in New York. They travel in mud tubes from the soil into the structural lumber of your home, eating it from the inside out.",
    prevention: [
      "Keep wood mulch at least 15 inches from your foundation",
      "Fix all moisture leaks — termites need water to survive",
      "Schedule annual termite inspections",
      "Never store firewood against the house",
    ],
    signs: [
      "Mud tubes on foundation walls or piers",
      "Hollow-sounding wood when tapped",
      "Swarms of winged insects in spring (often confused with ants)",
      "Discarded wings near windowsills",
    ],
    funFact:
      "Termites cause over $5 billion in property damage annually in the U.S. — more than fires, floods, and tornadoes combined.",
  },
  {
    id: "carpenter-ants",
    name: "Carpenter Ants",
    scientificName: "Camponotus",
    category: "Insect",
    icon: "🐜",
    image: "/pests/carpenter-ants.webp",
    riskLevel: "Structural",
    season: "Spring to Fall",
    lifeCycle: "Workers live for months; Queens can live for up to 10 years.",
    dangerToFamily:
      "Can compromise structural integrity if left unchecked for years.",
    description:
      "Large, black ants that excavate galleries in damp or decaying wood to build their nests. Unlike termites, they do not eat the wood, but push it out like sawdust (frass).",
    prevention: [
      "Repair water-damaged wood immediately",
      "Trim branches that touch the house",
      "Seal cracks and gaps around pipes and wires entering walls",
      "Store firewood elevated and away from structures",
    ],
    signs: [
      "Piles of fine sawdust (frass) near wooden structures",
      "Large black ants (1/4 to 1/2 inch) indoors",
      "Rustling sounds inside walls at night",
    ],
    funFact:
      "Carpenter ants are the strongest insects relative to their size — they can carry objects 50 times their own body weight.",
  },
  {
    id: "pavement-ants",
    name: "Pavement Ants",
    scientificName: "Tetramorium caespitum",
    category: "Insect",
    icon: "🐜",
    image: "/pests/pavement-ants.webp",
    riskLevel: "Nuisance",
    season: "Spring to Fall (Indoors year-round)",
    lifeCycle: "Multiple queens per colony, leading to rapid expansion.",
    dangerToFamily:
      "Can contaminate unwrapped food, but primarily an aesthetic nuisance.",
    description:
      "Small brown or black ants commonly seen displacing dirt between driveway cracks and patio pavers. They frequently invade kitchens looking for grease and sweets.",
    prevention: [
      "Seal cracks in driveways and foundations",
      "Keep kitchen counters clean and store food in sealed containers",
      "Eliminate grease drips near grills and outdoor eating areas",
      "Apply perimeter treatments in early spring",
    ],
    signs: [
      "Small mounds of displaced soil between pavement cracks",
      "Trails of tiny ants leading to food sources",
      "Ants congregating near pet food bowls",
    ],
    funFact:
      "Pavement ant colonies wage massive turf wars against neighboring colonies — these 'ant wars' can involve thousands of ants locked in battle on sidewalks.",
  },
  {
    id: "yellow-jackets",
    name: "Yellow Jackets",
    scientificName: "Vespula",
    category: "Insect",
    icon: "🐝",
    image: "/pests/yellow-jackets.webp",
    riskLevel: "Stinging",
    season: "Late Summer to Fall",
    lifeCycle:
      "Colonies die off in winter, but fertilized queens overwinter to start new nests in spring.",
    dangerToFamily:
      "Aggressive stingers that can strike repeatedly. Highly dangerous to allergic individuals.",
    description:
      "Often nest underground or in wall voids. They become extremely aggressive in late August and September as their natural food sources dwindle, crashing outdoor barbecues.",
    prevention: [
      "Keep sweet drinks and food covered at outdoor events",
      "Inspect your yard for ground-level nest holes in late spring",
      "Seal gaps in siding, soffits, and roof edges",
      "Hang yellow jacket traps in early spring to catch queens",
    ],
    signs: [
      "Yellow and black wasps circling food or drinks",
      "Heavy wasp traffic near a ground hole or wall gap",
      "Aggressive stinging incidents in late summer",
    ],
    funFact:
      "A single yellow jacket colony can contain over 5,000 workers by late summer — and unlike bees, each one can sting you multiple times.",
  },
  {
    id: "baldfaced-hornets",
    name: "Bald-faced Hornets",
    scientificName: "Dolichovespula maculata",
    category: "Insect",
    icon: "🐝",
    image: "/pests/baldfaced-hornets.webp",
    riskLevel: "Stinging",
    season: "Summer",
    lifeCycle:
      "Paper nests grow rapidly over summer, hosting hundreds of workers.",
    dangerToFamily:
      "Incredibly aggressive defending their nest and capable of spraying venom into eyes.",
    description:
      "Easily identified by their black and white faces. They build large, gray, football-shaped paper nests in trees, roof peaks, and shrubs.",
    prevention: [
      "Inspect roof eaves and trees in early spring for small starter nests",
      "Remove nests when they are small (golf-ball sized) in late spring",
      "Never disturb a large active nest — call a professional immediately",
      "Wear neutral colors when working outdoors near nests",
    ],
    signs: [
      "Large gray paper nest hanging from trees or eaves",
      "Aggressive wasps with black and white markings",
      "Wasps actively patrolling a perimeter near their nest",
    ],
    funFact:
      "Bald-faced hornets can squirt venom from their stinger into the eyes of nest intruders, causing temporary blindness.",
  },
  {
    id: "paper-wasps",
    name: "Paper Wasps",
    scientificName: "Polistes dominula",
    category: "Insect",
    icon: "🐝",
    image: "/pests/paper-wasps.webp",
    riskLevel: "Stinging",
    season: "Spring to Fall",
    lifeCycle:
      "Queens found nests in spring. Colonies peak at 20-75 workers by summer.",
    dangerToFamily:
      "Painful sting. Will aggressively defend their open-celled nests near doorways and play areas.",
    description:
      "Slender wasps that build open, umbrella-shaped paper nests under eaves, deck railings, and playground equipment. They are less aggressive than yellow jackets but will sting if their nest is disturbed.",
    prevention: [
      "Knock down overwintering nests in winter when they're empty",
      "Inspect under eaves, railings, and shutters in early spring",
      "Apply residual spray to common nesting areas before spring",
      "Keep garage doors closed to prevent indoor nesting",
    ],
    signs: [
      "Small open-celled nests under eaves or railings",
      "Wasps hovering near doorways or light fixtures",
      "Paper-like nest material attached to flat surfaces",
    ],
    funFact:
      "Paper wasps can recognize individual faces — they use this ability to maintain their social hierarchy within the colony.",
  },
  {
    id: "german-roach",
    name: "German Cockroach",
    scientificName: "Blattella germanica",
    category: "Insect",
    icon: "🪳",
    image: "/pests/german-roach.webp",
    riskLevel: "Sanitary",
    season: "Year-round indoors",
    lifeCycle:
      "Breeds explosively. A single female can produce 30,000 offspring in one year.",
    dangerToFamily:
      "Triggers severe asthma and carries E. coli, Salmonella, and Dysentery.",
    description:
      "Small, light brown roaches with two dark stripes behind the head. They strictly live indoors and thrive in humid kitchens and bathrooms.",
    prevention: [
      "Fix all plumbing leaks — they need moisture to survive",
      "Clean behind appliances regularly (stove, fridge, dishwasher)",
      "Seal gaps around pipes under sinks",
      "Never leave dirty dishes overnight",
    ],
    signs: [
      "Small brown roaches running when lights turn on",
      "Pepper-like droppings in cabinet corners",
      "Musty odor in kitchen or bathroom",
      "Egg capsules (oothecae) glued under counters",
    ],
    funFact:
      "A single pair of German cockroaches can theoretically produce over 400,000 descendants in a year — making them the fastest-reproducing cockroach on Earth.",
  },
  {
    id: "american-roach",
    name: "American Cockroach",
    scientificName: "Periplaneta americana",
    category: "Insect",
    icon: "🪳",
    image: "/pests/american-roach.webp",
    riskLevel: "Sanitary",
    season: "Year-round (peaks in summer)",
    lifeCycle: "Large egg capsules hold 14-16 embryos. Can live over a year.",
    dangerToFamily:
      "Spreads bacteria from sewers and drains to kitchen surfaces.",
    description:
      "Massive reddish-brown roaches that can fly short distances. Often found migrating up from basements, drains, and crawlspaces.",
    prevention: [
      "Seal gaps around drain pipes in the basement",
      "Install mesh covers over floor drains",
      "Reduce humidity with dehumidifiers in basements",
      "Keep basement clutter to a minimum",
    ],
    signs: [
      "Large (1.5+ inch) reddish-brown roaches in basements",
      "Roaches flying toward lights at night",
      "Musty, oily odor in damp areas",
    ],
    funFact:
      "American cockroaches can hold their breath for 40 minutes, which is how they survive being flushed down drains — and crawl back up.",
  },
  {
    id: "bed-bugs",
    name: "Bed Bugs",
    scientificName: "Cimex lectularius",
    category: "Insect",
    icon: "🩸",
    image: "/pests/bed-bugs.webp",
    riskLevel: "High Risk",
    season: "Year-round",
    lifeCycle:
      "Females lay 1-5 eggs daily. Nymphs require blood meals to molt.",
    dangerToFamily:
      "Bites cause severe itching and extreme psychological distress/sleep loss.",
    description:
      "Hitchhiking pests that hide in mattress seams, box springs, and baseboards. They emerge at night to feed quietly on human hosts.",
    prevention: [
      "Inspect hotel mattresses when traveling before unpacking",
      "Encase mattresses and box springs in bed bug-proof covers",
      "Never bring used furniture home without inspection",
      "Dry all travel clothing on HIGH heat for 30 minutes upon return",
    ],
    signs: [
      "Small blood spots on sheets",
      "Dark fecal spots on mattress seams",
      "Itchy bites in lines or clusters on exposed skin",
      "Sweet, musty odor in severe infestations",
    ],
    funFact:
      "Bed bugs can survive up to a year without feeding — they simply enter a dormant state and wait for a host to return.",
  },
  {
    id: "norway-rats",
    name: "Norway Rats",
    scientificName: "Rattus norvegicus",
    category: "Rodent",
    icon: "🐀",
    image: "/pests/norway-rats.webp",
    riskLevel: "High Risk",
    season: "Year-round (invade homes in Fall)",
    lifeCycle: "Gestation is 22 days. Litters of 8-12 pups.",
    dangerToFamily:
      "Vectors for Weil's disease, rat-bite fever, and severe gnawing damage to electrical wires.",
    description:
      "Thick, heavy rodents that burrow under concrete slabs, sheds, and foundations. They are completely dependent on human environments for food.",
    prevention: [
      "Seal all gaps larger than 1/2 inch with steel wool and caulk",
      "Store pet food and bird seed in sealed metal containers",
      "Keep garbage cans tightly lidded",
      "Remove fallen fruit and compost piles near the house",
    ],
    signs: [
      "Gnaw marks on wood, plastic, or wiring",
      "Greasy rub marks along walls and baseboards",
      "Capsule-shaped droppings (3/4 inch long)",
      "Burrowing holes near foundations",
    ],
    funFact:
      "A rat's teeth never stop growing. They gnaw constantly to keep them filed — which is why they chew through everything from PVC pipes to concrete.",
  },
  {
    id: "house-mouse",
    name: "House Mouse",
    scientificName: "Mus musculus",
    category: "Rodent",
    icon: "🐁",
    image: "/pests/house-mouse.webp",
    riskLevel: "Sanitary",
    season: "Fall to Spring (indoors year-round)",
    lifeCycle:
      "Reaches sexual maturity at 6 weeks. A single pair can produce 60+ offspring per year.",
    dangerToFamily:
      "Contaminates food with droppings and urine. Can trigger allergies and asthma in children.",
    description:
      "The most common rodent invader on Long Island. They squeeze through openings as small as a dime and nest in wall voids, cabinets, and storage boxes.",
    prevention: [
      "Seal all entry points with steel wool — mice can't chew through it",
      "Store food in hard plastic or glass containers",
      "Eliminate clutter in storage areas (cardboard = nesting material)",
      "Install door sweeps on exterior doors",
    ],
    signs: [
      "Tiny rod-shaped droppings (1/4 inch) in cabinets or drawers",
      "Scratching or scurrying sounds in walls at night",
      "Shredded paper, fabric, or insulation (nesting material)",
      "Nibbled food packaging",
    ],
    funFact:
      "A house mouse produces 50-75 droppings per day — if you find one dropping, there are dozens more hidden nearby.",
  },
  {
    id: "deer-mice",
    name: "Deer Mice",
    scientificName: "Peromyscus",
    category: "Rodent",
    icon: "🐁",
    image: "/pests/deer-mice.webp",
    riskLevel: "High Risk",
    season: "Fall to Spring indoors",
    lifeCycle: "Multiply rapidly in warm indoor environments over winter.",
    dangerToFamily:
      "Their droppings and urine are the primary transmission vector for the deadly Hantavirus.",
    description:
      "Distinguished by white underbellies and large ears. They squeeze into homes through openings as small as a dime to escape the brutal Northeast winters.",
    prevention: [
      "Seal all exterior gaps, especially around utility pipes",
      "Clear dense brush and woodpiles away from the foundation",
      "Use snap traps in garages, sheds, and attics",
      "Wear gloves and a mask when cleaning droppings",
    ],
    signs: [
      "White-bellied mice in attics or garages",
      "Seed caches and food hoards in hidden areas",
      "Fine, dark droppings in storage areas",
    ],
    funFact:
      "Deer mice can carry Hantavirus without ever getting sick — but dried droppings become airborne and can cause fatal respiratory illness in humans.",
  },
  {
    id: "spotted-lanternfly",
    name: "Spotted Lanternfly",
    scientificName: "Lycorma delicatula",
    category: "Insect",
    icon: "🦋",
    image: "/pests/spotted-lanternfly.webp",
    riskLevel: "Nuisance",
    season: "Mid-Summer to Late Fall",
    lifeCycle:
      "Nymphs mature through summer. Adults aggressively mate and lay egg masses in late Fall.",
    dangerToFamily:
      "Excretes sticky honeydew that ruins patios and kills valuable landscaping/trees.",
    description:
      "A highly invasive planthopper sweeping across Long Island. While harmless to humans, they swarm in massive numbers and decimate agricultural and ornamental plants.",
    prevention: [
      "Scrape and destroy egg masses on trees from October through March",
      "Wrap Tree of Heaven trunks with sticky bands to catch nymphs",
      "Report sightings to NY DEC to track the invasion",
      "Remove Tree of Heaven from your property (their preferred host)",
    ],
    signs: [
      "Gray, mud-like egg masses on trees and outdoor surfaces",
      "Sticky honeydew coating on patios, cars, and decks",
      "Sooty mold growing on honeydew-covered surfaces",
      "Swarms of spotted, wing-flashing insects on trees",
    ],
    funFact:
      "Spotted lanternflies are actually terrible fliers — they rely more on jumping, and can leap 6 feet in a single bound.",
  },
  {
    id: "cave-crickets",
    name: "Cave Crickets",
    scientificName: "Rhaphidophoridae",
    category: "Insect",
    icon: "🦗",
    image: "/pests/cave-crickets.webp",
    riskLevel: "Nuisance",
    season: "Year-round in basements",
    lifeCycle: "Overwinters as nymphs or adults in dark, damp spaces.",
    dangerToFamily:
      "Completely harmless, but causes a severe jump-scare factor by leaping blindly towards predators.",
    description:
      "Humpbacked, spider-like crickets found in basements and crawlspaces. They do not chirp and prefer absolute darkness and high humidity.",
    prevention: [
      "Reduce basement humidity with a dehumidifier",
      "Seal cracks in foundation walls and around windows",
      "Remove cardboard boxes and clutter from basements",
      "Install yellow 'bug light' bulbs near basement entries",
    ],
    signs: [
      "Large jumping insects in basement or garage",
      "Chewed fabric or paper in storage areas",
      "High humidity readings in below-grade spaces",
    ],
    funFact:
      "Camel crickets jump toward threats, not away — because they are nearly blind and use their leap as a disorienting defense mechanism.",
  },
  {
    id: "house-centipedes",
    name: "House Centipedes",
    scientificName: "Scutigera coleoptrata",
    category: "Insect",
    icon: "🐛",
    image: "/pests/house-centipedes.webp",
    riskLevel: "Nuisance",
    season: "Year-round",
    lifeCycle: "Can live up to 3-7 years indoors.",
    dangerToFamily:
      "Actually beneficial (they eat other pests), but terrifying to encounter. Bites are rare.",
    description:
      "Fast-moving, multi-legged arthropods often spotted darting across bathroom walls at night. They are aggressive predators of roaches and silverfish.",
    prevention: [
      "Reduce indoor humidity — centipedes need moisture",
      "Seal cracks around plumbing and foundation",
      "Address underlying pest issues (centipedes eat other bugs)",
      "Use sticky traps in bathrooms and basements",
    ],
    signs: [
      "Fast-moving, many-legged creatures on walls at night",
      "Presence often indicates other pest populations nearby",
      "Found near drains, bathtubs, and damp areas",
    ],
    funFact:
      "House centipedes can run at 1.3 feet per second — proportionally, that's like a human running 200 mph.",
  },
  {
    id: "wolf-spider",
    name: "Wolf Spider",
    scientificName: "Lycosidae",
    category: "Arachnid",
    icon: "🕸️",
    image: "/pests/wolf-spider.webp",
    riskLevel: "Nuisance",
    season: "Spring to Fall",
    lifeCycle: "Mothers carry hundreds of hatched spiderlings on their back.",
    dangerToFamily:
      "Painful but non-lethal bite if trapped. Not medically significant.",
    description:
      "Large, hairy hunting spiders that do not spin webs. They actively chase down prey across lawns and often wander through sliding glass doors.",
    prevention: [
      "Seal gaps under doors and around windows",
      "Turn off outdoor lights that attract insects (wolf spider prey)",
      "Keep vegetation trimmed away from the house",
      "Use glue traps along baseboards in garages",
    ],
    signs: [
      "Large hairy spiders running across floors",
      "Spiders carrying a white egg sac on their back",
      "No webs — these are ground hunters",
    ],
    funFact:
      "Mother wolf spiders carry their babies on their back. If you squish one, hundreds of tiny spiderlings scatter in every direction.",
  },
  {
    id: "eastern-gray-squirrel",
    name: "Eastern Gray Squirrel",
    scientificName: "Sciurus carolinensis",
    category: "Wildlife",
    icon: "🐿️",
    image: "/pests/eastern-gray-squirrel.webp",
    riskLevel: "Structural",
    season: "Fall and Winter",
    lifeCycle: "Two breeding seasons per year. Litters average 2-4 young.",
    dangerToFamily:
      "Fire hazard. Will aggressively chew through siding, soffits, and electrical wiring.",
    description:
      "While cute outside, they become highly destructive when they rip open roof gaps to nest in warm attics.",
    prevention: [
      "Trim tree branches at least 8 feet from the roof",
      "Install metal flashing over chew points on fascia",
      "Cap chimneys and roof vents with wildlife-proof screens",
      "Do not feed squirrels near the house",
    ],
    signs: [
      "Scratching or thumping sounds in attic, especially at dawn/dusk",
      "Chewed holes in soffits, fascia, or roof edges",
      "Nesting material (leaves, insulation) in attic",
      "Droppings in attic spaces",
    ],
    funFact:
      "Squirrels accidentally plant millions of trees every year — they bury acorns and forget where they hidden roughly 75% of them.",
  },
  {
    id: "raccoon",
    name: "Raccoon",
    scientificName: "Procyon lotor",
    category: "Wildlife",
    icon: "🦝",
    image: "/pests/raccoon.webp",
    riskLevel: "High Risk",
    season: "Year-Round",
    lifeCycle:
      "Kits are born in early spring and heavily protected by violent mothers.",
    dangerToFamily:
      "Carriers of Rabies and Raccoon Roundworm. Feces in attics are highly toxic.",
    description:
      "Extremely intelligent and strong. They will tear off roof shingles and chimney caps to create massive latrines and dens in your home's insulation.",
    prevention: [
      "Secure garbage cans with bungee cords or locking lids",
      "Install chimney caps and soffit screens",
      "Never leave pet food outdoors overnight",
      "Remove bird feeders during raccoon season",
    ],
    signs: [
      "Tipped garbage cans and scattered trash",
      "Large, dog-like droppings on roof or in attic",
      "Torn shingles, bent soffit vents, or damaged chimney caps",
      "Heavy thumping sounds at night overhead",
    ],
    funFact:
      "Raccoons can remember solutions to tasks for up to 3 years — they've even been observed opening complex locks and latches.",
  },
  {
    id: "fleas",
    name: "Cat Fleas",
    scientificName: "Ctenocephalides felis",
    category: "Insect",
    icon: "🦠",
    image: "/pests/fleas.webp",
    riskLevel: "High Risk",
    season: "Spring to Fall (year-round with pets)",
    lifeCycle:
      "Egg to adult in 2-3 weeks. Pupae can remain dormant for months waiting for vibrations.",
    dangerToFamily:
      "Causes severe itching, allergic dermatitis in pets, and can transmit murine typhus and tapeworms.",
    description:
      "Despite the name, cat fleas infest both cats and dogs. They jump up to 150 times their body length and breed rapidly in carpets and pet bedding.",
    prevention: [
      "Keep all pets on year-round flea prevention medication",
      "Vacuum carpets and furniture frequently (dispose of bags immediately)",
      "Wash pet bedding weekly in hot water",
      "Treat yards with granular flea control in spring",
    ],
    signs: [
      "Pets scratching and biting at their fur excessively",
      "Flea dirt (tiny black specks) on pet bedding or fur",
      "Bites on human ankles and lower legs",
      "Seeing tiny dark insects jumping in carpet",
    ],
    funFact:
      "A flea can jump 150 times its own body length — that's the human equivalent of leaping over a 75-story skyscraper.",
  },
  {
    id: "stink-bugs",
    name: "Brown Marmorated Stink Bug",
    scientificName: "Halyomorpha halys",
    category: "Insect",
    icon: "🪲",
    image: "/pests/stink-bugs.webp",
    riskLevel: "Nuisance",
    season: "Fall (invade homes Sept-Nov)",
    lifeCycle:
      "Adults overwinter indoors. Emerge in spring to breed outside.",
    dangerToFamily:
      "Harmless but release a foul-smelling compound when disturbed or crushed.",
    description:
      "Shield-shaped, marbled brown insects that enter homes by the hundreds in autumn seeking warmth. They cluster around windows and light fixtures inside.",
    prevention: [
      "Seal cracks around windows, doors, and utility pipes",
      "Replace damaged window screens",
      "Avoid crushing them — use a vacuum instead",
      "Turn off exterior lights at night during invasion season",
    ],
    signs: [
      "Shield-shaped brown bugs clustering on sunny exterior walls in fall",
      "Bugs appearing around windows and lights indoors",
      "Unpleasant odor when bugs are disturbed",
    ],
    funFact:
      "Stink bugs communicate with each other using vibrations through plant stems — essentially sending coded messages through the 'telephone' of the plant.",
  },
  {
    id: "silverfish",
    name: "Silverfish",
    scientificName: "Lepisma saccharinum",
    category: "Insect",
    icon: "🐟",
    image: "/pests/silverfish.webp",
    riskLevel: "Nuisance",
    season: "Year-round",
    lifeCycle:
      "Can live up to 8 years. Reproduce slowly but persistently in damp environments.",
    dangerToFamily:
      "Destroys books, wallpaper, photos, and clothing. Can contaminate food with scales.",
    description:
      "Torpedo-shaped, metallic silver insects that scurry away from light. They feed on starches, glue, paper, and textiles in dark closets and attics.",
    prevention: [
      "Reduce humidity below 50% using dehumidifiers",
      "Store important documents and photos in sealed containers",
      "Avoid storing cardboard boxes in damp areas",
      "Caulk cracks in baseboards and around plumbing",
    ],
    signs: [
      "Irregular holes or notches in paper and clothing",
      "Tiny pepper-like droppings in bookcases and closets",
      "Yellowish staining on fabrics",
      "Silvery, fish-shaped insects fleeing from light",
    ],
    funFact:
      "Silverfish are one of the oldest insect species on Earth — they existed 100 million years before dinosaurs and have remained virtually unchanged.",
  },
  {
    id: "earwigs",
    name: "Earwigs",
    scientificName: "Forficula auricularia",
    category: "Insect",
    icon: "🪱",
    image: "/pests/earwigs.webp",
    riskLevel: "Nuisance",
    season: "Late Spring to Summer",
    lifeCycle:
      "Females are devoted mothers, guarding and cleaning their eggs until hatching.",
    dangerToFamily:
      "Harmless to humans despite their frightening pincers. Can damage seedlings and flowers.",
    description:
      "Nocturnal insects with distinctive rear pincers. They hide in moist, dark spaces during the day and emerge at night to feed on plant material and small insects.",
    prevention: [
      "Eliminate moisture around the foundation",
      "Move mulch and ground cover 12 inches from the house",
      "Seal entry points around doors and ground-level windows",
      "Use rolled-up newspaper traps to catch and relocate them",
    ],
    signs: [
      "Pincered insects found under pots, stones, and mulch",
      "Chewed holes in flower petals and seedling leaves",
      "Earwigs appearing in bathrooms and kitchens near drains",
    ],
    funFact:
      "Despite their name, earwigs do NOT crawl into human ears. The myth dates back to an old European superstition, but they actually prefer hiding under rocks and mulch.",
  },
  {
    id: "cluster-flies",
    name: "Cluster Flies",
    scientificName: "Pollenia rudis",
    category: "Insect",
    icon: "🪰",
    image: "/pests/cluster-flies.webp",
    riskLevel: "Nuisance",
    season: "Fall through Spring (overwinter indoors)",
    lifeCycle:
      "Larvae are parasites of earthworms. Adults seek warm structures to overwinter.",
    dangerToFamily:
      "Do not bite or spread disease, but massive numbers buzzing inside on warm winter days are extremely disruptive.",
    description:
      "Slightly larger and slower than house flies, cluster flies enter homes in autumn to hibernate in wall voids and attics. On warm winter days, they emerge in large, sluggish swarms near windows.",
    prevention: [
      "Seal all exterior cracks before September",
      "Screen attic vents and soffit openings",
      "Apply residual insecticide to south- and west-facing walls in early fall",
      "Use light traps in attics to reduce overwintering populations",
    ],
    signs: [
      "Large, sluggish flies clustering near windows on warm winter days",
      "Buzzing sounds inside wall voids",
      "Dead flies accumulating on windowsills in attics",
    ],
    funFact:
      "Cluster flies are parasitoids — their larvae burrow into earthworms and slowly consume them alive from the inside over several weeks.",
  },
];
