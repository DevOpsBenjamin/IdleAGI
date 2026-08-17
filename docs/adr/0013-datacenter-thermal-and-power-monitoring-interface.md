# ADR 0013: Interface Datacenter & Télémétrie Thermique/Électrique

## Statut
Accepté

## Contexte
Le moteur thermodynamique (ADR 0011) et la gestion du réseau électrique (ADR 0012) simulent avec précision la dissipation thermique active ($W_{\text{cooling}}$), la chaleur par effet Joule ($Q_{\text{heat}} = P_{\text{draw}} \times 0.90$), la température dynamique en °C ($32^\circ\text{C}$ à $105^\circ\text{C}$), le throttling dynamique et les surcharges de grille électrique.

Afin de rendre ces contraintes physiques palpables, immersives et immédiatement lisibles par le joueur sans surcharger la navigation dans les sous-onglets, il est nécessaire de concevoir une interface de télémétrie matérielle dédiée (« Datacenter HUD & Rack Visualizer »).

## Décision

1. **Création du composant dédié `DatacenterTelemetry.vue`** :
   - Panneau de monitoring cyber-terminal affiché au sein de la vue matérielle lorsque du hardware est actif (Phase $\ge 1$).
   - Visualisation d'une baie de serveurs (Virtual Rack Slots) modélisant l'hôte actif et les accélérateurs GPU avec leur consommation et empreinte thermique respective.

2. **Thermomètre Matriciel LED & Jauges Segmentées** :
   - Thermomètre matriciel gradué par paliers de 5°C ($30^\circ\text{C}$ à $105^\circ\text{C}$), avec transition chromatique dynamique :
     - $\le 69^\circ\text{C}$ : Vert matrice (`nominal`).
     - $70-79^\circ\text{C}$ : Ambre vibrant (`warm`).
     - $\ge 80^\circ\text{C}$ : Rouge néon pulsant avec alarme de throttling (`throttling`).
   - Jauge de puissance segmentée avec indicateur d'état du disjoncteur différentiel (`NOMINAL`, `STRAINED`, `TRIPPED`).

3. **Bannières d'Alarmes Cyber & Feedback STDOUT** :
   - Bannières d'urgence visuelles avec scanlines et pulsation d'alerte en cas de Throttling ($\ge 80^\circ\text{C}$) ou de Disjonction ($> 100\%$ charge).
   - Intégration d'indicateurs de ventilation/dissipation active (icônes et vitesse d'animation des turbines en fonction de la charge).

## Conséquences

- **Positives** :
  - Immersion cyber-terminale maximale et clarté immédiate des goulots d'étranglement de calcul.
  - Compréhension instantanée des pénalités d'efficacité ($\eta$) et de disjonction ($\mu_{\text{power}} = 0.50$).
  - Respect des principes de divulgation progressive (l'interface apparaît dès l'acquisition du premier PC).
- **Architecture** :
  - Composant de présentation Vue 3 pur, fortement typé avec `defineProps` et sans logique d'état complexe propre.
  - Dépendances pures sur les types de domaine (`ThermalState`, `PowerState`, `HardwareNode`, `PcieSlotsState`).
