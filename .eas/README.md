# EAS Submit credentials

Place your Google Play service account JSON key here as `google-service-account.json`.

Security notes:

- Do NOT commit the JSON key to git.
- Make sure `.gitignore` ignores `.eas/*.json`.
- Limit the service account permissions to the minimum needed (Release Manager is recommended).

How to create the key (summary):

1. In Google Play Console: Setup → API access → Link your Google Cloud project (if not linked).
2. Click "Create new service account" → opens Google Cloud IAM.
3. In Google Cloud IAM → Create service account (name e.g. `eas-submit`) → finish without roles.
4. Back in Play Console → API access → Grant access to the new service account → App permissions: select your app → Role: Release manager (or appropriate).
5. In Google Cloud IAM → Service Accounts → your service account → Keys → Add key → Create new key → JSON.
6. Save the downloaded JSON as `.eas/google-service-account.json`.

Submit to Internal track:

```bash
npm run eas:submit:android
```
