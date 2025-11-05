# E2E Tests Setup

This directory contains setup and teardown scripts for Playwright E2E tests.

## Global Teardown

The `global-teardown.ts` script automatically cleans up the Supabase database after all E2E tests complete. This ensures that test data doesn't accumulate and that each test run starts with a clean state.

**✨ New Approach**: Instead of using a Service Role Key, the teardown **logs in as the E2E test user** and deletes only their data. This is **safer** and **respects Row Level Security**!

### What Gets Cleaned Up

The teardown script:

1. **Logs in** as the E2E test user (using `E2E_USERNAME` and `E2E_PASSWORD`)
2. **Deletes data** belonging to this user from:
   - `flashcards` - Flashcard records created by the E2E user
   - `generation_error_logs` - Error logs created by the E2E user
   - `generations` - Generation records created by the E2E user
3. **Row Level Security** automatically ensures only the E2E user's data is deleted

### Setup Instructions

#### 1. Create Test Environment File

Create a `.env.test` file in the project root (based on `.env.test.example`):

```bash
cp .env.test.example .env.test
```

#### 2. Configure Test Environment Variables

Edit `.env.test` and add your Supabase test project credentials:

```env
# Supabase Test Project URL
SUPABASE_URL=https://your-test-project.supabase.co

# Supabase Test Project Anon Key
SUPABASE_KEY=your_test_anon_key

# E2E Test User Credentials (REQUIRED!)
E2E_USERNAME=test-e2e@example.com
E2E_PASSWORD=your_test_user_password

# E2E Test User ID (optional - for verification)
E2E_USERNAME_ID=your_test_user_id
```

**⚠️ Important**:

- Use a **separate Supabase project** for testing (not your production project!)
- Create a **dedicated test user** specifically for E2E tests
- `E2E_USERNAME` and `E2E_PASSWORD` are required for database cleanup
- This approach **respects Row Level Security** - only the test user's data is deleted
- Never commit `.env.test` to version control (it's already in `.gitignore`)
- **No Service Role Key needed!** This is safer and simpler

#### 3. Create a Test User

1. Go to your Supabase test project dashboard
2. Navigate to **Authentication** → **Users**
3. Click **Add user** (or register through your app)
4. Create a user with email and password specifically for E2E tests
5. Note the user ID (you can see it in the dashboard)
6. Add the credentials to your `.env.test` file

### How It Works

1. Playwright loads environment variables from `.env.test` (configured in `playwright.config.ts`)
2. All E2E tests run normally (authenticated as the E2E test user)
3. After all tests complete, the `global-teardown.ts` script runs automatically
4. The script:
   - Logs in as the E2E test user (`E2E_USERNAME`/`E2E_PASSWORD`)
   - Deletes only data belonging to this user from database tables
   - Row Level Security automatically filters queries to this user's data
   - Signs out after cleanup
5. Console output shows the cleanup progress and results

### Running Tests

Simply run your E2E tests as usual:

```bash
# Run all E2E tests
npm run test:e2e

# Or with Playwright CLI
npx playwright test

# The teardown will run automatically after tests complete
```

### Troubleshooting

#### "Missing required environment variables" Error

Make sure you've created `.env.test` and filled in all required variables:

- `SUPABASE_URL`
- `SUPABASE_KEY`
- `E2E_USERNAME`
- `E2E_PASSWORD`

#### "Failed to login as E2E user" Error

Check that:

1. The `E2E_USERNAME` and `E2E_PASSWORD` are correct
2. The user exists in Supabase (Dashboard → Authentication → Users)
3. The user's email is verified
4. Your test Supabase project is accessible

#### Database Cleanup Fails

Check that:

1. Row Level Security policies allow the user to delete their own data
2. The database tables exist in your test project
3. You have network connectivity to Supabase
4. No foreign key constraints are preventing deletion (flashcards should be deleted before generations)

### Customizing Cleanup Behavior

To modify what gets cleaned up, edit `tests/setup/global-teardown.ts`:

```typescript
// Skip cleaning specific tables
// Comment out the table cleanup you don't need

// To clean up additional tables, add similar blocks:
const { error: yourTableError } = await supabase.from("your_table").delete().eq("user_id", authData.user.id);
```

### CI/CD Configuration

For GitHub Actions or other CI/CD pipelines, add the test environment variables as secrets:

```yaml
env:
  SUPABASE_URL: ${{ secrets.TEST_SUPABASE_URL }}
  SUPABASE_KEY: ${{ secrets.TEST_SUPABASE_KEY }}
  E2E_USERNAME: ${{ secrets.TEST_E2E_USERNAME }}
  E2E_PASSWORD: ${{ secrets.TEST_E2E_PASSWORD }}
```

## Best Practices

1. **Use Separate Test Database**: Always use a dedicated Supabase project for testing
2. **Dedicated Test User**: Create a user specifically for E2E tests - don't use real user accounts
3. **Respect RLS**: This approach validates that your Row Level Security policies work correctly
4. **Monitor Test Data**: Regularly check your test database to ensure cleanup is working
5. **Run Tests in Isolation**: Each test should be independent and not rely on data from other tests
6. **Clean State**: The teardown ensures a clean state for the next test run
7. **No Service Role Key**: This approach is safer than using admin keys that bypass security

## Additional Resources

- [Playwright Global Setup and Teardown](https://playwright.dev/docs/test-global-setup-teardown)
- [Supabase Authentication](https://supabase.com/docs/guides/auth)
- [Supabase Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)
- [Supabase JavaScript Client](https://supabase.com/docs/reference/javascript/introduction)
