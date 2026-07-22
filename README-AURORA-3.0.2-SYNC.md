# Aurora 3.0.2 — Synchronisation sécurisée

Cette version conserve les routines intelligentes et ajoute une fusion multiappareil.

- Les listes sont fusionnées élément par élément grâce à leur identifiant et leur date de modification.
- Les suppressions sont mémorisées avec des marqueurs de suppression afin d’éviter la réapparition d’anciens éléments.
- Avant chaque envoi, Aurora récupère et fusionne la copie cloud.
- Une ouverture sur ordinateur ne doit plus écraser les ajouts faits sur téléphone.
- Les rendez-vous restent triés par date puis heure.

Déploiement : remplacer les fichiers GitHub/Render. Aucun changement du script Google Apps Script n’est nécessaire.
