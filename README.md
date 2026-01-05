# ByTheWey

## Next Train (Supabase Edge Function)

The “Next Train” page uses a Supabase Edge Function to proxy requests to the Rail Data Marketplace LDBWS API. Keep the API key server-side and never expose it in client code.

### Local setup

```bash
supabase start
supabase functions serve next-train
```

Set the Rail Data Marketplace API key as a function secret:

```bash
supabase secrets set RAILDATA_X_APIKEY="your-key-here"
```

You can also set the secret in the Supabase Dashboard under **Project Settings → Edge Functions → Secrets**.

### Build

```bash
npm run build
```
