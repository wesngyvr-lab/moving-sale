# Moving Sale Next.js App

This project was bootstrapped manually to match the default [Next.js](https://nextjs.org/) App Router setup with TypeScript and Tailwind CSS. It also includes the Supabase JavaScript client so you can start wiring up data persistence.

## Getting Started

First, install dependencies:

```bash
npm install
```

Then run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the home page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

## Tailwind CSS

Global Tailwind directives live in `app/globals.css`. The Tailwind configuration is in `tailwind.config.ts`.

## Supabase

The Supabase client dependency (`@supabase/supabase-js`) is installed and ready for use. Add your environment variables for `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` when you start integrating with Supabase.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_source=create-next-app&utm_medium=default-template&utm_campaign=create-next-app).
