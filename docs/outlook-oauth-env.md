# Outlook OAuth — variables d’environnement

## `MICROSOFT_TENANT_ID` = `common` (recommandé)

Avec une app Azure enregistrée comme **« Tout locataire Entra ID + compte personnel Microsoft »**, utilise :

```env
MICROSOFT_TENANT_ID=common
```

**Pourquoi pas l’ID de ton tenant (`128c38b5-…`) ?**

- Un tenant fixe ne cible que les comptes **de ce locataire** Entra ID.
- L’endpoint **`common`** permet :
  - Outlook.com, Hotmail, Live (comptes personnels)
  - Microsoft 365 (comptes professionnels / scolaires sur d’autres locataires)

Le code lit `process.env.MICROSOFT_TENANT_ID` dans :

- `src/app/auth/outlook/route.ts`
- `src/app/auth/outlook/callback/route.ts`
- Supabase `sync-outlook` via `_shared/oauth/microsoftRefresh.ts`

Si la variable est absente, le repli est déjà `common`.

## Valeurs complètes (Vercel + Supabase Edge)

| Variable | Valeur |
|----------|--------|
| `MICROSOFT_CLIENT_ID` | Application (client) ID Azure |
| `MICROSOFT_CLIENT_SECRET` | Secret client Azure |
| `MICROSOFT_TENANT_ID` | **`common`** |
| `MICROSOFT_REDIRECT_URI` | `https://paipers.vercel.app/auth/outlook/callback` |

Après modification sur Vercel : **Redeploy** le projet `paipers`.
