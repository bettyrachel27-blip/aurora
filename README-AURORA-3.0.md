# Aurora 3.0 — Aurora Cloud

## Déploiement

- Les fichiers de ce ZIP restent le **frontend** Aurora. Déploie-les sur GitHub, puis laisse Render redéployer le site si Render est connecté à ce dépôt.
- Google Apps Script reste uniquement la **partie synchronisation / base de données**. Ne remplace pas l’hébergement du site par Apps Script.

## Première connexion

1. Dans Apps Script, ouvre **Déployer > Gérer les déploiements** et copie l’URL stable qui commence par `https://script.google.com/macros/s/` et se termine par `/exec`.
2. Ouvre Aurora > menu > **Aurora Cloud**.
3. Colle l’URL `/exec` et le même `SECRET_TOKEN` que dans `Code.gs`.
4. Active la synchronisation et teste la connexion.
5. Sur l’appareil contenant tes données actuelles, clique **Envoyer cet appareil**.
6. Sur l’autre appareil, clique **Récupérer le cloud**.

La synchronisation utilise une copie locale hors connexion et une stratégie « version la plus récente ».
