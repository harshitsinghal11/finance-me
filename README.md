# Finance Me

## Overview
Finance Me is a Next.js and Supabase application for managing members, loan schedules, installment collections, and repayment visibility for a small finance operation.

## Key Features
- Google OAuth login with first-time profile setup
- Member create, edit, view, and soft delete flows
- Installment schedule generation for daily, weekly, and monthly repayment models
- Installment payment updates with penalty and status handling
- Dashboard metrics for active members, outstanding balance, daily collections, and monthly net profit
- Family member management and document image uploads

## Tech Stack
- Next.js 16
- React 19
- TypeScript
- Tailwind CSS v4
- Supabase
- React Hook Form and Zod
- Framer Motion

## Documentation Links
- [01_PRD.md](docs/01_PRD.md)
- [02_TRD.md](docs/02_TRD.md)
- [03_AppFlow.md](docs/03_AppFlow.md)
- [04_UI_UX.md](docs/04_UI_UX.md)
- [05_Data Architecture.md](<docs/05_Data Architecture.md>)
- [06_FolderStructure.md](docs/06_FolderStructure.md)

## Getting Started
### Prerequisites
- Node.js
- npm
- A Supabase project
- Google OAuth configured in Supabase Auth

### Installation
```bash
npm install
```

### Environment Variables
The codebase reads:

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_ANON_KEY=
```

### Running Locally
```bash
npm run dev
```

## 🤝 Contributing

Contributions are always welcome!

If you'd like to improve this project, please read our
[Contributing Guide](./CONTRIBUTING.md) before submitting a Pull Request.

## License

This project is open source and available under the [MIT License](./LICENSE).

---

## Contact Owner
Built by **Harshit Singhal** | BTech CSE | Manav Rachna University

- [Portfolio](https://harshit-singhal.vercel.app)
- [LinkedIn](https://linkedin.com/in/harshitsinghal11)

> _Feel free to reach out if you're building something similar or have questions about the implementation._
