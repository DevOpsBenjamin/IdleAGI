# ADR 0011: Moteur Thermodynamique, Dissipation Active et Throttling Dynamique

## Statut
Accepté

## Contexte
Avec l'introduction du catalogue matériel réaliste (CPU hôtes et accélérateurs GPU jusqu'aux puces Tensor H100 de 700W), la consommation électrique du cluster augmente rapidement. Sans contrainte physique, le joueur pourrait accumuler des accélérateurs sans contrepartie d'ingénierie thermique.

Le Sprint 2 introduit le système thermodynamique complet imposant au joueur de dimensionner sa capacité de refroidissement pour éviter la surchauffe et la dégradation de son compute effectif.

## Décisions

1. **Formulation Thermodynamique Canonique** :
   - Énergie thermique dégagée : $Q_{\text{heat}} = P_{\text{totalDraw}} \times 0.90$ (90% de l'énergie électrique consommée par les composants actifs est convertie en chaleur).
   - Capacité de refroidissement totale : $W_{\text{cooling}} = W_{\text{baseHost}} + \sum W_{\text{coolingModules}}$.
   - Efficacité thermique ($0.10 \le \eta \le 1.0$) :
     $$\eta = \min\left(1.0, \frac{W_{\text{cooling}}}{Q_{\text{heat}}}\right) \quad (\text{si } Q_{\text{heat}} > 0)$$
   - Throttling dynamique :
     $$\text{isThrottling} = \eta < 1.0$$
     $$\text{EffectiveCompute} = \text{RawCompute} \times \eta \times \text{PowerGridMultiplier}$$

2. **Simulation de la Température Opérationnelle (°C)** :
   - Température ambiante de référence : $T_{\text{ambient}} = 22^\circ\text{C}$.
   - Régime nominal ($Q_{\text{heat}} \le W_{\text{cooling}}$) :
     $$T = 22 + 10 + 45 \times \left(\frac{Q_{\text{heat}}}{W_{\text{cooling}}}\right) \implies [32^\circ\text{C} - 77^\circ\text{C}]$$
   - Régime de surchauffe / Throttling ($Q_{\text{heat}} > W_{\text{cooling}}$) :
     $$T = 77 + 28 \times (1 - \eta) \implies [78^\circ\text{C} - 105^\circ\text{C}]$$
   - Statuts thermiques qualifiés :
     - `nominal` ($T < 70^\circ\text{C}$) : Fonctionnement optimal.
     - `warm` ($70^\circ\text{C} \le T < 80^\circ\text{C}$) : Charge élevée sans perte de calcul.
     - `throttling` ($T \ge 80^\circ\text{C}$) : Pénalité d'efficacité active, ventilateurs en surcharge.

3. **Catalogue de Refroidissement Modulaire** :
   - `cooling_case_fans_120mm` : Ventilateurs Boîtier 120mm (+70W Cooling, $18.00).
   - `cooling_tower_heatsink` : Ventirad Cuivre Double Tour (+180W Cooling, $55.00).
   - `cooling_aio_watercooling_360` : Watercooling AIO 360mm (+450W Cooling, $160.00).
   - `cooling_custom_loop_d5` : Boucle Custom Watercooling D5 (+1 200W Cooling, $500.00).
   - `cooling_inrow_datacenter_ac` : Climatisation In-Row Baie Serveur (+4 000W Cooling, $2 500.00).
   - `cooling_immersion_cryo` : Immersion Diélectrique Cryogénique (+15 000W Cooling, $12 000.00).

4. **Expérience Utilisateur & Intégration UI** :
   - Intégration d'un onglet dédié **Refroidissement** dans le composant `HardwareCluster.vue`.
   - Affichage en temps réel de la jauge thermique, de la température en °C et des alertes de surchauffe.
   - Alertes STDOUT contextuelles lors du premier déclenchement du throttling.

## Conséquences
- Les calculateurs `ComputeEngine` encapsulent l'intégralité des calculs thermiques de manière pure et déterministe.
- L'expansion du matériel requiert une planification équilibrée entre puissance de calcul, alimentation et dissipation thermique.
- La compatibilité des sauvegardes antérieures est préservée grâce aux valeurs par défaut de sérialisation.
