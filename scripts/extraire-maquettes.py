#!/usr/bin/env python3
"""Extrait chaque planche de la maquette empaquetée en un fichier HTML lisible.

La maquette exportée (docs/context/maquettes/maquettes-source.html) est un paquet
compressé à plusieurs niveaux : son texte et ses styles ne sont pas lisibles tels
quels. Ce script écrit une planche par fichier, nommée d'après son titre et sa
largeur (1440 = ordinateur, 390 = mobile), dans docs/context/maquettes/planches/.

Usage : python3 -I scripts/extraire-maquettes.py [source] [dossier_sortie]
À relancer après chaque nouvelle version de la maquette source.
"""
import base64
import gzip
import json
import re
import sys
import unicodedata
from pathlib import Path

RACINE = Path(__file__).resolve().parent.parent
SOURCE = RACINE / "docs/context/maquettes/maquettes-source.html"
SORTIE = RACINE / "docs/context/maquettes/planches"


def bloc(html, type_):
    m = re.search(rf'<script type="__bundler/{type_}">([\s\S]*?)</script>', html)
    return json.loads(m.group(1)) if m else None


def documents(html):
    """Renvoie {uuid: html décompressé} pour les ressources HTML d'un paquet."""
    res = {}
    for uuid, ressource in (bloc(html, "manifest") or {}).items():
        if ressource["mime"] != "text/html":
            continue
        data = base64.b64decode(ressource["data"])
        if ressource.get("compressed"):
            data = gzip.decompress(data)
        res[uuid] = data.decode("utf-8")
    return res


def page(html):
    """Déroule les paquets imbriqués jusqu'à la page réelle."""
    while True:
        gabarit = bloc(html, "template")
        if gabarit is None:
            return html
        html = gabarit


def slug(texte):
    texte = unicodedata.normalize("NFKD", texte).encode("ascii", "ignore").decode()
    return re.sub(r"[^a-z0-9]+", "-", texte.lower()).strip("-")


def main():
    source = Path(sys.argv[1]) if len(sys.argv) > 1 else SOURCE
    sortie = Path(sys.argv[2]) if len(sys.argv) > 2 else SORTIE
    html = source.read_text(encoding="utf-8")
    planches = re.findall(
        r'<h2>([^<]*)</h2><iframe src="about:blank#([0-9a-f-]{36})"[^>]*width="(\d+)"',
        bloc(html, "template"),
    )
    docs = documents(html)
    sortie.mkdir(parents=True, exist_ok=True)
    for titre, uuid, largeur in planches:
        nom = f"{largeur}-{slug(titre)}.html"
        (sortie / nom).write_text(page(docs[uuid]), encoding="utf-8")
        print(f"{nom}  ({titre})")


if __name__ == "__main__":
    main()
