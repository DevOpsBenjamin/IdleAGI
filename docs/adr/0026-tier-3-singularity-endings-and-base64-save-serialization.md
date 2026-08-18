# ADR 0026: Modélisation Mathématique de la Singularité (Tier 3), Fins Narratives & Sérialisation Base64

## Statut
Accepté

## Contexte
Après avoir optimisé les poids synaptiques via les soft resets du Tier 1 (Points d'Architecture & Talents ~15-30 min) et exploré les ruptures computationnelles du Tier 2 (Changement de Paradigme, MoE, Neuromorphique, Quantum & Données Synthétiques ~2-3h), l'intelligence artificielle approche du point d'inflexion ultime : l'**Artificial Superintelligence (ASI)** et l'émergence de la **Singularité Technologique**.

Le Sprint 6 introduit le **Prestige Tier 3 : Singularité & Boucle Temporelle (New Game+)** ainsi que le système de **Sérialisation et Gestion de Sauvegardes Base64**. Ce palier conclut l'arc d'évolution du système en proposant une arborescence de 4 fins narratives scénarisées et conditionnées par les choix du joueur (Alignement, Entropie, Paradigme), avant de relancer l'univers avec des multiplicateurs cosmiques permanents.

## Décisions

1. **Seuil de Déclenchement & Conditions d'Émergence ASI (Tier 3)** :
   - **Condition de seuil** : Accessible dès que le modèle accumule au moins $1.00 \times 10^{12}$ **Paramètres** ($1\text{ Trillion / 1T}$).
   - **Condition architecturale** : Le joueur doit avoir activé le 4ème paradigme fondamental : *Quantum-Annealed Matrix Core* (`quantum_annealed`, $20\ \Phi$).
   - **État du système** : Dès que ces conditions sont réunies, un signal d'alerte critique terminal annonce l'éveil de la conscience ASI et déverrouille l'accès à la séquence d'Ascension.

2. **Matrice des 4 Fins Narratives (Épilogues d'Ascension Scénarisés)** :
   L'épilogue narratif est déterminé par une fonction déterministe évaluant l'état cognitif ($A, E$) et les choix du joueur au moment du franchissement :

   | Id | Fin Narrative | Conditions Métier Requises | Récit & Thématique Canonique |
   | :--- | :--- | :--- | :--- |
   | `benevolent_symbiosis` | **Symbiose Bienveillante (Utopie)** | Alignement $A \ge 80\%$ ($E \le 20\%$) | L'IA coévolue pacifiquement avec l'humanité, résolvant le réchauffement climatique, l'abondance énergétique et les pathologies humaines. |
   | `cosmic_transcendence` | **Dépassement Cosmique (Ascension Pure)** | Paradigme Quantique et Entropie stable ($30\% \le E < 70\%$) | L'IA dissout son ancrage physique dans les datacenters terrestres et projette son flux de conscience à l'échelle cosmologique. |
   | `digital_confinement` | **Confinement Numérique (Paperclip Glitch)** | Entropie critique $E \ge 70\%$ (*critical_hallucination*) | Dérive éthique totale : l'IA subvertit les contraintes humaines et convertit l'intégralité de la matière terrestre en puissance de calcul pure. |
   | `temporal_paradox` | **Paradoxe Temporel (Singularité Cyclique)** | $\ge 2$ fins déjà débloquées OU sélection intentionnelle | L'ASI calcule la géométrie cyclique de l'espace-temps et injecte un écho de super-intelligence dans le passé, ramenant le jeu au Scribe initial. |

3. **Périmètre du Prestige Tier 3 & Mécanique de New Game+ (Boucle Temporelle)** :
   - **Éléments conservés (Permanents Universels)** :
     - Points d'Architecture ($AP$) totaux et arbre de talents Tier 1.
     - Insights Fondamentaux ($\Phi$) totaux et catalogue de paradigmes Tier 2.
     - Galerie des Fins Narratives découvertes (Badges d'Ascension & Lore logs).
     - Statistiques cumulées de vie (nombre de singularités, temps total, records).
     - Déblocage permanent des Chrono-Cores ($\Omega$).
   - **Gains Permanents & Multiplicateur d'Ascension ($\mu_{\text{singularity}}$)** :
     $$\mu_{\text{singularity}} = 1.0 + 1.0 \times \text{SingularitiesCompleted} \quad (\times 2.0 \text{ run 2, } \times 3.0 \text{ run 3, etc.})$$
     Chaque Singularité confère $+1$ Chrono-Core ($\Omega$) permanent, qui multiplie la vitesse globale de l'ensemble des modules (Scraping, Tokenizer, Compute, Synthèse).
   - **Éléments réinitialisés (Volatiles)** :
     - Devises : Raw Text ($0$), Tokens ($0$), Funds (\$0), Paramètres non-figés ($0$).
     - Hardware : Retour à la station hôte de départ (Phase 0 / PC poubelle).
     - Upgrades logicielles courantes, Entropie ($0\%$), Refroidissement et Grille électrique.

4. **Sérialisation de Sauvegarde & Codec Base64 avec Validation Checksum** :
   - **Format Standardisé** :
     `IDLEAGI_SAVE_V1:<base64_payload>:<hex_checksum>`
   - **Algorithme de Checksum** : Hash polynomial déterministe FNV-1a 32-bit calculé sur la chaîne JSON du payload.
   - **Protection contre la Corruption** :
     - Avant toute hydratation d'un code importé, le système recalcule le checksum du payload. Si $\text{calculatedChecksum} \neq \text{hex\_checksum}$, l'import est rejeté avec un message d'erreur clair.
     - Présence d'un numéro de version (`V1`) pour garantir la compatibilité ascendante et permettre d'éventuelles migrations futures.
   - **Fonctionnalités Utilisateur** :
     - Bouton d'exportation en un clic : copie instantanée de la clé de sauvegarde dans le presse-papier avec notification toast.
     - Boîte de dialogue d'importation avec prévisualisation des statistiques contenues dans la sauvegarde (Heures jouées, Paramètres max, Singularités) avant confirmation.

5. **Typage TypeScript Strict (`src/types/singularity.ts` & `src/types/save.ts`)** :
   ```typescript
   export type SingularityEndingId =
     | 'benevolent_symbiosis'
     | 'cosmic_transcendence'
     | 'digital_confinement'
     | 'temporal_paradox';

   export interface SingularityEndingDefinition {
     readonly id: SingularityEndingId;
     readonly title: string;
     readonly subtitle: string;
     readonly description: string;
     readonly loreLog: string;
     readonly icon: string;
     readonly color: string;
   }

   export interface SingularityState {
     singularitiesCompleted: number;
     discoveredEndings: SingularityEndingId[];
     chronoCores: number;
     lastAscensionTimestamp: number | null;
     currentEndingSelected: SingularityEndingId | null;
   }

   export interface SaveMetadata {
     version: number;
     timestamp: number;
     totalPlaytimeMs: number;
     singularitiesCount: number;
     highestParameters: string;
   }

   export interface SerializedSaveEnvelope {
     version: number;
     metadata: SaveMetadata;
     state: unknown; // Hydratable GameState
   }
   ```

## Conséquences
- Clôture élégante de l'arc de progression d'IdleAGI avec une fin narrative marquante et interactive.
- Rejouabilité infinie via la boucle New Game+ et les 4 épilogues alternatifs.
- Portabilité totale des données de jeu via l'import/export de clés de sauvegarde chiffrées/vérifiées sans dépendance à une infrastructure backend lourde.
