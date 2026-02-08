
## Mise a jour du README.md -- Cascade AI avec les derniers modeles OpenAI

### Objectif
Mettre a jour toutes les references aux modeles AI dans le README.md pour refleter la nouvelle strategie de cascade :
1. **OpenAI Direct (gpt-5.2-pro)** -- meilleur modele, ChatGPT Pro
2. **Lovable AI Gateway (gpt-5.2)** -- fallback gateway
3. **OpenAI Direct (gpt-4o-mini)** -- fallback economique

### Modifications prevues

**3 sections a mettre a jour dans README.md :**

#### 1. Section "AI Provider Cascade" (lignes 80-89)
Remplacer le bloc de cascade actuel :
```
Ancien:
  Priority 1: Lovable AI Gateway -> openai/gpt-5.2
  Priority 2: OpenAI Direct API  -> gpt-4.1
  Priority 3: OpenAI Direct API  -> gpt-4.1-mini

Nouveau:
  Priority 1: OpenAI Direct API  -> gpt-5.2-pro (best, ChatGPT Pro)
  Priority 2: Lovable AI Gateway -> openai/gpt-5.2 (gateway fallback)
  Priority 3: OpenAI Direct API  -> gpt-4o-mini (cheapest fallback)
```

#### 2. Section "Architecture" -- diagramme ASCII (lignes 200-203)
Mettre a jour les modeles dans le diagramme :
```
Ancien:
  1. Lovable AI (GPT-5.2)
  2. OpenAI API (GPT-4.1)
  3. OpenAI (GPT-4.1-mini)

Nouveau:
  1. OpenAI (GPT-5.2-pro)
  2. Lovable AI (GPT-5.2)
  3. OpenAI (GPT-4o-mini)
```

#### 3. Section "Tech Stack" -- tableau (lignes 223-224)
Mettre a jour les lignes AI :
```
Ancien:
  AI -- Primary:  Lovable AI gateway -> OpenAI GPT-5.2
  AI -- Fallback: OpenAI Direct API -> GPT-4.1 / GPT-4.1-mini

Nouveau:
  AI -- Primary:  OpenAI Direct API -> GPT-5.2-pro (ChatGPT Pro)
  AI -- Fallback: Lovable AI (GPT-5.2) / OpenAI (GPT-4o-mini)
```

### Details techniques
- 3 edits cibles dans le fichier README.md via `lov-line-replace`
- Aucun autre fichier impacte
- Les modifications refletent exactement la cascade implementee dans les Edge Functions `analyze-repo` et `generate-presentation`
