# ADR 0025: Moteur de Changement de Paradigme Tier 2, Datasets Synthétiques & Intégration Tick

## Statut
Accepté

## Contexte
Le Sprint 5 introduit le second niveau de prestige (**Tier 2 : Changement de Paradigme**) et la **Génération Continue de Datasets Synthétiques** sujette au risque d'**Effondrement de Modèle** (*Model Collapse*).
Après avoir défini les spécifications mathématiques dans l'ADR 0023 et les composants d'interface dans l'ADR 0024, il convenait d'implémenter l'architecture de domaine pur, le sous-store Pinia dédié, l'intégration dans la boucle de simulation à 20 Hz (`TickEngine`), et les opérations de hard reset atomique dans `GameStateHydrator`.

## Décisions

1. **Moteur de Domaine Pur `ParadigmEngine` (`src/domain/engine/ParadigmEngine.ts`)** :
   - Encapsulation des calculs des **Insights Fondamentaux ($\Phi$)** :
     $$\Phi = \left\lfloor \left( \frac{\text{Parameters}}{10^9} \right)^{0.5} \right\rfloor$$
   - Bonus passif universel : $+10\%$ TFLOPS permanent par $\Phi$ total découvert ($\mu_{\text{paradigm\_passive}} = 1.0 + \Phi_{\text{total}} \times 0.10$).
   - Gestion des règles d'acquisition et d'activation des 4 paradigmes (`dense_transformer`, `mixture_of_experts`, `neuromorphic_spiking`, `quantum_annealed`).
   - Distribution des multiplicateurs d'architecture (calcul brut $\times 1.0 \to \times 10.0$, réduction de consommation électrique $-15\% \to -75\%$, efficacité VRAM $\times 1.0 \to \times 5.0$, bonus de vitesse synthétique $\times 1.0 \to \times 6.0$, et immunité au thermal throttling pour le neuromorphique).

2. **Moteur de Datasets Synthétiques & Model Collapse `SyntheticDataEngine` (`src/domain/engine/SyntheticDataEngine.ts`)** :
   - Auto-génération de données brutes :
     $$\text{SyntheticRate} = \text{EffectiveCompute} \times \mu_{\text{synthetic\_speed}} \quad (\text{chars/s})$$
   - Calcul du ratio d'ingestion synthétique :
     $$R_{\text{synth}} = \min\left(1.0, \frac{\text{syntheticProduced}}{\text{totalCharsIngested}}\right)$$
   - Seuil de Model Collapse : $70\%$ par défaut, étendu à $85\%$ avec le module `safety_rlaif`.
   - Modélisation des pénalités sous Model Collapse :
     - Dérive d'entropie doublée ($\Delta E \times 2.0$, atténuée de $-40\%$ avec RLAIF).
     - Efficacité d'entraînement divisée par deux ($\mu_{\text{training}} \times 0.50$, annulée avec `safety_syntactic_diversity`).
     - Immunité totale avec le module `safety_synthetic_density_filter`.

3. **Sous-Store Pinia `useParadigmStore` (`src/stores/paradigmStore.ts`)** :
   - Gestion réactive des Insights disponibles, des Insights cumulés, du paradigme actif et de la liste des architectures débloquées.
   - Contrôle du flag `isSyntheticActive`, du cumul de données synthétiques produites et du statut live de Model Collapse.
   - Actions atomiques : `claimTier2Prestige`, `unlockParadigm`, `selectParadigm`, `toggleSynthetic`, `updateSyntheticTelemetry`, `resetForSoftReset` et `resetForHardReset`.

4. **Intégration dans la Boucle de Simulation 20 Hz (`TickEngine.ts` & `GameActionHandler.ts`)** :
   - Injection du flux synthétique dans le buffer de texte brut `rawText.current` (plafonné à `rawText.max`).
   - Recalcul continu du ratio $R_{\text{synth}}$ et détection des franchissements de seuil avec logs d'alerte STDOUT qualifiés.
   - Application des multiplicateurs de dérive cognitive (`syntheticDriftMultiplier`) dans `CognitiveEngine` et d'efficacité d'entraînement dans `TickEngine`.

5. **Hard Reset Atomique Tier 2 (`GameStateHydrator.performHardReset`)** :
   - Réinitialisation sélective : devises volatiles ($0$), hardware possédé (retour au PC de départ), upgrades de base ($0$), allocations (100% inférence), jauges physiques (grille, refroidissement, entropie à 0).
   - Conservation intégrale : Points d'Architecture ($AP$) et Arbre de Talents Tier 1, Insights Fondamentaux ($\Phi$), catalogue des paradigmes débloqués, statistiques de progression à vie.
   - Flags d'activation permanents : `prestigeT1: true`, `prestigeT2: true`, `syntheticData: true`.

6. **Sérialisation & Persistance (`src/utils/serialization.ts`)** :
   - Méthodes `serializeParadigmState` et `deserializeParadigmState` garantissant la persistance des Insights, du paradigme sélectionné et de la télémétrie de synthèse avec tolérance aux sauvegardes antérieures.

## Conséquences
- Le cycle de vie complet du prestige Tier 2 est fonctionnel, déterministe, découplé du rendu et couvert par 121 tests unitaires et d'intégration validés.
- L'expérience joueur s'enrichit d'un palier d'automatisation puissant (datasets synthétiques) équilibré par des trade-offs thermodynamiques et cognitifs stratégiques.
