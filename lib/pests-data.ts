export type RiskLevel =
  | "Severe Disease"
  | "High Risk"
  | "Structural"
  | "Sanitary"
  | "Stinging"
  | "Nuisance";

export interface Pest {
  id: string;
  name: string;
  scientificName: string;
  category: string;
  icon: string;
  riskLevel: RiskLevel;
  season: string;
  lifeCycle: string;
  dangerToFamily: string;
  description: string;
}

export const pestsData: Pest[] = [
  {
    id: "deer-tick",
    name: "Deer Tick (Black-legged Tick)",
    scientificName: "Ixodes scapularis",
    category: "Arachnid",
    icon: "🕷️",
    riskLevel: "Severe Disease",
    season: "Year-Round (Peaks Spring & Fall)",
    lifeCycle:
      "Egg, 6-legged Larva, 8-legged Nymph, Adult. Takes 2 years to complete.",
    dangerToFamily:
      "Primary transmitter of Lyme disease, Babesiosis, and Anaplasmosis on Long Island.",
    description:
      "Deer ticks thrive in leaf litter, shaded woods, and tall grass. Nymphs, which are the size of a poppy seed, are responsible for the vast majority of human Lyme disease infections due to how difficult they are to spot.",
  },
  {
    id: "lone-star-tick",
    name: "Lone Star Tick",
    scientificName: "Amblyomma americanum",
    category: "Arachnid",
    icon: "🕷️",
    riskLevel: "Severe Disease",
    season: "Spring to Late Fall",
    lifeCycle: "Three-host tick lifecycle spanning 1 to 2 years.",
    dangerToFamily:
      "Bites can cause Alpha-gal syndrome (a severe allergy to red meat) and Ehrlichiosis.",
    description:
      "Highly aggressive and faster than other ticks. Females have a distinct white spot (the 'lone star') on their back. They are actively expanding across Suffolk County and the East End.",
  },
  {
    id: "dog-tick",
    name: "American Dog Tick",
    scientificName: "Dermacentor variabilis",
    category: "Arachnid",
    icon: "🕷️",
    riskLevel: "High Risk",
    season: "Spring to Mid-Summer",
    lifeCycle:
      "Can complete life cycle in as little as a few months if hosts are plentiful.",
    dangerToFamily:
      "Primary carrier of Rocky Mountain Spotted Fever and Tularemia.",
    description:
      "Significantly larger than deer ticks. They prefer grassy fields, trails, and scrubland. Often found latching onto dogs after walks in elevated brush.",
  },
  {
    id: "culex-mosquito",
    name: "Common House Mosquito",
    scientificName: "Culex pipiens",
    category: "Insect",
    icon: "🦟",
    riskLevel: "High Risk",
    season: "Summer (May to September)",
    lifeCycle:
      "Eggs laid in stagnant water. Larva to adult takes only 7-10 days in heat.",
    dangerToFamily:
      "Primary transmitter of West Nile Virus in the New York area.",
    description:
      "These mosquitoes primarily bite at dusk and dawn. They readily breed in any standing water, including gutters, old tires, and clogged birdbaths around your home.",
  },
  {
    id: "asian-tiger",
    name: "Asian Tiger Mosquito",
    scientificName: "Aedes albopictus",
    category: "Insect",
    icon: "🦟",
    riskLevel: "High Risk",
    season: "Mid-Summer to early Fall",
    lifeCycle: "Aggressive breeders in artificial containers.",
    dangerToFamily:
      "Can carry Zika and Dengue. Extremely painful, aggressive bites that interrupt outdoor activities.",
    description:
      "Unlike native mosquitoes, Asian Tiger mosquitoes bite intensely during the middle of the day. They have distinct black and white striped bodies and legs.",
  },
  {
    id: "sub-termites",
    name: "Subterranean Termites",
    scientificName: "Reticulitermes flavipes",
    category: "Insect",
    icon: "🏚️",
    riskLevel: "Structural",
    season: "Year-round (Swarmers emerge in Spring)",
    lifeCycle:
      "Queen can live up to 25 years. Colonies reach hundreds of thousands.",
    dangerToFamily:
      "No direct health risk, but can cause catastrophic financial damage to home foundations.",
    description:
      "The most destructive wood-destroying insect in New York. They travel in mud tubes from the soil into the structural lumber of your home, eating it from the inside out.",
  },
  {
    id: "carpenter-ants",
    name: "Carpenter Ants",
    scientificName: "Camponotus",
    category: "Insect",
    icon: "🐜",
    riskLevel: "Structural",
    season: "Spring to Fall",
    lifeCycle: "Workers live for months; Queens can live for up to 10 years.",
    dangerToFamily:
      "Can compromise structural integrity if left unchecked for years.",
    description:
      "Large, black ants that excavate galleries in damp or decaying wood to build their nests. Unlike termites, they do not eat the wood, but push it out like sawdust (frass).",
  },
  {
    id: "pavement-ants",
    name: "Pavement Ants",
    scientificName: "Tetramorium caespitum",
    category: "Insect",
    icon: "🐜",
    riskLevel: "Nuisance",
    season: "Spring to Fall (Indoors year-round)",
    lifeCycle: "Multiple queens per colony, leading to rapid expansion.",
    dangerToFamily:
      "Can contaminate unwrapped food, but primarily an aesthetic nuisance.",
    description:
      "Small brown or black ants commonly seen displacing dirt between driveway cracks and patio pavers. They frequently invade kitchens looking for grease and sweets.",
  },
  {
    id: "yellow-jackets",
    name: "Yellow Jackets",
    scientificName: "Vespula",
    category: "Insect",
    icon: "🐝",
    riskLevel: "Stinging",
    season: "Late Summer to Fall",
    lifeCycle:
      "Colonies die off in winter, but fertilized queens overwinter to start new nests in spring.",
    dangerToFamily:
      "Aggressive stingers that can strike repeatedly. Highly dangerous to allergic individuals.",
    description:
      "Often nest underground or in wall voids. They become extremely aggressive in late August and September as their natural food sources dwindle, crashing outdoor barbecues.",
  },
  {
    id: "baldfaced-hornets",
    name: "Bald-faced Hornets",
    scientificName: "Dolichovespula maculata",
    category: "Insect",
    icon: "🐝",
    riskLevel: "Stinging",
    season: "Summer",
    lifeCycle:
      "Paper nests grow rapidly over summer, hosting hundreds of workers.",
    dangerToFamily:
      "Incredibly aggressive defending their nest and capable of spraying venom into eyes.",
    description:
      "Easily identified by their black and white faces. They build large, gray, football-shaped paper nests in trees, roof peaks, and shrubs.",
  },
  {
    id: "german-roach",
    name: "German Cockroach",
    scientificName: "Blattella germanica",
    category: "Insect",
    icon: "🪳",
    riskLevel: "Sanitary",
    season: "Year-round indoors",
    lifeCycle:
      "Breeds explosively. A single female can produce 30,000 offspring in one year.",
    dangerToFamily:
      "Triggers severe asthma and carries E. coli, Salmonella, and Dysentery.",
    description:
      "Small, light brown roaches with two dark stripes behind the head. They strictly live indoors and thrive in humid kitchens and bathrooms.",
  },
  {
    id: "american-roach",
    name: "American Cockroach (Waterbug)",
    scientificName: "Periplaneta americana",
    category: "Insect",
    icon: "🪳",
    riskLevel: "Sanitary",
    season: "Year-round (peaks in summer)",
    lifeCycle: "Large egg capsules hold 14-16 embryos. Can live over a year.",
    dangerToFamily:
      "Spreads bacteria from sewers and drains to kitchen surfaces.",
    description:
      "Massive reddish-brown roaches that can fly short distances. Often found migrating up from basements, drains, and crawlspaces.",
  },
  {
    id: "bed-bugs",
    name: "Bed Bugs",
    scientificName: "Cimex lectularius",
    category: "Insect",
    icon: "🩸",
    riskLevel: "High Risk",
    season: "Year-round",
    lifeCycle:
      "Females lay 1-5 eggs daily. Nymphs require blood meals to molt.",
    dangerToFamily:
      "Bites cause severe itching and extreme psychological distress/sleep loss.",
    description:
      "Hitchhiking pests that hide in mattress seams, box springs, and baseboards. They emerge at night to feed quietly on human hosts.",
  },
  {
    id: "norway-rats",
    name: "Norway Rats",
    scientificName: "Rattus norvegicus",
    category: "Rodent",
    icon: "🐀",
    riskLevel: "High Risk",
    season: "Year-round (invade homes in Fall)",
    lifeCycle: "Gestation is 22 days. Litters of 8-12 pups.",
    dangerToFamily:
      "Vectors for Weil's disease, rate-bite fever, and severe gnawing damage to electrical wires.",
    description:
      "Thick, heavy rodents that burrow under concrete slabs, sheds, and foundations. They are completely dependent on human environments for food.",
  },
  {
    id: "deer-mice",
    name: "Deer Mice",
    scientificName: "Peromyscus",
    category: "Rodent",
    icon: "🐁",
    riskLevel: "High Risk",
    season: "Fall to Spring indoors",
    lifeCycle: "Multiply rapidly in warm indoor environments over winter.",
    dangerToFamily:
      "Their droppings and urine are the primary transmission vector for the deadly Hantavirus.",
    description:
      "Distinguished by white underbellies and large ears. They squeeze into homes through openings as small as a dime to escape the brutal Northeast winters.",
  },
  {
    id: "spotted-lanternfly",
    name: "Spotted Lanternfly",
    scientificName: "Lycorma delicatula",
    category: "Insect",
    icon: "🦋",
    riskLevel: "Nuisance",
    season: "Mid-Summer to Late Fall",
    lifeCycle:
      "Nymphs mature through summer. Adults aggressively mate and lay egg masses in late Fall.",
    dangerToFamily:
      "Excretes sticky honeydew that ruins patios and kills valuable landscaping/trees.",
    description:
      "A highly invasive planthopper sweeping across Long Island. While harmless to humans, they swarm in massive numbers and decimate agricultural and ornamental plants.",
  },
  {
    id: "cave-crickets",
    name: "Cave Crickets (Camel Crickets)",
    scientificName: "Rhaphidophoridae",
    category: "Insect",
    icon: "🦗",
    riskLevel: "Nuisance",
    season: "Year-round in basements",
    lifeCycle: "Overwinters as nymphs or adults in dark, damp spaces.",
    dangerToFamily:
      "Completely harmless, but causes a severe jump-scare factor by leaping blindly towards predators.",
    description:
      "Humpbacked, spider-like crickets found in basements and crawlspaces. They do not chirp and prefer absolute darkness and high humidity.",
  },
  {
    id: "house-centipedes",
    name: "House Centipedes",
    scientificName: "Scutigera coleoptrata",
    category: "Insect",
    icon: "🐛",
    riskLevel: "Nuisance",
    season: "Year-round",
    lifeCycle: "Can live up to 3-7 years indoors.",
    dangerToFamily:
      "Actually beneficial (they eat other pests), but terrifying to encounter. Bites are rare.",
    description:
      "Fast-moving, multi-legged arthropods often spotted darting across bathroom walls at night. They are aggressive predators of roaches and silverfish.",
  },
  {
    id: "wolf-spider",
    name: "Wolf Spider",
    scientificName: "Lycosidae",
    category: "Arachnid",
    icon: "🕸️",
    riskLevel: "Nuisance",
    season: "Spring to Fall",
    lifeCycle: "Mothers carry hundreds of hatched spiderlings on their back.",
    dangerToFamily:
      "Painful but non-lethal bite if trapped. Not medically significant.",
    description:
      "Large, hairy hunting spiders that do not spin webs. They actively chase down prey across lawns and often wander through sliding glass doors.",
  },
  {
    id: "eastern-gray-squirrel",
    name: "Eastern Gray Squirrel",
    scientificName: "Sciurus carolinensis",
    category: "Wildlife",
    icon: "🐿️",
    riskLevel: "Structural",
    season: "Fall and Winter",
    lifeCycle: "Two breeding seasons per year. Litters average 2-4 young.",
    dangerToFamily:
      "Fire hazard. Will aggressively chew through siding, soffits, and electrical wiring.",
    description:
      "While cute outside, they become highly destructive when they rip open roof gaps to nest in warm attics.",
  },
  {
    id: "raccoon",
    name: "Raccoon",
    scientificName: "Procyon lotor",
    category: "Wildlife",
    icon: "🦝",
    riskLevel: "High Risk",
    season: "Year-Round",
    lifeCycle:
      "Kits are born in early spring and heavily protected by violent mothers.",
    dangerToFamily:
      "Carriers of Rabies and Raccoon Roundworm. Feces in attics are highly toxic.",
    description:
      "Extremely intelligent and strong. They will tear off roof shingles and chimney caps to create massive latrines and dens in your home's insulation.",
  },
];
