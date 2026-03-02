Run the PH-Pulse pre-deployment checklist:

1. Verify `.gitignore` contains: credentials.json, .env.local, .env, __pycache__, node_modules, .next
2. Search the entire repo for any hardcoded API keys, credentials, or secrets (grep for patterns like API_KEY=, password, credentials, service-account)
3. Run `cd transforms && dbt test` and confirm zero failures
4. Run `cd dashboard && npx tsc --noEmit` and confirm zero TypeScript errors
5. Run `cd dashboard && npm run build` and confirm the build succeeds
6. Check that README.md exists and has: project overview, live demo link, architecture diagram reference, key findings section (not placeholder text)
7. Confirm `.env.local` is NOT tracked by git: `git ls-files .env.local`

Report each check as ✅ PASS or ❌ FAIL with details. Summarize at the end with a go/no-go recommendation.
