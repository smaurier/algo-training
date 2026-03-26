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
      { text: 'Labs', link: '/labs/lab-01-complexity-analysis/README' },
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
            { text: '04 — Récursion, divide & conquer, binary search', link: '/modules/04-recursion-divide-conquer-binary-search' },
            { text: '05 — Tri, partition, heaps', link: '/modules/05-tris-partition-heaps' },
            { text: '06 — Arbres & BST', link: '/modules/06-arbres-bst' },
            { text: '07 — Graphes & parcours', link: '/modules/07-graphes-et-parcours' },
            { text: '08 — Backtracking', link: '/modules/08-backtracking' },
            { text: '09 — Programmation dynamique', link: '/modules/09-programmation-dynamique' },
            { text: '10 — Greedy, union-find, trie', link: '/modules/10-greedy-unionfind-trie' },
            { text: '11 — Patterns JS fullstack', link: '/modules/11-patterns-js-fullstack' },
            { text: '12 — Projet final', link: '/modules/12-projet-final' },
          ],
        },
      ],
      '/labs/': [
        {
          text: 'Labs pratiques',
          items: [
            { text: 'Lab 01 — Analyse de complexité', link: '/labs/lab-01-complexity-analysis/README' },
            { text: 'Lab 02 — Tableaux & hash maps', link: '/labs/lab-02-arrays-hashmaps/README' },
            { text: 'Lab 03 — Stacks & queues', link: '/labs/lab-03-stacks-queues/README' },
            { text: 'Lab 04 — Récursion & binary search', link: '/labs/lab-04-recursion-binary-search/README' },
            { text: 'Lab 05 — Tri & heaps', link: '/labs/lab-05-sorting-heaps/README' },
            { text: 'Lab 06 — Navigation d\'arbres', link: '/labs/lab-06-tree-navigation/README' },
            { text: 'Lab 07 — Graphes & dépendances', link: '/labs/lab-07-graph-dependencies/README' },
            { text: 'Lab 08 — Backtracking solver', link: '/labs/lab-08-backtracking-solver/README' },
            { text: 'Lab 09 — Programmation dynamique', link: '/labs/lab-09-dynamic-programming/README' },
            { text: 'Lab 10 — Union-Find & Trie', link: '/labs/lab-10-unionfind-trie/README' },
            { text: 'Lab 11 — Patterns fullstack', link: '/labs/lab-11-fullstack-patterns/README' },
            { text: 'Lab 12 — Moteur de recommandation', link: '/labs/lab-12-recommendation-engine/README' },
          ],
        },
      ],
      '/quizzes/': [
        {
          text: 'Quizzes',
          items: [
            { text: 'Tous les quizzes', link: '/quizzes/' },
            { text: 'Quiz 00 — Prérequis', link: '/quizzes/quiz-00-prerequis' },
            { text: 'Quiz 01 — Complexité', link: '/quizzes/quiz-01-complexite' },
            { text: 'Quiz 02 — Tableaux & hash', link: '/quizzes/quiz-02-tableaux-hash' },
            { text: 'Quiz 03 — Stacks & queues', link: '/quizzes/quiz-03-stacks-queues' },
            { text: 'Quiz 04 — Récursion', link: '/quizzes/quiz-04-recursion' },
            { text: 'Quiz 05 — Tri & heaps', link: '/quizzes/quiz-05-tris-heaps' },
            { text: 'Quiz 06 — Arbres', link: '/quizzes/quiz-06-arbres' },
            { text: 'Quiz 07 — Graphes', link: '/quizzes/quiz-07-graphes' },
            { text: 'Quiz 08 — Backtracking', link: '/quizzes/quiz-08-backtracking' },
            { text: 'Quiz 09 — Programmation dynamique', link: '/quizzes/quiz-09-dp' },
            { text: 'Quiz 10 — Greedy, UF & Trie', link: '/quizzes/quiz-10-greedy-uf-trie' },
            { text: 'Quiz 11 — Patterns fullstack', link: '/quizzes/quiz-11-patterns-fullstack' },
            { text: 'Quiz 12 — Projet final', link: '/quizzes/quiz-12-projet-final' },
          ],
        },
      ],
      '/visualizations/': [
        {
          text: 'Visualisations interactives',
          items: [
            { text: 'Toutes les visualisations', link: '/visualizations/' },
            { text: 'Courbes de complexité', link: '/visualizations/viz-01-complexity-curves' },
            { text: 'Recherche binaire', link: '/visualizations/viz-02-binary-search' },
            { text: 'Algorithmes de tri', link: '/visualizations/viz-03-sorting' },
            { text: 'BFS vs DFS', link: '/visualizations/viz-04-bfs-dfs' },
            { text: 'Table DP', link: '/visualizations/viz-05-dp-table' },
          ],
        },
      ],
    },
    search: { provider: 'local' },
    outline: { level: [2, 3], label: 'Sur cette page' },
    docFooter: { prev: 'Précédent', next: 'Suivant' },
  },
})
