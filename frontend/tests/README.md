Playwright E2E tests

- Run tests from the `frontend` folder.

Commands:

```bash
cd frontend
npx playwright test
```

Notes:
- Tests mock many backend endpoints to allow running without a fully available backend.
- Ensure `playwright.config.ts` `use.baseURL` is set to your local dev server (e.g. http://localhost:3000) or pass `--base-url` to `npx playwright test`.
- Extend mocks in `frontend/tests/helpers/mockResponses.ts` as needed.
