window.BIO_DATA = window.BIO_DATA || {};
window.BIO_DATA.practicals = [
  {
    id: "food-tests",
    icon: "🧪",
    title: "Food Tests",
    description: "Standard qualitative tests for starch, reducing sugars, proteins and fats used in WAEC practical examinations.",
    materials: ["Iodine solution", "Benedict’s solution", "Sodium hydroxide solution", "Copper(II) sulphate solution (1%)", "Ethanol", "Test tubes and rack", "Water bath / Bunsen burner", "Food samples"],
    steps: [
      { title: "Test for starch", desc: "Add 2–3 drops of iodine solution to the sample. Blue-black colour indicates starch." },
      { title: "Test for reducing sugar", desc: "Add equal volume of Benedict’s solution. Heat in a boiling water bath 3–5 minutes. Brick-red precipitate indicates reducing sugar." },
      { title: "Test for protein (Biuret)", desc: "Add 2 cm³ sodium hydroxide, then a few drops of copper(II) sulphate. Purple/violet colour indicates protein." },
      { title: "Test for fat (ethanol emulsion)", desc: "Shake sample with ethanol. Pour into water. Milky-white emulsion indicates fat/oil." }
    ],
    explanation: "Colour changes occur because of specific chemical reactions between the reagents and food molecules.",
    tip: "Always record the initial colour of the reagent and the final colour observed."
  },
  {
    id: "osmosis",
    icon: "💧",
    title: "Osmosis in Living Tissue",
    description: "Demonstrate osmosis using potato cylinders or visking tubing.",
    materials: ["Fresh potato", "Cork borer or knife", "Sucrose solutions of different concentrations", "Distilled water", "Beakers", "Ruler or balance"],
    steps: [
      { title: "Prepare cylinders", desc: "Cut equal-length potato cylinders. Blot dry and measure initial length or mass." },
      { title: "Set up treatments", desc: "Place cylinders in distilled water and a range of sucrose concentrations. Leave 30–60 minutes." },
      { title: "Re-measure", desc: "Remove, blot, and measure final length or mass." },
      { title: "Calculate change", desc: "Calculate percentage change for each concentration." },
      { title: "Interpret", desc: "Plot percentage change against concentration. Zero change is the isotonic point." }
    ],
    explanation: "Water moves by osmosis from higher to lower water potential.",
    tip: "Keep cylinders fully submerged and use the same blotting technique for all samples."
  },
  {
    id: "photosynthesis-starch",
    icon: "🌿",
    title: "Test for Starch in a Leaf",
    description: "Show that starch is produced during photosynthesis and that light and chlorophyll are necessary.",
    materials: ["Potted plant destarched 24–48 h", "Black paper or foil", "Iodine solution", "Ethanol", "Beaker of boiling water", "White tile"],
    steps: [
      { title: "Destarch the plant", desc: "Keep plant in darkness at least 24 hours." },
      { title: "Partial cover", desc: "Cover part of a leaf; expose plant to bright light for several hours." },
      { title: "Boil the leaf", desc: "Detach leaf and plunge into boiling water for about 1 minute." },
      { title: "Decolourise", desc: "Boil leaf in ethanol (water bath) until chlorophyll is removed." },
      { title: "Rinse and test", desc: "Rinse in warm water, spread on white tile, flood with iodine." }
    ],
    explanation: "Only parts that received light and contained chlorophyll turn blue-black.",
    tip: "Never heat ethanol over a naked flame — use a water bath."
  },
  {
    id: "enzyme-activity",
    icon: "⚗️",
    title: "Effect of Temperature on Enzyme Activity",
    description: "Investigate how temperature affects catalase or amylase activity.",
    materials: ["Hydrogen peroxide or starch + amylase", "Enzyme source", "Water baths at different temperatures", "Test tubes, stopwatch"],
    steps: [
      { title: "Prepare enzyme and substrate", desc: "Equal volumes for each temperature." },
      { title: "Equilibrate", desc: "Stand separately in water bath for 5 minutes." },
      { title: "Mix and time", desc: "Mix, start stopwatch, record time for visible change." },
      { title: "Repeat", desc: "Repeat for each temperature." },
      { title: "Plot results", desc: "Graph rate (1/time) against temperature." }
    ],
    explanation: "Activity rises to an optimum then falls as the enzyme denatures.",
    tip: "Use a control with boiled enzyme."
  },
  {
    id: "drawing-labelling",
    icon: "✏️",
    title: "Biological Drawing & Labelling",
    description: "WAEC Paper 3 skill: accurate, proportioned drawings with correct labels.",
    materials: ["Specimen", "Sharp HB pencil", "Clean white paper", "Ruler", "Hand lens"],
    steps: [
      { title: "Observe carefully", desc: "Study specimen; note proportions and distinctive features." },
      { title: "Draw large and clear", desc: "Continuous clean lines; at least half a page; title and magnification." },
      { title: "Label accurately", desc: "Ruled guidelines that touch the structure; horizontal labels outside the drawing." },
      { title: "Annotate if asked", desc: "Short notes on function or adaptation when required." },
      { title: "Check quality", desc: "No overlapping lines; no arrow heads on label lines; correct spelling." }
    ],
    explanation: "Good drawings communicate structure clearly; examiners mark accuracy and presentation.",
    tip: "Never use biro or coloured pencils for the outline. Draw what you see."
  },
  {
    id: "specimen-id",
    icon: "🔍",
    title: "Specimen Identification",
    description: "Identify common biological specimens and state observable features and functions.",
    materials: ["Assorted specimens", "Hand lens"],
    steps: [
      { title: "Observe external features", desc: "Note shape, colour, texture, number of parts, symmetry." },
      { title: "Name the specimen", desc: "Give common or scientific name as required." },
      { title: "State adaptations / functions", desc: "Link structure to function." },
      { title: "Classify if asked", desc: "Place in the correct group." },
      { title: "Compare when required", desc: "List differences or similarities in a table if asked." }
    ],
    explanation: "Identification tests careful observation and structure–function links.",
    tip: "Write only features you can actually see on the specimen provided."
  }
];
