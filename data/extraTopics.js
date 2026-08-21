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
    ]
  };

  var extraQuizzes = {
    respiration: [
      { q: 'Aerobic respiration requires:', options: ['Oxygen', 'Nitrogen only', 'Carbon dioxide only', 'Lactic acid'], answer: 0, explanation: 'Oxygen is the final electron acceptor.' },
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
