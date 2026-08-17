# ADR 0001: Choix de la Stack Frontend — Vue 3, TypeScript, Pinia & Break Infinity

- **Statut** : Accepté
- **Date** : 2026-08-17
- **Auteurs** : DevOpsBenjamin & Antigravity

---

## Contexte & Problématique

*Project Singularity Loop (IdleAGI)* est un jeu incrémental web temps réel avec une boucle de simulation à 20 ticks/sec (50ms). Il nécessite :
1. Une gestion fluide de grands nombres pouvant aller de $10^3$ à $10^{1000+}$ (Paramètres de modèles, Tokens, TFLOPS, Watts).
2. Un moteur logique réactif découplé du rendu graphique pour garantir 60 FPS sans lag de réconciliation DOM.
3. Des composants cyber-terminal modulaires avec styles isolés (scanlines CRT, oscilloscope Canvas, jauges thermodynamiques, sliders tri-directionnels).
4. Une persistance locale 100% `localStorage` avec catch-up hors ligne.

Plusieurs options de framework étaient envisagées : React 19, Vue 3, Svelte ou Vanilla TS.

---

## Décision

Nous choisissons la stack technique suivante :
- **Framework UI** : **Vue 3** (Composition API, `<script setup lang="ts">`, Single File Components).
- **Bundler & Build Tool** : **Vite**.
- **Langage** : **TypeScript** strict.
- **State Management** : **Pinia** + Moteur de simulation logique (`GameEngine`) avec `shallowRef`/`shallowReactive` pour les structures à haute fréquence de tick.
- **Moteur Mathématique de Grands Nombres** : **`break_infinity.js`** pour des calculs ultra-performants et légers avec formatage scientifique/engineering.
- **Composants d'icônes** : **`lucide-vue-next`** (Catalogue open-source officiel : https://lucide.dev/icons).
- **Styling** : **TailwindCSS** + Scoped CSS pour les micro-animations et le thème cyber-terminal sombre.

---

## Conséquences & Avantages

### Positives
- **Réactivité Fine-Grained sans Re-render Cascades** : Contrairement au cycle de réconciliation de React à 20 Hz, Vue 3 n'actualise que les nœuds DOM précis dont les valeurs ont changé.
- **Isolation CSS native** : `<style scoped>` dans les SFC Vue permet de styliser le terminal, l'oscilloscope et les jauges de température sans interférences.
- **Productivité & Alignement développeur** : Parfaite adéquation avec l'expérience du développeur principal tout en respectant l'architecture logicielle.

### Négatives / Points d'attention
- Éviter d'envelopper récursivement les instances `Decimal` dans des Proxies profonds (`reactive`) : utiliser `shallowRef` pour les états du tick loop afin de préserver les performances CPU.
