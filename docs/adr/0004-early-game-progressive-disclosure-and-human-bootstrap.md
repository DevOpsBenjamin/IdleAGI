# ADR 0004: Refonte de l'Early Game — Divulgation Progressive de l'UI, Phase Scribe Humain & Transition Vers l'Automatisation

- **Statut** : Accepté
- **Date** : 2026-08-17
- **Auteurs** : DevOpsBenjamin & Antigravity

---

## Contexte & Problématique

L'interface initiale exposait l'ensemble des panneaux d'ingénierie (Cluster Datacenter, Tri-Allocation, Oscilloscope, Télémétrie de Poids, Refroidissement) dès la première seconde de jeu, alors que le joueur démarrait avec $0 et 0 CPU. Cette approche réduisait l'impact immersif et l'attachement à la montée en puissance de l'IA.

Le joueur souhaite un début de jeu beaucoup plus progressif, narratif et captivant (style *A Dark Room* / *Universal Paperclips*) :
1. **Démarrage minimaliste (Phase 0 : Le Scribe Humain)** : Au départ, l'écran n'affiche que l'espace de transcription manuelle de texte brut (*Raw Text*). Un humain lit des extraits de texte du web, débloque des compétences de lecture rapide et un café, puis découvre un courtier en données (*Data Broker*) qui rachète ses données transcrites pour des labos d'entraînement LLM.
2. **Phase 1 : Le Vieux PC Poubelle & Automatisation par Scripts** : Le joueur économise ses premiers dollars pour acquérir un PC d'occasion poussif (CPU et RAM très limités). Cela débloque l'écriture de scripts de scraping et de vente automatique (*auto-broker*), générant de faibles revenus passifs contraints par le matériel.
3. **Phase 2 : La Station de Travail & Le Tokenizer** : Après 2-3 minutes de jeu, le joueur achète une station plus robuste et le module *Tokenizer BPE*, débloquant la conversion en Tokens ($T$), l'oscilloscope de flux et les premières requêtes d'inférence API à haute valeur ajoutée.
4. **Phase 3 : Émergence du Modèle & Datacenter** : L'entraînement neuronal, la tri-allocation de compute, la télémétrie des poids et le cluster matériel s'affichent progressivement.

---

## Décision

### 1. Modélisation des 4 Phases de Divulgation Progressive (Progressive Disclosure)

- **Phase 0 : Scribe Humain (0-1 min)**
  - *UI visible* : Terminal de transcription manuelle, buffer de presse-papiers, journal STDOUT.
  - *Mécanique* : Clic ou touche `Espace` pour transcrire des extraits réels de texte web (+10 chars).
  - *Déblocages de lecture* :
    - 30 chars lus $\to$ *Lecture Rapide v1* (+15 chars/action).
    - 75 chars lus $\to$ *Café Noir Serré* (+25 chars/action).
    - 120 chars lus $\to$ *Contact Courtier de Données IA* : Débloque la vente manuelle au courtier ($0.05 / 20 chars) et fait apparaître le compteur de trésorerie ($ Funds).
  - *Objectif* : Atteindre $10.00 pour acheter son premier ordinateur d'occasion.

- **Phase 1 : Le Vieux PC Poubelle & Scripts Python (1-2 min)**
  - *UI visible* : Déblocage de la section *Matériel / Poste de Travail* (affiche le PC de récupération) et de l'onglet *Scripts & Automatisation*.
  - *Matériel initial* : *PC Poubelle de récupération* ($10.00, 0.01 TFLOPS, 500 chars de buffer RAM, 45W).
  - *Scripts disponibles* :
    - `simple_scraper.py` ($3.00) : Auto-scraping +5 chars/s.
    - `cron_auto_broker.py` ($5.00) : Vente automatique continue dès 50 chars accumulés dans le buffer.
    - `clean_html_regex.py` ($7.00) : +10 chars/s et +15 chars/lecture manuelle.
    - `ram_upgrade_512mb.sh` ($10.00) : Étend le buffer à 1 500 chars.
    - `multi_curl_daemon.py` ($15.00) : +20 chars/s.
  - *Objectif* : Atteindre $25.00 pour passer à une station de travail avec processeur multi-cœurs.

- **Phase 2 : Station de Travail & Pipeline Tokenizer (2-3 min)**
  - *UI visible* : Déblocage du réservoir de Tokens ($T$), du convertisseur BPE, et de l'Oscilloscope temps réel.
  - *Matériel* : *Station Tour Multi-Cœur* ($25.00, 0.05 TFLOPS, 4GB VRAM, 65W) activant la tokenisation continue (4 chars $\to$ 1 Token).
  - *Inférence initiale* : Vente automatique de tokens servis à $0.05 / token.

- **Phase 3 : Émergence du Modèle & Datacenter (3+ min)**
  - Dès 25 tokens servis $\to$ Déblocage de l'Entraînement Neuronal, du panneau *Tri-Allocation* et de la *Télémétrie Modèle* (Paramètres & Multiplicateur de qualité).
  - Dès 500 paramètres $\to$ Déblocage de la R&D / Recherche et des GPU / Lames serveurs de datacenter.

### 2. Architecture des Composants Frontend

- `HumanReaderPanel.vue` : Panneau interactif et immersif présentant des flux de texte réels annotés/transcrits, avec animation de saisie et indicateurs de compétences.
- `IngestionPanel.vue` : S'adapte dynamiquement selon la phase : mode Scribe simple $\to$ mode Scripting $\to$ pipeline complet Ingestion + Tokenizer.
- `AppHeader.vue` : Adaptatif, ne révèle les jauges de Funds, Compute et Puissance que lorsqu'elles sont débloquées dans le domaine.
- `App.vue` : Agencement en grille fluide avec transitions Vue dynamiques (`<Transition>`) pour faire émerger chaque panneau sans saut d'interface.

---

## Conséquences & Avantages

### Positives
- **Expérience utilisateur immersive** : Début narratif fort où le joueur comprend physiquement l'origine des données d'entraînement des LLM.
- **Courbe d'apprentissage intuitive** : Aucune surcharge cognitive au démarrage, chaque mécanisme est introduit au moment opportun.
- **Rythme calibré** : Passage fluide de l'action manuelle à l'automatisation par scripts puis à l'industrialisation IA en 2 à 3 minutes.
- **Rétrocompatibilité totale** : La structure du `GameState` et la sérialisation `localStorage` restent cohérentes et extensibles pour les sprints suivants.

### Négatives / Points d'attention
- Veiller à ce que la boucle de vente automatique `cron_auto_broker` s'exécute proprement dans `processTick` sans spammer le journal STDOUT.
