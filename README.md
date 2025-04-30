# Weekly Schedule Planner

A modern weekly schedule planner built with Next.js, React, Supabase, and shadcn/ui.  
Easily manage your weekly events, recurring tasks, and visualize your agenda in a responsive calendar.

---

## Features

- **Weekly Calendar View:**  
  Visualize your week with a clear, color-coded grid from 9 AM to 10 PM.

- **Add, Edit, and Delete Events:**  
  Create events with title, description, color, start/end time, and date.

- **Recurring Events:**  
  Mark events as weekly recurring.

- **Supabase Integration:**  
  All events are stored in a Supabase Postgres database (cloud or local).

- **LocalStorage Fallback:**  
  If Supabase is not available, events are saved in your browser.

- **Responsive Design:**  
  Works great on desktop and mobile. The calendar adapts to your screen size.

- **Modern UI:**  
  Built with shadcn/ui and Tailwind CSS for a clean, accessible interface.

---

## Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/your-username/weekly-schedule.git
cd weekly-schedule
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

Create a `.env.local` file in the root of the project and add your Supabase credentials:

```env
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
```

> You can get these from your [Supabase project settings](https://app.supabase.com/project/_/settings/api).

If you want to use a local Supabase instance, see [Supabase local development docs](https://supabase.com/docs/guides/cli/local-development).

### 4. Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to see the app.

---

## Usage

- **Add an event:** Click on any hour slot in the calendar.
- **Edit an event:** Click on an existing event.
- **Delete an event:** Edit the event and click "Delete".
- **Recurring event:** Check "Repeat weekly" when creating or editing an event.
- **Navigate weeks:** Use the arrows at the top to move between weeks.

---

## Project Structure

- `src/components/weekly-calendar.tsx` — Main calendar component
- `src/components/event-modal.tsx` — Modal for adding/editing events
- `src/lib/supabase.ts` — Supabase client and helpers
- `src/app/page.tsx` — App entry point

---

## Customization

- **Change calendar hours:**  
  Edit the `HOURS` constant in `src/components/weekly-calendar.tsx`.

- **Change color options:**  
  Edit the `COLOR_OPTIONS` array in the same file.

---

## License

MIT

---

## Credits

- [Next.js](https://nextjs.org/)
- [Supabase](https://supabase.com/)
- [shadcn/ui](https://ui.shadcn.com/)
- [Tailwind CSS](https://tailwindcss.com/)
