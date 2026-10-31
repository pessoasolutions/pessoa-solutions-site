# PESSOA SOLUTIONS

Site vitrine de PESSOA SOLUTIONS, en ligne sur https://pessoa-solutions.fr

## Contenu

- Pages HTML statiques à la racine : accueil, 5 pages services, pages par commune (`aide-administrative-*.html`), zone d'intervention, guides, tarifs, réalisations, à propos, contact, pages légales, 404
- `site.css`, `site.js` : styles et scripts communs, appelés avec un paramètre `?v=` à incrémenter à chaque modification
- `assets/` : logos, polices, image de partage, icônes, captures
- `robots.txt`, `sitemap.xml`, `llms.txt` : référencement
- fichier-clé IndexNow (32 caractères hexadécimaux + `.txt`) et `googlecb6e2e14f126564d.html` (validation Search Console) : à conserver
- anciennes adresses (`formalites-demarches.html`, `conseil-accompagnement.html`, trois anciens guides) : pages de redirection en noindex, à conserver

## Fonctionnement

Site statique, sans étape de build ni dépendance externe. Hébergé sur GitHub Pages : chaque commit sur `main` le republie. DNS chez IONOS.

## Identité

Blanc pur `#FFFFFF`, bleu marine `#0A1F44`, bleu pétrole `#0B5A75`, doré `#B08D57`.
Mode nuit : fond `#070C15`, surfaces `#0D1725`, accent `#4FA9C6`.
Polices : Amiri pour les titres, Lato pour le texte, reprises du logo. Le logo n'est jamais modifié.
