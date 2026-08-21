/* Additional WAEC topics – merged into BIO_DATA */
(function () {
  window.BIO_DATA = window.BIO_DATA || {};

  var extraChapters = [
    {
      id: 'respiration',
      num: '7',
      title: 'Respiration',
      subtitle: 'Aerobic & anaerobic energy release',
      content: '<div class="content-card"><h2>7. Respiration</h2><p>Respiration is the process by which living cells release energy from food (usually glucose) for metabolic activities.</p><h3>Types</h3><ul><li><strong>Aerobic</strong> – requires oxygen; complete breakdown of glucose to CO<sub>2</sub> + H<sub>2</sub>O; high ATP yield (~36–38 ATP).</li><li><strong>Anaerobic</strong> – without oxygen; incomplete breakdown; low ATP (2 ATP). In muscles: lactic acid. In yeast: ethanol + CO<sub>2</sub> (fermentation).</li></ul><h3>Word equations</h3><ul><li>Aerobic: glucose + oxygen → carbon dioxide + water + energy</li><li>Anaerobic (muscle): glucose → lactic acid + energy</li><li>Anaerobic (yeast): glucose → ethanol + carbon dioxide + energy</li></ul><h3>Sites</h3><p>Glycolysis in cytoplasm; Krebs cycle and electron transport in mitochondria.</p><div class="highlight-box"><strong>WAEC Tip:</strong> Distinguish respiration (energy release in cells) from breathing (ventilation).</div></div>'
    },
    {
      id: 'excretion',
      num: '8',
      title: 'Excretion',
      subtitle: 'Removal of metabolic wastes',
      content: '<div class="content-card"><h2>8. Excretion</h2><p>Excretion is the removal of metabolic waste products from the body (not the same as egestion).</p><h3>Human excretory organs</h3><ul><li><strong>Kidneys</strong> – urea, excess salts and water (urine).</li><li><strong>Lungs</strong> – CO<sub>2</sub> and water vapour.</li><li><strong>Skin</strong> – sweat (water, salts, small urea).</li><li><strong>Liver</strong> – forms urea (deamination); detoxifies.</li></ul><h3>Kidney structure</h3><p>Cortex, medulla, pelvis. Nephron: glomerulus, Bowman’s capsule, proximal tubule, loop of Henle, distal tubule, collecting duct.</p><h3>Processes</h3><ul><li>Ultrafiltration at glomerulus</li><li>Selective reabsorption in tubules</li><li>Osmoregulation (ADH controls water reabsorption)</li></ul><div class="highlight-box"><strong>WAEC Tip:</strong> Egestion removes undigested food; excretion removes metabolic wastes.</div></div>'
    },
    {
      id: 'coordination',
      num: '9',
      title: 'Coordination & Control',
      subtitle: 'Nervous and hormonal systems',
      content: '<div class="content-card"><h2>9. Coordination &amp; Control</h2><p>Organisms coordinate responses to stimuli via the nervous system and endocrine (hormonal) system.</p><h3>Nervous system</h3><ul><li>CNS: brain and spinal cord</li><li>PNS: cranial and spinal nerves</li><li>Neurone: cell body, dendrites, axon; myelin sheath speeds impulse</li><li>Synapse: chemical transmission (neurotransmitters)</li><li>Reflex arc: receptor → sensory neurone → relay → motor → effector</li></ul><h3>Hormones (examples)</h3><ul><li>Insulin / glucagon – blood glucose</li><li>Adrenaline – fight or flight</li><li>Thyroxine – metabolic rate</li><li>ADH – water balance</li></ul><div class="highlight-box"><strong>WAEC Tip:</strong> Nervous = fast, electrical; hormonal = slower, chemical, longer lasting.</div></div>'
    },
    {
      id: 'growth',
      num: '10',
      title: 'Growth & Development',
      subtitle: 'Cell division, mitosis & life cycles',
      content: '<div class="content-card"><h2>10. Growth &amp; Development</h2><p>Growth is a permanent increase in size and dry mass of an organism, due mainly to cell division and cell enlargement.</p><h3>Types of growth</h3><ul><li><strong>Unlimited (indefinite)</strong> – continues throughout life (e.g. many plants).</li><li><strong>Limited (definite)</strong> – stops after maturity (e.g. most animals).</li></ul><h3>Mitosis</h3><p>Produces two identical diploid daughter cells for growth, repair and asexual reproduction. Stages: prophase, metaphase, anaphase, telophase (followed by cytokinesis).</p><h3>Meiosis</h3><p>Produces haploid gametes; involves two divisions; increases variation through crossing-over and independent assortment.</p><h3>Measurement of growth</h3><ul><li>Height / length</li><li>Fresh or dry mass</li><li>Number of leaves or cells</li></ul><div class="highlight-box"><strong>WAEC Tip:</strong> Dry mass is a more reliable growth measure than fresh mass because water content varies.</div></div>'
    },
    {
      id: 'sense_organs',
      num: '11',
      title: 'Sense Organs',
      subtitle: 'Eye, ear, skin receptors',
      content: '<div class="content-card"><h2>11. Sense Organs</h2><p>Sense organs detect stimuli and send impulses to the central nervous system.</p><h3>The eye</h3><ul><li><strong>Cornea</strong> – refracts light</li><li><strong>Iris</strong> – controls pupil size</li><li><strong>Lens</strong> – focuses light on the retina (accommodation)</li><li><strong>Retina</strong> – rods (dim light) and cones (colour)</li><li><strong>Optic nerve</strong> – carries impulses to the brain</li></ul><h3>The ear</h3><ul><li>Outer ear: pinna, auditory canal</li><li>Middle ear: eardrum, ossicles (malleus, incus, stapes)</li><li>Inner ear: cochlea (hearing), semicircular canals (balance)</li></ul><h3>Skin receptors</h3><p>Detect touch, pressure, pain, temperature.</p><div class="highlight-box"><strong>WAEC Tip:</strong> Accommodation = changing lens shape to focus near or distant objects.</div></div>'
    },
    {
      id: 'skeleton',
      num: '12',
      title: 'Support & Locomotion',
      subtitle: 'Skeleton, joints & muscles',
      content: '<div class="content-card"><h2>12. Support &amp; Locomotion</h2><p>The skeleton supports the body, protects organs, allows movement, and produces blood cells (in bone marrow).</p><h3>Types of skeleton</h3><ul><li><strong>Exoskeleton</strong> – outside the body (insects, crabs)</li><li><strong>Endoskeleton</strong> – inside (vertebrates)</li><li><strong>Hydrostatic</strong> – fluid pressure (earthworm)</li></ul><h3>Human skeleton</h3><p>Axial (skull, vertebral column, ribs) and appendicular (limbs, girdles).</p><h3>Joints</h3><ul><li>Ball and socket (shoulder, hip) – free movement</li><li>Hinge (elbow, knee) – one plane</li><li>Pivot (neck) – rotation</li></ul><h3>Muscles</h3><p>Antagonistic pairs (e.g. biceps and triceps) pull on bones across joints via tendons. Ligaments join bone to bone.</p><div class="highlight-box"><strong>WAEC Tip:</strong> Tendon = muscle to bone; ligament = bone to bone.</div></div>'
    },
    {
      id: 'microorganisms',
      num: '13',
      title: 'Micro-organisms & Health',
      subtitle: 'Bacteria, fungi, viruses & disease',
      content: '<div class="content-card"><h2>13. Micro-organisms &amp; Health</h2><p>Micro-organisms include bacteria, viruses, fungi and protozoa. Some are useful; others cause disease (pathogens).</p><h3>Useful roles</h3><ul><li>Decomposition and nutrient cycling</li><li>Food production (yeast in bread, bacteria in yoghurt)</li><li>Antibiotics (e.g. from fungi)</li><li>Nitrogen fixation (Rhizobium)</li></ul><h3>Disease transmission</h3><ul><li>Air / droplets (tuberculosis, influenza)</li><li>Water / food (cholera, typhoid)</li><li>Vectors (mosquito – malaria)</li><li>Contact / body fluids (HIV)</li></ul><h3>Control</h3><p>Hygiene, vaccination, antibiotics (bacteria only), vector control, safe water.</p><div class="highlight-box"><strong>WAEC Tip:</strong> Antibiotics do not kill viruses; vaccination prepares the immune system.</div></div>'
    },
    {
      id: 'blood',
      num: '14',
      title: 'Blood & Immunity',
      subtitle: 'Composition, groups & defence',
      content: '<div class="content-card"><h2>14. Blood &amp; Immunity</h2><p>Blood transports substances, regulates temperature and defends against disease.</p><h3>Composition</h3><ul><li><strong>Plasma</strong> – water, proteins, nutrients, wastes, hormones</li><li><strong>Red blood cells</strong> – haemoglobin; carry oxygen; no nucleus</li><li><strong>White blood cells</strong> – phagocytes and lymphocytes; defence</li><li><strong>Platelets</strong> – clotting</li></ul><h3>Blood groups</h3><p>ABO system (A, B, AB, O) and Rhesus factor (+/−). Wrong transfusion causes agglutination.</p><h3>Immunity</h3><ul><li><strong>Natural active</strong> – after infection</li><li><strong>Artificial active</strong> – vaccination</li><li><strong>Natural passive</strong> – antibodies from mother</li><li><strong>Artificial passive</strong> – injected antibodies (serum)</li></ul><div class="highlight-box"><strong>WAEC Tip:</strong> Group O is universal donor; AB is universal recipient (with care regarding Rh).</div></div>'
    }
  ];

  var extraCards = {
    respiration: [
      { front: 'What is respiration?', back: 'Release of energy from food in cells' },
      { front: 'Site of Krebs cycle', back: 'Mitochondrial matrix' },
      { front: 'Product of anaerobic respiration in muscles', back: 'Lactic acid' },
      { front: 'Gas produced by yeast fermentation', back: 'Carbon dioxide' },
      { front: 'Approximate ATP from aerobic respiration of one glucose', back: 'About 36–38 ATP' },
      { front: 'Breathing vs respiration', back: 'Breathing = ventilation; respiration = cellular energy release' }
    ],
    excretion: [
      { front: 'Define excretion', back: 'Removal of metabolic waste products from the body' },
      { front: 'Main nitrogenous waste in humans', back: 'Urea' },
      { front: 'Functional unit of the kidney', back: 'Nephron' },
      { front: 'Process at the glomerulus', back: 'Ultrafiltration' },
      { front: 'Hormone controlling water reabsorption', back: 'ADH (antidiuretic hormone)' },
      { front: 'Excretion vs egestion', back: 'Excretion = metabolic wastes; egestion = undigested food' }
    ],
    coordination: [
      { front: 'Two main coordination systems', back: 'Nervous and endocrine (hormonal)' },
      { front: 'CNS consists of', back: 'Brain and spinal cord' },
      { front: 'Junction between neurones', back: 'Synapse' },
      { front: 'Path of a simple reflex', back: 'Receptor → sensory → relay → motor → effector' },
      { front: 'Hormone that lowers blood glucose', back: 'Insulin' },
      { front: 'Hormone for fight-or-flight', back: 'Adrenaline' }
    ],
    growth: [
      { front: 'Best measure of true growth', back: 'Increase in dry mass' },
      { front: 'Division producing identical body cells', back: 'Mitosis' },
      { front: 'Division producing gametes', back: 'Meiosis' },
      { front: 'Stages of mitosis (order)', back: 'Prophase → metaphase → anaphase → telophase' },
      { front: 'Unlimited growth example', back: 'Many plants (continues throughout life)' },
      { front: 'Why dry mass > fresh mass for growth studies', back: 'Water content varies; dry mass is more reliable' }
    ],
    sense_organs: [
      { front: 'Part of eye that focuses light on retina', back: 'Lens (with cornea)' },
      { front: 'Cells for colour vision', back: 'Cones' },
      { front: 'Cells for dim light vision', back: 'Rods' },
      { front: 'Changing lens shape for near/far focus', back: 'Accommodation' },
      { front: 'Inner ear structure for hearing', back: 'Cochlea' },
      { front: 'Structures for balance in the ear', back: 'Semicircular canals' }
    ],
    skeleton: [
      { front: 'Skeleton inside the body', back: 'Endoskeleton' },
      { front: 'Skeleton outside the body', back: 'Exoskeleton' },
      { front: 'Connects muscle to bone', back: 'Tendon' },
      { front: 'Connects bone to bone', back: 'Ligament' },
      { front: 'Joint type at the shoulder', back: 'Ball and socket' },
      { front: 'Joint type at the elbow', back: 'Hinge joint' }
    ],
    microorganisms: [
      { front: 'Microbe that causes malaria', back: 'Plasmodium (protozoan); vector = mosquito' },
      { front: 'Why antibiotics fail against colds', back: 'Colds are viral; antibiotics target bacteria' },
      { front: 'Useful role of yeast', back: 'Fermentation (bread, alcohol)' },
      { front: 'Bacterium in root nodules', back: 'Rhizobium (nitrogen fixation)' },
      { front: 'Artificial active immunity', back: 'Vaccination' },
      { front: 'Air-borne bacterial disease example', back: 'Tuberculosis (TB)' }
    ],
    blood: [
      { front: 'Pigment that carries oxygen', back: 'Haemoglobin' },
      { front: 'Blood cells with no nucleus when mature', back: 'Red blood cells' },
      { front: 'Cells involved in clotting', back: 'Platelets' },
      { front: 'Universal donor blood group', back: 'O' },
      { front: 'Universal recipient blood group', back: 'AB' },
      { front: 'Immunity after vaccination', back: 'Artificial active immunity' }
    ]
  };

  var extraQuizzes = {
    respiration: [
      { q: 'Aerobic respiration requires:', options: ['Oxygen', 'Nitrogen only', 'Carbon dioxide only', 'Lactic acid'], answer: 0 },
      { q: 'Anaerobic respiration in human muscle produces:', options: ['Ethanol', 'Lactic acid', 'Oxygen', 'Starch'], answer: 1 },
      { q: 'Most ATP from aerobic respiration is made in the:', options: ['Nucleus', 'Ribosome', 'Mitochondria', 'Golgi body'], answer: 2 },
      { q: 'Yeast fermentation produces ethanol and:', options: ['Oxygen', 'Nitrogen', 'Carbon dioxide', 'Urea'], answer: 2 },
      { q: 'Glycolysis occurs in the:', options: ['Cytoplasm', 'Nucleus', 'Chloroplast', 'Golgi'], answer: 0 }
    ],
    excretion: [
      { q: 'The main excretory organ for urea is the:', options: ['Liver', 'Kidney', 'Pancreas', 'Stomach'], answer: 1 },
      { q: 'Ultrafiltration occurs in the:', options: ['Loop of Henle', 'Glomerulus', 'Ureter', 'Bladder'], answer: 1 },
      { q: 'ADH mainly controls reabsorption of:', options: ['Glucose', 'Protein', 'Water', 'Urea only'], answer: 2 },
      { q: 'Deamination of amino acids occurs mainly in the:', options: ['Kidney', 'Liver', 'Lung', 'Skin'], answer: 1 },
      { q: 'Egestion is the removal of:', options: ['Urea', 'CO2', 'Undigested food', 'Sweat salts'], answer: 2 }
    ],
    coordination: [
      { q: 'The CNS is made up of:', options: ['Nerves only', 'Brain and spinal cord', 'Hormones', 'Sense organs only'], answer: 1 },
      { q: 'Chemical transmission at a synapse uses:', options: ['ATP only', 'Neurotransmitters', 'Urea', 'Oxygen'], answer: 1 },
      { q: 'Insulin is produced by the:', options: ['Thyroid', 'Adrenal gland', 'Pancreas', 'Pituitary only'], answer: 2 },
      { q: 'A reflex action is:', options: ['Always learned', 'Rapid and automatic', 'Only hormonal', 'Slow and voluntary'], answer: 1 },
      { q: 'Adrenaline prepares the body for:', options: ['Sleep', 'Digestion only', 'Fight or flight', 'Growth only'], answer: 2 }
    ],
    growth: [
      { q: 'The most reliable measure of growth is increase in:', options: ['Fresh mass', 'Dry mass', 'Height only', 'Water content'], answer: 1 },
      { q: 'Mitosis is used for:', options: ['Gamete formation only', 'Growth and repair', 'Halving chromosome number', 'Crossing-over only'], answer: 1 },
      { q: 'Meiosis produces:', options: ['Two diploid cells', 'Four haploid cells', 'Two haploid cells only', 'Four diploid cells'], answer: 1 },
      { q: 'Chromosomes line up at the equator in:', options: ['Prophase', 'Metaphase', 'Anaphase', 'Telophase'], answer: 1 },
      { q: 'Growth that continues throughout life is called:', options: ['Limited', 'Unlimited (indefinite)', 'Isometric only', 'Negative growth'], answer: 1 }
    ],
    sense_organs: [
      { q: 'Light-sensitive layer of the eye is the:', options: ['Cornea', 'Iris', 'Retina', 'Sclera'], answer: 2 },
      { q: 'Accommodation is mainly due to change in the:', options: ['Pupil only', 'Lens shape', 'Eyelid', 'Optic nerve length'], answer: 1 },
      { q: 'Which cells detect colour?', options: ['Rods', 'Cones', 'Platelets', 'Osteocytes'], answer: 1 },
      { q: 'The cochlea is concerned with:', options: ['Balance only', 'Hearing', 'Smell', 'Taste'], answer: 1 },
      { q: 'Semicircular canals help with:', options: ['Hearing pitch', 'Balance and posture', 'Focusing light', 'Clotting'], answer: 1 }
    ],
    skeleton: [
      { q: 'An endoskeleton is found in:', options: ['Insects', 'Crabs', 'Humans', 'Spiders'], answer: 2 },
      { q: 'A hinge joint is found at the:', options: ['Shoulder', 'Hip', 'Elbow', 'Skull sutures'], answer: 2 },
      { q: 'Tendons connect:', options: ['Bone to bone', 'Muscle to bone', 'Nerve to muscle', 'Skin to bone'], answer: 1 },
      { q: 'Ligaments connect:', options: ['Muscle to muscle', 'Muscle to bone', 'Bone to bone', 'Nerve to bone'], answer: 2 },
      { q: 'Biceps and triceps are an example of:', options: ['Parallel bones', 'Antagonistic muscles', 'Sense organs', 'Hormones'], answer: 1 }
    ],
    microorganisms: [
      { q: 'Malaria is transmitted by:', options: ['Tsetse fly', 'Female Anopheles mosquito', 'Housefly only', 'Water fleas'], answer: 1 },
      { q: 'Antibiotics are effective against:', options: ['All viruses', 'Many bacteria', 'All fungi only', 'Malaria protozoa only'], answer: 1 },
      { q: 'Vaccination provides:', options: ['Natural passive immunity', 'Artificial active immunity', 'No immunity', 'Only temporary pain relief'], answer: 1 },
      { q: 'Rhizobium helps plants by:', options: ['Causing wilt', 'Fixing nitrogen', 'Eating roots', 'Producing viruses'], answer: 1 },
      { q: 'Which is a viral disease?', options: ['Tuberculosis', 'Cholera', 'Influenza', 'Ringworm'], answer: 2 }
    ],
    blood: [
      { q: 'Oxygen is carried mainly by:', options: ['Plasma only', 'Platelets', 'Haemoglobin in red cells', 'White cells'], answer: 2 },
      { q: 'Which blood group is the universal donor?', options: ['A', 'B', 'AB', 'O'], answer: 3 },
      { q: 'Platelets are important for:', options: ['Carrying oxygen', 'Fighting viruses only', 'Blood clotting', 'Producing bile'], answer: 2 },
      { q: 'Phagocytes mainly:', options: ['Carry hormones', 'Engulf pathogens', 'Store fat', 'Make urine'], answer: 1 },
      { q: 'Immunity after recovering from measles is:', options: ['Artificial passive', 'Natural active', 'Artificial active', 'Natural passive only'], answer: 1 }
    ]
  };

  if (Array.isArray(window.BIO_DATA.chapters)) {
    var ids = {};
    window.BIO_DATA.chapters.forEach(function (c) { ids[c.id] = true; });
    extraChapters.forEach(function (c) {
      if (!ids[c.id]) window.BIO_DATA.chapters.push(c);
    });
  } else {
    window.BIO_DATA.chapters = extraChapters.slice();
  }

  window.BIO_DATA.flashcards = window.BIO_DATA.flashcards || {};
  Object.keys(extraCards).forEach(function (k) {
    window.BIO_DATA.flashcards[k] = extraCards[k];
  });

  window.BIO_DATA.quizzes = window.BIO_DATA.quizzes || {};
  Object.keys(extraQuizzes).forEach(function (k) {
    window.BIO_DATA.quizzes[k] = extraQuizzes[k];
  });
})();
