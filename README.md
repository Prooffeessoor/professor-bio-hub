# Professor Bio Hub

Interactive Biology learning PWA for **WAEC** and **JAMB** students.

## Features

- Textbook chapters (Cell, Nutrition, Transport, Ecology, Genetics, Reproduction)
- Spaced-repetition study cards
- Topic quizzes with explanations
- Practical lab guides (food tests, osmosis, drawing skills, etc.)
- WAEC practice — MSQ, Theory & Practical (Paper 3)
- JAMB-style MSQs
- Games (match organelles, term scramble)
- Local notes + progress / streak tracking
- Offline support via service worker
- Dark / light theme

## Live demo

After enabling GitHub Pages (Settings → Pages → Deploy from branch `main` / root):

**https://prooffeessoor.github.io/professor-bio-hub/**

## Run locally

Serve the folder over HTTP (service worker needs a secure context / localhost):

```bash
npx serve .
# or
python3 -m http.server 8080
```

Then open `http://localhost:8080`.

## Project structure

```
├── index.html
├── manifest.webmanifest
├── sw.js
├── icon-192.svg / icon-512.svg
└── data/
    ├── chapters.js
    ├── flashcards.js
    ├── quizzes.js
    ├── practicals.js
    ├── waecQuestions.js
    ├── waecTheoryQuestions.js
    ├── waecPracticalQuestions.js
    └── jambQuestions.js
```

## Optional: Firebase cloud sync

In `index.html`, fill `FIREBASE_CONFIG`, enable Anonymous Auth + Firestore. Progress and notes will sync across devices.

## License

Educational use. Built for Nigerian secondary-school Biology learners.
