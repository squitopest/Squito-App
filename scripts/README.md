## Script Notes

`generate-apple-secret.js` expects your Apple private key to stay local and untracked.

Supported setup:

- Put the key at `scripts/AuthKey.p8`
- Or set `APPLE_AUTH_KEY_PATH=/absolute/path/to/AuthKey.p8`

Optional output override:

- `APPLE_CLIENT_SECRET_OUTPUT=/absolute/path/apple-jwt.txt`

Important:

- Do not commit `AuthKey.p8`
- Do not commit generated Apple JWT files
