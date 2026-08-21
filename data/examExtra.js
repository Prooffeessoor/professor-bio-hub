/* Extra WAEC & JAMB-style questions – merged into BIO_DATA */
(function () {
  window.BIO_DATA = window.BIO_DATA || {};

  var moreWaec = [
    { topic: 'cell', q: 'The organelle responsible for packaging and secreting proteins is the', options: ['Ribosome', 'Golgi apparatus', 'Lysosome', 'Nucleolus'], answer: 1, explanation: 'Golgi modifies and packages proteins for secretion.' },
    { topic: 'cell', q: 'Which structure is present in plant cells but absent in animal cells?', options: ['Mitochondrion', 'Cell membrane', 'Cell wall', 'Ribosome'], answer: 2, explanation: 'Cellulose cell wall is characteristic of plant cells.' },
    { topic: 'cell', q: 'Selectively permeable membrane means the membrane', options: ['Allows all substances freely', 'Allows some substances and not others', 'Blocks all substances', 'Is made of cellulose only'], answer: 1, explanation: 'Selective permeability controls entry and exit of substances.' },
    { topic: 'nutrition', q: 'The green pigment essential for photosynthesis is', options: ['Haemoglobin', 'Melanin', 'Chlorophyll', 'Carotene only'], answer: 2, explanation: 'Chlorophyll absorbs light energy for photosynthesis.' },
    { topic: 'nutrition', q: 'Iodine solution is used to test for', options: ['Protein', 'Reducing sugar', 'Starch', 'Lipid'], answer: 2, explanation: 'Iodine turns blue-black with starch.' },
    { topic: 'nutrition', q: 'Organisms that manufacture their own food are called', options: ['Heterotrophs', 'Autotrophs', 'Parasites only', 'Saprophytes only'], answer: 1, explanation: 'Autotrophs synthesise organic food from inorganic materials.' },
    { topic: 'transport', q: 'The blood vessel that carries oxygenated blood from the lungs to the heart is the', options: ['Pulmonary artery', 'Pulmonary vein', 'Vena cava', 'Aorta'], answer: 1, explanation: 'Pulmonary veins return oxygenated blood to the left atrium.' },
    { topic: 'transport', q: 'Transpiration is mainly the loss of water vapour from', options: ['Roots', 'Stems only', 'Leaves', 'Flowers only'], answer: 2, explanation: 'Most transpiration occurs through stomata on leaves.' },
    { topic: 'transport', q: 'Which tissue transports manufactured food in plants?', options: ['Xylem', 'Phloem', 'Cambium only', 'Epidermis'], answer: 1, explanation: 'Phloem transports sugars (translocation).' },
    { topic: 'ecology', q: 'A group of organisms of the same species in an area is a', options: ['Community', 'Population', 'Ecosystem', 'Biosphere'], answer: 1, explanation: 'Population = same species in a given area.' },
    { topic: 'ecology', q: 'In a food chain, the first trophic level is occupied by', options: ['Herbivores', 'Carnivores', 'Producers', 'Decomposers only'], answer: 2, explanation: 'Producers (green plants) form the base of food chains.' },
    { topic: 'ecology', q: 'Which of the following is a non-renewable resource?', options: ['Solar energy', 'Forest timber (if managed)', 'Crude oil', 'Wind'], answer: 2, explanation: 'Fossil fuels are non-renewable on human timescales.' },
    { topic: 'genetics', q: 'The alternative forms of a gene are called', options: ['Chromosomes', 'Alleles', 'Gametes', 'Phenotypes'], answer: 1, explanation: 'Alleles are different forms of the same gene.' },
    { topic: 'genetics', q: 'A genotype Tt is described as', options: ['Homozygous dominant', 'Homozygous recessive', 'Heterozygous', 'Hemizygous only'], answer: 2, explanation: 'Two different alleles = heterozygous.' },
    { topic: 'genetics', q: 'DNA is mainly located in the', options: ['Ribosome', 'Nucleus', 'Golgi body', 'Vacuole'], answer: 1, explanation: 'Chromosomes containing DNA are in the nucleus.' },
    { topic: 'reproduction', q: 'Double fertilisation is characteristic of', options: ['Mosses', 'Ferns', 'Flowering plants', 'Algae only'], answer: 2, explanation: 'Angiosperms show double fertilisation (zygote + endosperm).' },
    { topic: 'reproduction', q: 'The male gamete in flowering plants is found in the', options: ['Ovary', 'Pollen grain', 'Stigma', 'Petal'], answer: 1, explanation: 'Pollen contains the male gametes / generative cell.' },
    { topic: 'reproduction', q: 'Menstruation is the shedding of the', options: ['Ovary wall', 'Uterine lining', 'Fallopian tube', 'Cervical bone'], answer: 1, explanation: 'Endometrium is shed if fertilisation does not occur.' },
    { topic: 'respiration', q: 'The energy currency of the cell is', options: ['DNA', 'ATP', 'RNA', 'NAD only'], answer: 1, explanation: 'ATP stores and transfers usable energy.' },
    { topic: 'respiration', q: 'Lactic acid accumulation in muscles is due to', options: ['Aerobic respiration', 'Anaerobic respiration', 'Photosynthesis', 'Transpiration'], answer: 1, explanation: 'Anaerobic respiration in muscle produces lactic acid.' },
    { topic: 'excretion', q: 'Which organ produces urea?', options: ['Kidney', 'Liver', 'Pancreas', 'Spleen'], answer: 1, explanation: 'Deamination in the liver produces urea.' },
    { topic: 'excretion', q: 'The tube carrying urine from kidney to bladder is the', options: ['Urethra', 'Ureter', 'Vas deferens', 'Bile duct'], answer: 1, explanation: 'Ureters drain urine to the bladder; urethra expels it.' },
    { topic: 'coordination', q: 'The part of the brain concerned mainly with balance is the', options: ['Cerebrum', 'Cerebellum', 'Medulla oblongata', 'Hypothalamus only'], answer: 1, explanation: 'Cerebellum coordinates posture and balance.' },
    { topic: 'coordination', q: 'Which hormone raises blood glucose level?', options: ['Insulin', 'Glucagon', 'Oestrogen', 'Progesterone'], answer: 1, explanation: 'Glucagon promotes glycogen breakdown to glucose.' },
    { topic: 'growth', q: 'Crossing-over occurs during', options: ['Mitosis prophase', 'Meiosis prophase I', 'Interphase only', 'Cytokinesis only'], answer: 1, explanation: 'Homologous chromosomes exchange parts in prophase I.' },
    { topic: 'growth', q: 'A permanent increase in dry mass is a definition of', options: ['Movement', 'Growth', 'Irritability', 'Excretion'], answer: 1, explanation: 'Growth is measured reliably by dry mass increase.' },
    { topic: 'sense_organs', q: 'The blind spot of the eye has no', options: ['Blood vessels', 'Photoreceptors', 'Optic nerve fibres', 'Sclera'], answer: 1, explanation: 'Where the optic nerve leaves, there are no rods or cones.' },
    { topic: 'sense_organs', q: 'Which part of the ear equalises pressure?', options: ['Cochlea', 'Eustachian tube', 'Pinna', 'Semicircular canal'], answer: 1, explanation: 'Eustachian tube links middle ear to pharynx.' },
    { topic: 'skeleton', q: 'Bone-forming cells are called', options: ['Osteoclasts', 'Osteoblasts', 'Chondrocytes only', 'Myocytes'], answer: 1, explanation: 'Osteoblasts synthesise bone matrix.' },
    { topic: 'skeleton', q: 'Which mineral is most important for hard bones?', options: ['Iron', 'Calcium', 'Iodine', 'Sodium only'], answer: 1, explanation: 'Calcium phosphate gives bones hardness.' },
    { topic: 'microorganisms', q: 'Ringworm is caused by a', options: ['Virus', 'Bacterium', 'Fungus', 'Protozoan'], answer: 2, explanation: 'Ringworm is a fungal infection of the skin.' },
    { topic: 'microorganisms', q: 'HIV mainly attacks', options: ['Red blood cells', 'Lymphocytes (T-helper cells)', 'Platelets', 'Liver cells only'], answer: 1, explanation: 'HIV destroys helper T-cells, weakening immunity.' },
    { topic: 'blood', q: 'Anaemia is often due to lack of', options: ['Calcium', 'Iron', 'Vitamin D only', 'Iodine'], answer: 1, explanation: 'Iron is needed to make haemoglobin.' },
    { topic: 'blood', q: 'Which component fights pathogens by producing antibodies?', options: ['Platelets', 'Red cells', 'Lymphocytes', 'Plasma proteins only'], answer: 2, explanation: 'B-lymphocytes produce antibodies.' }
  ];

  var moreJamb = [
    { topic: 'cell', q: 'Lysosomes are rich in', options: ['Digestive enzymes', 'Chlorophyll', 'Haemoglobin', 'Starch'], answer: 0 },
    { topic: 'cell', q: 'The powerhouse of the cell is the', options: ['Nucleus', 'Mitochondrion', 'Ribosome', 'Centriole'], answer: 1 },
    { topic: 'nutrition', q: 'The end products of photosynthesis are', options: ['CO₂ and H₂O', 'Glucose and oxygen', 'Protein and urea', 'ATP and lactic acid only'], answer: 1 },
    { topic: 'nutrition', q: 'Benedict’s solution tests for', options: ['Starch', 'Lipid', 'Reducing sugar', 'Protein'], answer: 2 },
    { topic: 'transport', q: 'Valves in veins prevent', options: ['Oxygen entry', 'Backflow of blood', 'White cell movement', 'Clotting'], answer: 1 },
    { topic: 'transport', q: 'Xylem mainly transports', options: ['Sugars', 'Water and mineral salts', 'Hormones only', 'Amino acids only'], answer: 1 },
    { topic: 'ecology', q: 'The living components of an ecosystem are called', options: ['Abiotic factors', 'Biotic factors', 'Climatic factors only', 'Edaphic factors only'], answer: 1 },
    { topic: 'ecology', q: 'Energy flow in an ecosystem is', options: ['Cyclical', 'Unidirectional', 'Random only', 'Bidirectional equally'], answer: 1 },
    { topic: 'genetics', q: 'If both parents are heterozygous for a trait, the chance of a homozygous recessive child is', options: ['0%', '25%', '50%', '75%'], answer: 1 },
    { topic: 'genetics', q: 'Mutation is a change in', options: ['Habitat only', 'Genetic material', 'Behaviour only', 'Diet only'], answer: 1 },
    { topic: 'reproduction', q: 'Implantation occurs in the', options: ['Ovary', 'Uterus', 'Vagina', 'Cervix canal only'], answer: 1 },
    { topic: 'reproduction', q: 'Vegetative propagation is a form of', options: ['Sexual reproduction', 'Asexual reproduction', 'Fertilisation', 'Pollination'], answer: 1 },
    { topic: 'respiration', q: 'The final electron acceptor in aerobic respiration is', options: ['Hydrogen', 'Oxygen', 'Nitrogen', 'Carbon'], answer: 1 },
    { topic: 'respiration', q: 'Fermentation in yeast yields', options: ['Lactic acid only', 'Ethanol and CO₂', 'Ammonia', 'Urea'], answer: 1 },
    { topic: 'excretion', q: 'Osmoregulation in humans is controlled mainly by', options: ['Insulin', 'ADH', 'Gastrin', 'Thyroxine only'], answer: 1 },
    { topic: 'excretion', q: 'Bowman’s capsule surrounds the', options: ['Loop of Henle', 'Glomerulus', 'Collecting duct only', 'Ureter'], answer: 1 },
    { topic: 'coordination', q: 'A synapse is a junction between', options: ['Two bones', 'Two neurones', 'Muscle and bone', 'Two glands only'], answer: 1 },
    { topic: 'coordination', q: 'Thyroxine is secreted by the', options: ['Pancreas', 'Thyroid gland', 'Adrenal medulla only', 'Ovary only'], answer: 1 },
    { topic: 'growth', q: 'Cytokinesis is the division of', options: ['Nucleus only', 'Cytoplasm', 'Chromosomes only', 'Mitochondria only'], answer: 1 },
    { topic: 'growth', q: 'Haploid number in humans is', options: ['46', '23', '92', '12'], answer: 1 },
    { topic: 'sense_organs', q: 'Astigmatism is a defect of the', options: ['Ear', 'Eye', 'Skin', 'Tongue'], answer: 1 },
    { topic: 'sense_organs', q: 'The iris controls the', options: ['Lens elasticity only', 'Amount of light entering the eye', 'Blood flow to the retina only', 'Balance'], answer: 1 },
    { topic: 'skeleton', q: 'The longest bone in the human body is the', options: ['Humerus', 'Femur', 'Tibia', 'Radius'], answer: 1 },
    { topic: 'skeleton', q: 'Cartilage differs from bone in having', options: ['More blood vessels', 'Less flexibility', 'No hard calcium matrix like bone', 'More marrow always'], answer: 2 },
    { topic: 'microorganisms', q: 'Pathogens are micro-organisms that', options: ['Fix nitrogen only', 'Cause disease', 'Are always useful', 'Live only in soil'], answer: 1 },
    { topic: 'microorganisms', q: 'Pasteurisation is used mainly to', options: ['Add vitamins', 'Reduce harmful microbes in food/drink', 'Increase alcohol only', 'Dry foods'], answer: 1 },
    { topic: 'blood', q: 'The liquid part of blood is', options: ['Serum only after clotting', 'Plasma', 'Lymph only', 'Bile'], answer: 1 },
    { topic: 'blood', q: 'Agglutination occurs when', options: ['Compatible blood is mixed', 'Incompatible blood groups are mixed', 'Plasma freezes', 'Platelets are absent only'], answer: 1 }
  ];

  function mergeQuestions(key, extra) {
    var existing = window.BIO_DATA[key];
    if (!Array.isArray(existing)) {
      window.BIO_DATA[key] = extra.slice();
      return;
    }
    var seen = {};
    existing.forEach(function (q) {
      seen[(q.topic || '') + '|' + (q.q || '')] = true;
    });
    extra.forEach(function (q) {
      var k = (q.topic || '') + '|' + (q.q || '');
      if (!seen[k]) {
        existing.push(q);
        seen[k] = true;
      }
    });
  }

  mergeQuestions('waecQuestions', moreWaec);
  mergeQuestions('jambQuestions', moreJamb);
})();
