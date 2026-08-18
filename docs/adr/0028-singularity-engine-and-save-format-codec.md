# ADR 0028: Moteur de Singularité Tier 3, Boucle Temporelle (New Game+) & Codec de Sauvegarde Base64

## Statut
Accepté

## Contexte
À la suite de la modélisation mathématique du prestige Tier 3 (ADR 0026) et de la conception des interfaces graphiques d'ascension et de gestion des sauvegardes (ADR 0027), l'implémentation du moteur de domaine pur `SingularityEngine` et `SaveFormatCodec`, de l'intégration au store Pinia `singularityStore` et de la réinitialisation atomique New Game+ dans `GameStateHydrator` doit être finalisée et validée par des tests unitaires et d'intégration de bout en bout.

## Décisions

1. **Moteur de Domaine Pur `SingularityEngine` (`src/domain/engine/SingularityEngine.ts`)** :
   - Encapsule les règles pures sans dépendance à Vue/Pinia :
     - `canInitiateSingularity(parameters, activeParadigm)` : vérifie $\ge 1\text{T}$ paramètres ($10^{12}$) et le paradigme actif `quantum_annealed`.
     - `evaluateQualifiedEnding(entropy, alignment, activeParadigm, discoveredEndings, forceCyclicChoice)` : sélectionne l'épilogue narratif canonique (`digital_confinement` si $E \ge 70\%$, `benevolent_symbiosis` si $A \ge 80\%$, `temporal_paradox` si $\ge 2$ fins découvertes ou choix cyclique, `cosmic_transcendence` en régime quantique équilibré).
     - `calculateGlobalMultiplier(chronoCores)` : calcule $\mu_{\text{singularity}} = 1.0 + 1.0 \times \text{ChronoCores}$ (+100% de vitesse par Chrono-Core $\Omega$).
     - Méthodes utilitaires de catalogue et d'interrogation de la galerie (`getAllEndings`, `getEndingDefinition`, `isEndingDiscovered`, `getDiscoveredCount`, `hasDiscoveredAllEndings`).

2. **Moteur de Sérialisation et Vérification d'Intégrité `SaveFormatCodec` (`src/domain/engine/SaveFormatCodec.ts`)** :
   - Encodage Base64 UTF-8 compatible Node.js et navigateurs web sans dépendance externe.
   - Hash polynomial FNV-1a 32-bit formaté sur 8 caractères hexadécimaux pour la détection déterministe d'altérations.
   - Format standardisé : `IDLEAGI_SAVE_V1:<base64_payload>:<hex_checksum>`.
   - Méthodes d'importation/exportation résilientes intégrées dans `gameStore` (`exportSaveString`, `importSaveString`).

3. **Réinitialisation Atomique New Game+ (`GameStateHydrator.performSingularityAscension`)** :
   - Clôture du run en enregistrant l'épilogue découvert, incrémentant le compteur de Singularités et attribuant $+1$ Chrono-Core ($\Omega$).
   - Réinitialisation propre des devises volatiles (Raw Text, Tokens, Funds, Paramètres à 0), du hardware (retour à la station de départ) et des modules logiciels.
   - Conservation des acquis permanents ($AP$, arbre de talents, $\Phi$, catalogue des paradigmes, fins découvertes, Chrono-Cores).

4. **Scénarios & Tests Fonctionnels (`ScenarioRunner`)** :
   - Extension de `ScenarioRunner` pour supporter les actions Tier 2 (`trigger_tier2_prestige`, `select_paradigm`, `unlock_paradigm`, `toggle_synthetic`) et Tier 3 (`trigger_singularity`).
   - Couverture complète dans `singularityEngine.spec.ts` et `singularityAscensionScenario.spec.ts` (19 fichiers de test, 167 tests unitaires et de scénarios validés).

## Conséquences
- Boucle complète de gameplay incrémental depuis le scribe Phase 0 jusqu'à l'ascension ASI Tier 3 et la boucle infinie New Game+.
- Sauvegardes portables, intègres et vérifiées avec import/export en 1 clic.
- Codebase conforme aux standards TypeScript stricts et de séparation des couches de domaine pur.
