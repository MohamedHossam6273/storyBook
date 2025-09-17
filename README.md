# The Storybook MVP with Supabase

This version of the MVP connects to **Supabase** to load story content.

## Setup

1. Create a Supabase project at [https://supabase.com](https://supabase.com).
2. In Supabase, create a table called `stories` with the following schema:

   ```sql
   create table stories (
     id bigint generated always as identity primary key,
     title text,
     content jsonb
   );
   ```

3. Insert a sample story record. Example:

   ```sql
   insert into stories (title, content) values (
     'Sample Story',
     '{
        "start": "intro",
        "scenes": {
          "intro": {
            "text": "Welcome to the Supabase-powered Storybook!",
            "choices": [
              { "text": "Start learning", "next": "chapter1" }
            ]
          },
          "chapter1": {
            "text": "This is your first chapter, loaded from Supabase.",
            "choices": []
          }
        }
      }'
   );
   ```

4. In `supabase.js`, replace `SUPABASE_URL` and `SUPABASE_ANON_KEY` with your project credentials from the Supabase dashboard.

5. Open `index.html` in a browser and the story will load from Supabase.

## Files
- `index.html` — Main structure
- `style.css` — Styling
- `supabase.js` — Supabase client setup
- `app.js` — Logic for loading story and rendering scenes
- `README.md` — Setup guide
