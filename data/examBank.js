/* Compact fact bank → expands to large WAEC/JAMB pools at runtime (~5000) */
(function () {
  window.BIO_DATA = window.BIO_DATA || {};

  var FACTS = {
    cell: [
      ["nucleus","controls cell activities and contains DNA",["produces ATP only","digests food only","stores starch only"]],
      ["mitochondrion","site of aerobic respiration and ATP production",["site of photosynthesis","stores water only","makes ribosomes only"]],
      ["chloroplast","site of photosynthesis in plant cells",["found in all animal cells","produces urea","transports oxygen"]],
      ["ribosome","site of protein synthesis",["stores DNA","digests lipids only","carries oxygen"]],
      ["cell membrane","selectively permeable barrier controlling entry and exit",["made only of cellulose","impermeable to everything","produces glucose"]],
      ["cell wall","rigid cellulose support in plant cells",["present in all animal cells","carries nerve impulses","site of respiration"]],
      ["Golgi apparatus","modifies packages and secretes proteins",["stores genetic material","carries oxygen","fixes nitrogen"]],
      ["lysosome","contains digestive enzymes for worn-out organelles",["stores chlorophyll","produces antibodies only","transports xylem water"]],
      ["vacuole","stores water and maintains turgor in plants",["powerhouse of the cell","codes for proteins","detects light"]],
      ["cytoplasm","site of many metabolic reactions including glycolysis",["found only in viruses","identical to cell wall","contains only DNA"]],
      ["chromosome","DNA and protein structure carrying genes",["carbohydrate only","found only in mitochondrion","digests starch"]],
      ["endoplasmic reticulum","transports materials within the cell",["pumps blood","forms urine","produces bile"]]
    ],
    nutrition: [
      ["chlorophyll","absorbs light energy for photosynthesis",["carries oxygen in blood","digests protein","is a hormone"]],
      ["photosynthesis","converts light energy into chemical energy in glucose",["releases energy from glucose only","occurs only in roots","produces urea"]],
      ["starch","tested with iodine (blue-black)",["tested with Benedict only","is a protein","is a lipid"]],
      ["reducing sugar","tested with Benedict’s solution when heated",["turns iodine blue-black","detected by biuret only","found only in bones"]],
      ["protein","tested with biuret reagent (purple)",["turns iodine black","made only of glucose","cannot be digested"]],
      ["lipid","ethanol emulsion test gives milky emulsion",["turns biuret purple","main leaf pigment","is a nucleic acid"]],
      ["autotroph","organism that makes its own food",["feeds only on dead matter","never makes food","always a parasite"]],
      ["heterotroph","obtains food from other organisms",["always photosynthesises","always a green plant","only fixes nitrogen"]],
      ["enzyme","biological catalyst speeding reactions",["used up permanently","found only in plants","carries genetic code"]],
      ["amylase","digests starch to maltose",["digests protein","digests fat","digests DNA"]],
      ["protease","digests proteins to amino acids",["digests starch","digests cellulose only","transports oxygen"]],
      ["lipase","digests lipids to fatty acids and glycerol",["digests starch","digests protein only","makes chlorophyll"]]
    ],
    transport: [
      ["xylem","transports water and mineral salts in plants",["transports sugars only","carries nerve impulses","produces hormones"]],
      ["phloem","transports manufactured sugars in plants",["transports water only upward","found only in animals","carries urine"]],
      ["transpiration","loss of water vapour mainly from leaves",["uptake of minerals only","is photosynthesis","is fertilisation"]],
      ["pulmonary vein","carries oxygenated blood from lungs to heart",["carries deoxygenated blood to lungs","heart to body","lymph only"]],
      ["pulmonary artery","carries deoxygenated blood from heart to lungs",["oxygenated blood to body","returns blood from body","plant tissue"]],
      ["aorta","oxygenated blood from left ventricle to body",["blood to lungs only","to right atrium","transports urine"]],
      ["vena cava","deoxygenated blood to right atrium",["leaves left ventricle","from lungs oxygenated","plant tissue"]],
      ["capillary","exchange of materials between blood and tissues",["thick muscular walls","pumps blood","produces bile"]],
      ["haemoglobin","transports oxygen in red blood cells",["digests pathogens","clots blood","found in xylem"]],
      ["stomata","pores on leaves for gas exchange",["root hairs","blood vessels","neurones"]]
    ],
    ecology: [
      ["population","same species in a given area",["all living and non-living things","only abiotic factors","the whole Earth"]],
      ["community","all populations in an area",["one species only","only climate","non-living only"]],
      ["ecosystem","living organisms interacting with non-living environment",["only zoo animals","only genes","a single cell"]],
      ["producer","makes own food usually green plant",["only eats meat","only decomposes","only parasitises"]],
      ["consumer","feeds on other organisms",["always photosynthesises","is abiotic","only decomposer"]],
      ["decomposer","breaks down dead matter recycling nutrients",["only live prey","photosynthesises","primary producer"]],
      ["food chain","energy flow from producers to consumers",["water cycle only","type of skeleton","blood vessel"]],
      ["habitat","place where an organism lives",["role only","a gene","a hormone"]],
      ["niche","role of an organism in its ecosystem",["only colour","only mass","a bone"]],
      ["abiotic factor","non-living environmental factor",["always a plant","always an animal","a predator only"]]
    ],
    genetics: [
      ["gene","unit of hereditary information on a chromosome",["sugar only","a muscle","a bone cell"]],
      ["allele","alternative form of a gene",["a tissue","digestive enzyme","blood vessel"]],
      ["genotype","genetic constitution of an organism",["only appearance","only habitat","only diet"]],
      ["phenotype","observable characteristics",["only hidden DNA","only chromosome number","an enzyme type"]],
      ["dominant allele","expressed even when heterozygous",["never expressed","only in recessives","only in RNA"]],
      ["recessive allele","expressed only when homozygous",["always masks dominant","only in mitochondria","not inherited"]],
      ["heterozygous","two different alleles of a gene",["two identical alleles","no alleles","only RNA"]],
      ["homozygous","two identical alleles of a gene",["different alleles","three alleles always","no chromosomes"]],
      ["mutation","change in genetic material",["type of digestion","limb movement","leaf water loss"]],
      ["DNA","molecule carrying genetic information",["protein hormone only","carb energy store only","a joint"]]
    ],
    reproduction: [
      ["pollination","pollen transfer from anther to stigma",["fusion of gametes","shedding leaves","urea formation"]],
      ["fertilisation","fusion of male and female gametes",["only pollination","only seed germination","only menstruation"]],
      ["ovule","becomes seed after fertilisation",["becomes fruit wall only","male gamete","a petal"]],
      ["ovary of flower","becomes fruit after fertilisation",["is the anther","produces pollen only","is a root"]],
      ["asexual reproduction","offspring from one parent without gamete fusion",["always two parents","always meiosis only","never in plants"]],
      ["binary fission","one cell splits into two identical cells",["sexual reproduction in mammals","pollination","a joint"]],
      ["Fallopian tube","usual site of human fertilisation",["implantation only","produces sperm","filters urine"]],
      ["uterus","implantation and foetal development",["produces eggs only","stores urine","sense organ"]],
      ["testis","produces sperm and testosterone",["produces eggs","stores urine","pumps blood"]],
      ["menstruation","shedding of uterine lining",["sperm production","photosynthesis","bone growth only"]]
    ],
    respiration: [
      ["ATP","energy currency of the cell",["hair structural protein only","plant pigment","nitrogenous waste"]],
      ["aerobic respiration","needs oxygen releases more energy from glucose",["only without oxygen","lactic acid main product in yeast","only in viruses"]],
      ["anaerobic respiration","releases energy without oxygen",["always needs oxygen","produces maximum ATP","only in chloroplasts"]],
      ["lactic acid","product of anaerobic respiration in muscle",["photosynthesis product","respiratory pigment","plant hormone"]],
      ["yeast fermentation","produces ethanol and carbon dioxide",["produces only oxygen","produces urea","produces starch"]],
      ["mitochondrion","organelle producing most ATP aerobically",["transcription only always","starch storage only","absent in eukaryotes"]],
      ["glycolysis","glucose breakdown in cytoplasm",["only in nucleus","needs chloroplasts","is fertilisation"]],
      ["oxygen debt","extra oxygen after anaerobic exercise to clear lactic acid",["a gene type","nitrogen fixation","bone disease"]]
    ],
    excretion: [
      ["excretion","removal of metabolic wastes",["undigested food only","oxygen uptake only","bone growth"]],
      ["urea","main nitrogenous waste in humans",["respiratory gas only","digestive enzyme","cell wall component"]],
      ["nephron","functional unit of the kidney",["liver unit only","a neurone","a bone"]],
      ["ultrafiltration","pressure filtration in the glomerulus",["glucose reabsorption only","bile secretion","pollination"]],
      ["ADH","increases water reabsorption in kidney",["digests fat","a blood group","a vitamin"]],
      ["ureter","urine from kidney to bladder",["bladder to outside only","bile duct","windpipe"]],
      ["urethra","urine from bladder to outside",["kidney to bladder","sperm duct only","oesophagus"]],
      ["liver","deamination and urea formation",["ultrafiltration site","only stores urine","produces pollen"]],
      ["egestion","removal of undigested food",["urea in urine","CO2 only","sweat salts only"]]
    ],
    coordination: [
      ["CNS","brain and spinal cord",["only peripheral nerves","only hormones","only sense organs"]],
      ["neurone","nerve cell transmitting impulses",["bone cell","red blood cell","xylem vessel"]],
      ["synapse","chemical junction between neurones",["bone joint","kidney tubule","leaf pore"]],
      ["reflex arc","receptor to sensory to relay to motor to effector",["only hormone secretion","only blood flow","photosynthesis"]],
      ["insulin","lowers blood glucose",["raises glucose only","thyroid only","digests starch"]],
      ["glucagon","raises blood glucose",["lowers glucose only","saliva enzyme","a vitamin"]],
      ["adrenaline","fight or flight hormone",["digests protein","stored in bones only","plant tropism"]],
      ["thyroxine","regulates metabolic rate",["clots blood","a carbohydrate","excreted as urea only"]],
      ["cerebellum","balance and movement coordination",["produces insulin only","filters blood","stores urine"]],
      ["medulla oblongata","controls breathing and heart rate",["leg bone","leaf tissue","produces gametes"]]
    ],
    growth: [
      ["growth","permanent increase in size and dry mass",["temporary water only","only movement","only excretion"]],
      ["mitosis","two identical diploid cells for growth and repair",["four haploid gametes","fertilisation","only in viruses"]],
      ["meiosis","produces haploid gametes",["two identical body cells only","breathing","transpiration"]],
      ["prophase","chromosomes condense and become visible",["poles separation only","cytoplasm divides only","DNA never present"]],
      ["metaphase","chromosomes at spindle equator",["nuclear membrane reforms only","DNA replicates only","animal cell wall forms"]],
      ["anaphase","chromatids separate to opposite poles",["chromosomes first visible only","cytokinesis always first","gametes fuse"]],
      ["dry mass","reliable growth measure excluding variable water",["includes all water always","never used experimentally","height only"]],
      ["crossing-over","exchange between homologous chromosomes in meiosis",["excretion type","muscle contraction","blood clotting"]]
    ],
    sense_organs: [
      ["retina","light-sensitive layer with rods and cones",["transparent front only","muscle pumping blood","ear part"]],
      ["cornea","transparent front refracting light",["detects sound","only produces tears","a bone"]],
      ["lens","focuses light on retina by changing shape",["carries blood","detects smell","a hormone"]],
      ["accommodation","lens shape change for near or far focus",["blood group change","urine formation","cell division"]],
      ["rod cell","dim light black-and-white vision",["colour only","bone cell","bacteria"]],
      ["cone cell","colour vision in bright light",["dim light only","muscle fibre","xylem cell"]],
      ["cochlea","hearing structure in inner ear",["balance only","eye part","kidney part"]],
      ["semicircular canals","balance structures in inner ear",["hearing pitch only","liver part","leaf veins"]],
      ["iris","controls pupil size and light entry",["focuses like lens only","skin temperature only","pumps blood"]],
      ["blind spot","no photoreceptors where optic nerve leaves",["most cones region","cornea centre","ear drum"]]
    ],
    skeleton: [
      ["endoskeleton","internal skeleton of vertebrates",["insect external skeleton","fluid skeleton only","no support"]],
      ["exoskeleton","external skeleton of insects and crabs",["human internal skeleton","mammal cartilage only","a leaf"]],
      ["tendon","connects muscle to bone",["bone to bone","nerve to muscle only","blood vessel"]],
      ["ligament","connects bone to bone",["muscle to bone","digestive enzyme","hormone"]],
      ["hinge joint","one-plane movement e.g. elbow knee",["all-plane like ball and socket","immovable sutures","plants only"]],
      ["ball and socket joint","many-plane movement e.g. shoulder hip",["one plane only","skull sutures","a neurone"]],
      ["antagonistic muscles","opposing pairs e.g. biceps triceps",["only push bones","opposing bones","paired hormones"]],
      ["femur","longest human bone thigh",["ear bone only","skull only","wrist only"]],
      ["cartilage","flexible tissue reducing joint friction",["always hard as bone","a blood type","plant tissue"]],
      ["bone marrow","produces blood cells",["produces urine","photosynthesis","sense organ"]]
    ],
    microorganisms: [
      ["pathogen","disease-causing micro-organism",["useful decomposer only","a vitamin","plant hormone"]],
      ["bacteria","prokaryotes some useful some pathogenic",["always viruses","always multicellular animals","never useful"]],
      ["virus","reproduces inside host cells acellular",["complete nucleated cell always","always fungus","plant organ"]],
      ["fungus","e.g. yeast mould some cause ringworm",["always bacterium","always virus","always protozoan"]],
      ["antibiotic","acts on many bacteria not viruses",["kills all viruses","vaccine only","blood group"]],
      ["vaccine","stimulates artificial active immunity",["an antibiotic","digestive enzyme","a joint"]],
      ["Plasmodium","protozoan causing malaria",["TB bacterium","flu virus","ringworm fungus"]],
      ["Anopheles mosquito","vector of malaria",["tsetse only","housefly only","water flea only"]],
      ["Rhizobium","nitrogen-fixing root nodule bacterium",["human virus","ringworm fungus","malaria protozoan"]],
      ["pasteurisation","heat treatment reducing harmful microbes in food",["antibiotics in soil only","photosynthesis type","bone formation"]]
    ],
    blood: [
      ["plasma","liquid part of blood with dissolved substances",["only red cells","only platelets","bone marrow type"]],
      ["red blood cell","oxygen transport via haemoglobin",["mainly antibodies","mainly clotting","only phagocytosis"]],
      ["white blood cell","defends against pathogens",["mainly oxygen","only haemoglobin","forms cell wall"]],
      ["platelet","involved in blood clotting",["carries oxygen","produces insulin","photosynthesises"]],
      ["blood group O","universal donor in ABO system",["universal recipient","has A and B antigens","cannot donate"]],
      ["blood group AB","universal recipient in ABO system",["universal donor","no A or B antigens","only antibodies a and b"]],
      ["phagocyte","engulfs and digests pathogens",["only antibodies","carries oxygen","a red cell"]],
      ["lymphocyte","can produce antibodies",["only carries CO2","a platelet","forms xylem"]],
      ["vaccination immunity","artificial active immunity",["only mother to baby","injected antibodies only","no response"]],
      ["anaemia","often lack of iron or haemoglobin",["always excess red cells","bone fracture","plant disease only"]]
    ]
  };

  var TOPICS = Object.keys(FACTS);
  var STEM_WAEC = [
    "Which of the following best describes {S}?",
    "{S} is best described as a structure or process that",
    "In WAEC Biology, {S}",
    "The main role associated with {S} is that it",
    "Which statement about {S} is correct?",
    "Students should know that {S}"
  ];
  var STEM_JAMB = [
    "Which one of the following best describes {S}?",
    "{S} is a structure or process that",
    "In JAMB Biology, {S}",
    "The primary function linked to {S} is that it",
    "A correct statement about {S} is that it",
    "It is correct to say that {S}"
  ];

  function mulberry32(a) {
    return function () {
      var t = (a += 0x6d2b79f5);
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  function shuffle(arr, rnd) {
    var a = arr.slice();
    for (var i = a.length - 1; i > 0; i--) {
      var j = Math.floor(rnd() * (i + 1));
      var tmp = a[i];
      a[i] = a[j];
      a[j] = tmp;
    }
    return a;
  }

  function buildPool(exam, target, seed) {
    var rnd = mulberry32(seed);
    var stems = exam === "jamb" ? STEM_JAMB : STEM_WAEC;
    var list = [];
    var seen = {};
    var n = 0;
    while (list.length < target && n < target * 30) {
      n++;
      var topic = TOPICS[list.length % TOPICS.length];
      var facts = FACTS[topic];
      var fi = Math.floor(rnd() * facts.length);
      var row = facts[fi];
      var subject = row[0];
      var fact = row[1];
      var distractors = row[2].slice();
      for (var k = 0; k < facts.length; k++) {
        if (k !== fi) distractors.push(facts[k][1]);
      }
      distractors = shuffle(distractors, rnd)
        .filter(function (d, i, arr) {
          return d !== fact && arr.indexOf(d) === i;
        })
        .slice(0, 3);
      while (distractors.length < 3) {
        distractors.push("None of these describes " + subject + " correctly");
      }

      var options = shuffle([fact].concat(distractors), rnd);
      var answer = options.indexOf(fact);
      var q = stems[list.length % stems.length].replace(/\{S\}/g, subject);
      var key = topic + "|" + q + "|" + options.join("^");
      if (seen[key]) continue;
      seen[key] = true;
      list.push({
        topic: topic,
        q: q,
        options: options,
        answer: answer,
        explanation:
          subject.charAt(0).toUpperCase() +
          subject.slice(1) +
          " " +
          fact +
          "."
      });
    }
    return list;
  }

  var moreWaec = buildPool("waec", 2500, 20260822);
  var moreJamb = buildPool("jamb", 2500, 20260823);

  function merge(key, items) {
    var cur = window.BIO_DATA[key];
    if (!Array.isArray(cur)) {
      window.BIO_DATA[key] = items.slice();
      return;
    }
    var seen = {};
    cur.forEach(function (q) {
      seen[(q.topic || "") + "|" + (q.q || "")] = true;
    });
    items.forEach(function (q) {
      var k = (q.topic || "") + "|" + (q.q || "");
      if (!seen[k]) {
        cur.push(q);
        seen[k] = true;
      }
    });
  }

  merge("waecQuestions", moreWaec);
  merge("jambQuestions", moreJamb);

  window.waecQuestions = window.BIO_DATA.waecQuestions;
  window.jambQuestions = window.BIO_DATA.jambQuestions;

  console.log(
    "[ExamBank] WAEC:",
    (window.BIO_DATA.waecQuestions || []).length,
    "JAMB:",
    (window.BIO_DATA.jambQuestions || []).length
  );
})();
