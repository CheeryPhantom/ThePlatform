# Contributing

Thanks for your interest in contributing to ThePlatform! This document explains the basic workflow and expectations.

1. Fork the repository (if you do not have direct write access) or create a branch from `main`.

2. Branching
- Use descriptive feature branches: `feature/<short-description>` or `fix/<short-description>`.

3. Work and commit
- Keep commits small and focused.
- Use clear commit messages. e.g. `feat: add users controller`, `fix: db connection bug`.

4. Open a Pull Request
- Target the `main` branch.
- Include a clear description of what the change does and why.
- Reference any related issues (e.g., `Closes #123`).

5. Code review
- Address any reviewer feedback promptly.
- Keep discussions on the PR; if it becomes large, consider splitting changes.

6. Tests & Quality
- Add tests where appropriate. We currently do not enforce a test runner, but please include tests for non-trivial logic.

7. Style
- Follow existing project patterns. Keep code simple and readable.

8. Environment
- Do NOT commit secrets. Use `backend/.env.example` as a template for local configuration.

9. CI
- Pull requests will run CI checks. Fix any failing checks before merging.

10. Questions
- If you're unsure how to approach a change, open an issue first to discuss.

Thank you for contributing!
