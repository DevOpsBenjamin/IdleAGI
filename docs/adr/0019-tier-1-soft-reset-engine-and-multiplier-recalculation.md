# ADR 0019: Moteur de Soft Reset Tier 1, Recalcul Déterministe des Multiplicateurs & Persistance Continue

## Statut
Accepté

## Contexte
Après la formalisation des règles mathématiques du Prestige Tier 1 (*Checkpoint / Fine-Tuning*, ADR 0017) et la conception de l'Arbre de Talents d'Architecture (ADR 0018), il est nécessaire d'implémenter l'infrastructure déterministe complète d'exécution du Soft Reset (Ticket #45).

Le moteur de jeu doit assurer :
1. Une transition atomique et sans perte d'état lors du déclenchement du reset par le joueur.
2. La réinitialisation sélective stricte de l'ensemble des devises, équipements matériels et modules logiciels volatils.
3. L'application immédiate, réactive et universelle des multiplicateurs permanents (bonus passif de $+5\%/\text{AP}$ et les 12 talents de spécialisation) à travers tous les sous-systèmes du domaine (`ComputeEngine`, `EconomyEngine`, `TickEngine`, `HardwareStore`, `ResourcesStore`).
4. La persistance continue et la sauvegarde atomique dans `localStorage` post-reset.

## Décisions

1. **Protocole Déterministe du Soft Reset (`GameStateHydrator.performSoftReset`)** :
   - **Éligibilité & Conversion** :
     - Vérification que $\text{parameters} \ge 1\,000\,000$ via `PrestigeEngine.canPrestige`.
     - Calcul des $AP$ à allouer via la formule racine carrée : $AP = \lfloor (\text{parameters} / 10^6)^{0.5} \rfloor$.
     - Crédit des $AP$ disponibles et cumulés dans `usePrestigeStore`, incrémentation du compteur `prestigeCount`, et mise à jour de `maxParametersReached`.
   - **Périmètre de remise à zéro volatile** :
     - `rawText.current = 0`, `tokens.current = 0`, `funds.current = 0`, `parameters = 0`, `researchPoints.current = 0`.
     - `totalTokensServed = 0`, `totalCharsRead = 0` (permettant la ré-exécution de la progression narrative Phase 0).
     - Inventaire matériel réinitialisé au catalogue par défaut (`potato_pc = 0`, slots PCIe libres).
     - Capacités réseau électrique ($100\text{W}$) et refroidissement ($50\text{W}$) réinitialisées aux valeurs de base.
     - Modules logiciels remis à l'état non-acheté.
     - Réinitialisation des allocations à $100\%$ Inférence.
     - Phase active repositionnée à 0 (Scribe Humain).
     - Jalons d'alerte narratifs volatils réinitialisés pour rejouer l'émergence cyber du modèle.
   - **Éléments strictement persistés** :
     - Points d'Architecture disponibles et cumulés à vie.
     - Ensemble des talents débloqués dans l'Arbre d'Architecture.
     - Statistiques globales (record de paramètres, nombre de prestiges).
     - Déblocage permanent du panneau Prestige (`prestigeT1 = true`).
     - STDOUT log de confirmation du checkpoint et sauvegarde immédiate sur le disque local (`localStorage`).

2. **Propagation Universelle des Multiplicateurs Déterministes** :
   - **Multiplicateur Universel Checkpoint** :
     $$\mu_{\text{checkpoint}} = 1.0 + (\text{totalAP} \times 0.05)$$
     Multiplie directement le $\text{EffectiveCompute}$ dans `useGameStore`.
   - **Multiplicateurs d'Ingestion & Données** :
     - `scrapePowerMultiplier` (`opt_bpe_fast_track`, $+50\%$) : Appliqué au scrape manuel et à l'auto-scraping scripté.
     - `tokenGenerationMultiplier` (`opt_syntactic_indexing`, $+100\%$) : Multiplie la capacité de traitement du Tokenizer BPE dans `EconomyEngine.calculateTokenizingCapacity` et `TickEngine`.
     - `rawTextPriceMultiplier` (`opt_market_pricing`, $+50\%$) : Multiplie le prix unitaire de vente des données brutes au courtier.
     - `bufferCapacityMultiplier` (`opt_semantic_compression`, $+100\%$) : Multiplie la capacité maximale des buffers de texte brut (`rawText.max`) et de tokens (`tokens.max`).
   - **Multiplicateurs d'Infrastructure & Électro-Thermique** :
     - `hardwareDiscountMultiplier` (`opt_hardware_rebate`, $-15\%$) : Réduit le prix d'achat de tout le matériel (hôtes et GPU) dans `ComputeEngine.canBuyHardware` et `hardwareStore.getHardwareCost`.
     - `coolingEfficiencyMultiplier` (`opt_cryo_conduction` $+25\%$, `opt_liquid_nitrogen` $+50\%$) : Multiplie la capacité effective de refroidissement dans `ComputeEngine.calculateThermalState`, repoussant le seuil de surchauffe.
     - `gridCapacityMultiplier` (`opt_smart_grid`, $+25\%$) : Multiplie la capacité effective du réseau électrique dans `ComputeEngine.calculatePowerState`, prévenant les disjonctions.
   - **Multiplicateurs de Calcul & Inférence** :
     - `tflopsMultiplier` (`opt_matrix_acceleration` $+20\%$, `opt_flash_attention` $+35\%$, `opt_moe_sparse_gating` $+100\%$) : Multiplie le compute effectif utilisable par tous les canaux.
     - `modelQualityMultiplier` (`opt_speculative_decoding`, $+50\%$) : Multiplie la valeur monétaire des tokens servis aux clients API.

3. **Extension du Moteur de Simulation Fast-Forward (`ScenarioRunner`)** :
   - Ajout des actions de simulation `trigger_prestige` et `buy_talent` pour permettre la validation unitaire automatisée de runs successifs multi-prestiges sans latence.

## Conséquences
- La boucle de jeu complète (Phase 0 $\to$ Datacenter $\to$ Prestige $\to$ Re-bootstrap accéléré) est désormais entièrement fonctionnelle, testée et déterministe.
- Le joueur bénéficie d'une accélération exponentielle lors des runs successifs : un run qui prenait initialement plusieurs minutes est accompli en quelques secondes grâce aux synergies de talents.
- Toutes les opérations respectent l'architecture en couches TypeScript strictes et les conventions de modularité Pinia.
