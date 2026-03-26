import { defineConfig } from 'vitepress'

export default defineConfig({
  title: 'Algorithms Course',
  description: 'Algorithmie progressive pour développeurs JavaScript fullstack',
  lang: 'fr-FR',
  srcDir: '.',
  ignoreDeadLinks: [
    /\/quizzes\/quiz-\d{2}/,
    /\/visualizations\//,
    /\/labs\/lab-\d{2}/,
  ],
  themeConfig: {
    nav: [
      { text: 'Modules', link: '/modules/00-prerequis-et-introduction' },
      { text: 'Labs', link: '/labs/lab-01-complexite/README' },
      { text: 'Quizzes', link: '/quizzes/' },
      { text: 'Visualisations', link: '/visualizations/' },
      { text: 'Glossaire', link: '/glossaire' },
    ],
    sidebar: {
      '/modules/': [
        {
          text: 'Parcours algorithmie',
          items: [
            { text: '00 — Prérequis & introduction', link: '/modules/00-prerequis-et-introduction' },
            { text: '01 — Complexité & raisonnement', link: '/modules/01-complexite-et-raisonnement' },
            { text: '02 — Tableaux, chaînes, hash maps', link: '/modules/02-tableaux-chaines-hash-maps' },
            { text: '03 — Stacks, queues, listes', link: '/modules/03-stacks-queues-listes' },
            { text: '04 — Récursion, divide & conquer, recherche dichotomique', link: '/modules/04-recursion-divide-conquer-binary-search' },
            { text: '05 — Tri, partition, heaps', link: '/modules/05-tris-partition-heaps' },
            { text: '06 — Arbres & BST', link: '/modules/06-arbres-bst' },
            { text: '07 — Graphes & parcours', link: '/modules/07-graphes-et-parcours' },
            { text: '08 — Backtracking', link: '/modules/08-backtracking-et-recherche-exhaustive' },
            { text: '09 — Programmation dynamique', link: '/modules/09-programmation-dynamique' },
            { text: '10 — Greedy, intervalles, union-find', link: '/modules/10-greedy-intervalles-union-find' },
            { text: '11 — Patterns algorithmiques du dev JS', link: '/modules/11-patterns-algorithmiques-js-fullstack' },
            { text: '12 — Projet final', link: '/modules/12-projet-final' },
          ],
        },
      ],
      '/quizzes/': [
        {
          text: 'Quizzes',
          items: [
            { text: 'Tous les quizzes', link: '/quizzes/' },
            { text: 'Quiz 00 — Introduction', link: '/quizzes/quiz-00-prerequis' },
            { text: 'Quiz 01 — Complexité', link: '/quizzes/quiz-01-complexite' },
            { text: 'Quiz 02 — Tableaux & hash maps', link: '/quizzes/quiz-02-tableaux-hashmaps' },
            { text: 'Quiz 03 — Stacks & queues', link: '/quizzes/quiz-03-stacks-queues' },
            { text: 'Quiz 04 — Récursion & binary search', link: '/quizzes/quiz-04-recursion-binary-search' },
            { text: 'Quiz 05 — Tri & heaps', link: '/quizzes/quiz-05-sorting-heaps' },
            { text: 'Quiz 06 — Arbres', link: '/quizzes/quiz-06-trees' },
            { text: 'Quiz 07 — Graphes', link: '/quizzes/quiz-07-graphs' },
            { text: 'Quiz 08 — Backtracking', link: '/quizzes/quiz-08-backtracking' },
            { text: 'Quiz 09 — Dynamic programming', link: '/quizzes/quiz-09-dynamic-programming' },
            { text: 'Quiz 10 — Greedy & union-find', link: '/quizzes/quiz-10-greedy-union-find' },
            { text: 'Quiz 11 — Patterns JS', link: '/quizzes/quiz-11-patterns-js' },
            { text: 'Quiz 12 — Projet final', link: '/quizzes/quiz-12-projet-final' },
          ],
        },
      ],
      '/visualizations/': [
        {
          text: 'Visualisations',
          items: [
            { text: 'Toutes les visualisations', link: '/visualizations/' },
            { text: 'Complexité', link: '/visualizations/complexity-growth.html' },
            { text: 'Binary search', link: '/visualizations/binary-search.html' },
            { text: 'Heap', link: '/visualizations/heap-operations.html' },
            { text: 'BFS vs DFS', link: '/visualizations/bfs-dfs.html' },
            { text: 'DP table', link: '/visualizations/dp-table.html' },
          ],
        },
      ],
    },
    search: { provider: 'local' },
    outline: { level: [2, 3], label: 'Sur cette page' },
    docFooter: { prev: 'Précédent', next: 'Suivant' },
  },
})
