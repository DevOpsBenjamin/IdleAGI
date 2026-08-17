# ADR 0012: Gestion du Réseau Électrique, Surcharges & Améliorations d'Infrastructure

## Statut
Accepté

## Contexte
Avec l'expansion du parc matériel (CPU hôtes et accélérateurs graphiques GPU tirant jusqu'à 700W par unité), la puissance électrique totale appelée ($P_{\text{totalDraw}}$) peut rapidement excéder la capacité du circuit électrique initial.

Sans modélisation physique du réseau électrique, le joueur pourrait empiler des GPU sans dimensionner son alimentation ou son raccordement réseau.

Le ticket #14 introduit la modélisation complète du réseau électrique (**Power Grid Capacity**), les statuts opérationnels (`nominal`, `strained`, `overloaded`), la pénalité de surcharge (-50% du Compute effectif) et le catalogue des améliorations électriques (blocs d'alimentation modulaires, lignes dédiées et raccordements haute tension).

## Décisions

1. **Modélisation de la Charge et des Régimes Électriques** :
   - Capacité du réseau électrique : $W_{\text{gridCapacity}}$ (évolutive via les stations hôtes et les améliorations d'infrastructure).
   - Taux de charge électrique :
     $$P_{\text{load}} = \frac{P_{\text{totalDraw}}}{W_{\text{gridCapacity}}} \times 100\%$$
   - Statuts opérationnels qualifiés :
     - `nominal` ($P_{\text{load}} \le 80\%$) : Réseau stable, aucun stress sur les composants.
     - `strained` ($80\% < P_{\text{load}} \le 100\%$) : Réseau sous tension critique, transformateurs en charge maximale, invite à améliorer le réseau avant nouvel achat.
     - `overloaded` ($P_{\text{load}} > 100\%$) : Disjoncteur différentiel déclenché / sous-tension sévère.

2. **Pénalité de Surcharge Disjoncteur** :
   - Multiplicateur électrique :
     $$\mu_{\text{power}} = \begin{cases} 1.0 & \text{si } P_{\text{totalDraw}} \le W_{\text{gridCapacity}} \\ 0.50 & \text{si } P_{\text{totalDraw}} > W_{\text{gridCapacity}} \end{cases}$$
   - Puissance de calcul effective globale :
     $$\text{EffectiveCompute} = \text{RawCompute} \times \eta_{\text{thermal}} \times \mu_{\text{power}}$$
   - Déclenchement d'un message d'alerte STDOUT lors de la première disjonction.

3. **Catalogue d'Améliorations de l'Infrastructure Électrique** :
   - `power_psu_500w` : Bloc d’Alimentation 500W Bronze Modulaire (+400W de capacité, $25.00, Phase 1 / scriptsSection).
   - `power_psu_850w_gold` : Bloc d’Alimentation 850W Gold Multi-Rail (+750W de capacité, $75.00, Phase 2 / tokenizerUnlocked).
   - `power_dedicated_circuit_16a` : Ligne Dédiée Disjoncteur 16A Tableau (+2 500W de capacité, $280.00, Phase 2 / tokenizerUnlocked).
   - `power_triphase_industrial` : Branchement Triphasé Industriel 400V 32A (+8 000W de capacité, $1 200.00, Phase 3 / trainingAllocation).
   - `power_substation_transformer` : Poste Haute Tension & Transformateur Dédié 50 kVA (+35 000W de capacité, $8 500.00, Phase 3 / trainingAllocation).

4. **Expérience Utilisateur & Intégration UI** :
   - Intégration d'un onglet dédié **Énergie** dans le composant `HardwareCluster.vue` avec badge animé d'alerte en cas de surcharge.
   - Bilan électrique détaillé (Puissance appelée, Capacité réseau, Charge en %, Multiplicateur effectif).
   - Indicateur réactif dans le header principal `AppHeader.vue` (badge rouge `-50% Surcharge` et charge en %).

## Conséquences
- Les calculateurs `ComputeEngine.calculatePowerState` et `ComputeEngine.calculateEffectiveCompute` garantissent une logique pure et découplée de la vue.
- L'acquisition de GPU et de CPU de forte puissance nécessite un équilibrage tripartite : Trésorerie, Dissipation thermique et Capacité électrique.
- Rétro-compatibilité complète avec les sauvegardes antérieures grâce aux valeurs par défaut de sérialisation.
