# Contributing to AutoSei 🤝

We're excited that you're interested in contributing to AutoSei! This document outlines the guidelines for contributing to our AI-powered DeFi portfolio navigator.

## 🌟 Ways to Contribute

- 🐛 **Bug Reports**: Help us identify and fix issues
- 💡 **Feature Requests**: Suggest new features or improvements
- 🔧 **Code Contributions**: Submit pull requests for bug fixes or new features
- 📚 **Documentation**: Improve our documentation and guides
- 🧪 **Testing**: Help test new features and report feedback
- 🎨 **Design**: Contribute to UI/UX improvements

## 🚀 Getting Started

### Prerequisites

- Node.js 18 or higher
- npm or yarn
- Git
- Basic knowledge of React, TypeScript, and Web3

### Development Setup

1. **Fork the repository**
```bash
git clone https://github.com/your-username/AutoSei.git
cd AutoSei
```

2. **Install dependencies**
```bash
npm install
```

3. **Set up environment**
```bash
cp .env.example .env
# Add your API keys to .env
```

4. **Start development server**
```bash
npm run dev
```

5. **Create a feature branch**
```bash
git checkout -b feature/your-feature-name
```

## 📋 Development Guidelines

### Code Style

- **TypeScript**: All new code should be written in TypeScript
- **ESLint**: Follow the existing ESLint configuration
- **Prettier**: Code will be automatically formatted
- **Naming**: Use descriptive names for variables, functions, and components

### Component Structure

```tsx
// Component file structure
import React from 'react';
import { ComponentProps } from './types';

interface Props extends ComponentProps {
  // Component-specific props
}

const ComponentName: React.FC<Props> = ({ ...props }) => {
  // Component logic
  
  return (
    // JSX
  );
};

export default ComponentName;
```

### Commit Messages

Use conventional commits format:

```
type(scope): description

Examples:
feat(portfolio): add auto-rebalancing feature
fix(ai-chat): resolve message history bug
docs(readme): update installation instructions
style(theme): improve dark mode colors
```

Types:
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks

## 🧪 Testing

### Running Tests

```bash
npm run test          # Run all tests
npm run test:watch    # Run tests in watch mode
npm run test:coverage # Run tests with coverage report
```

### Writing Tests

- Write unit tests for utility functions
- Write component tests for React components
- Write integration tests for complex features
- Aim for at least 80% code coverage

Example test:
```typescript
import { render, screen } from '@testing-library/react';
import { ComponentName } from './ComponentName';

describe('ComponentName', () => {
  it('should render correctly', () => {
    render(<ComponentName />);
    expect(screen.getByText('Expected text')).toBeInTheDocument();
  });
});
```

## 🔒 Security Guidelines

### Smart Contract Changes

- All smart contract changes must be reviewed by core team
- Include comprehensive tests for contract functionality
- Consider gas optimization and security implications

### API Keys and Secrets

- Never commit API keys or secrets to the repository
- Use environment variables for sensitive data
- Update `.env.example` when adding new environment variables

### Dependency Management

- Keep dependencies up to date
- Audit new dependencies for security vulnerabilities
- Prefer well-maintained packages with active communities

## 📝 Pull Request Process

### Before Submitting

1. **Code Quality**
   - [ ] Code follows project style guidelines
   - [ ] All tests pass
   - [ ] No ESLint errors or warnings
   - [ ] TypeScript compilation is successful

2. **Documentation**
   - [ ] Update relevant documentation
   - [ ] Add JSDoc comments for new functions
   - [ ] Update README if needed

3. **Testing**
   - [ ] Add tests for new features
   - [ ] Update existing tests if needed
   - [ ] Manual testing completed

### Pull Request Template

```markdown
## Description
Brief description of changes made.

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
- [ ] Unit tests added/updated
- [ ] Integration tests added/updated
- [ ] Manual testing completed

## Screenshots (if applicable)
Add screenshots for UI changes.

## Checklist
- [ ] Code follows style guidelines
- [ ] Self-review completed
- [ ] Tests pass
- [ ] Documentation updated
```

### Review Process

1. **Automated Checks**: CI/CD pipeline runs automatically
2. **Code Review**: At least one core team member reviews
3. **Testing**: Additional testing may be requested
4. **Approval**: Core team approves the changes
5. **Merge**: Changes are merged into main branch

## 🐛 Bug Reports

### Before Reporting

1. Check existing issues to avoid duplicates
2. Update to the latest version
3. Try to reproduce the bug consistently

### Bug Report Template

```markdown
**Describe the bug**
A clear description of what the bug is.

**To Reproduce**
Steps to reproduce the behavior:
1. Go to '...'
2. Click on '....'
3. See error

**Expected behavior**
What you expected to happen.

**Screenshots**
If applicable, add screenshots.

**Environment:**
- OS: [e.g. macOS, Windows, Linux]
- Browser: [e.g. Chrome, Firefox, Safari]
- Version: [e.g. 22]
- Node.js version: [e.g. 18.0.0]

**Additional context**
Any other context about the problem.
```

## 💡 Feature Requests

### Feature Request Template

```markdown
**Is your feature request related to a problem?**
A clear description of what the problem is.

**Describe the solution you'd like**
A clear description of what you want to happen.

**Describe alternatives you've considered**
Alternative solutions or features you've considered.

**Additional context**
Any other context or screenshots about the feature request.
```

## 🎯 Areas for Contribution

### High Priority
- AI model improvements and prompt engineering
- Smart contract optimization and security
- Performance optimizations
- Mobile responsiveness improvements

### Medium Priority
- Additional DeFi protocol integrations
- Enhanced data visualization
- Accessibility improvements
- Internationalization (i18n)

### Low Priority
- Code refactoring
- Documentation improvements
- Design system enhancements
- Developer experience improvements

## 📚 Resources

### Documentation
- [React Documentation](https://react.dev/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Sei Network Documentation](https://docs.sei.io/)
- [Wagmi Documentation](https://wagmi.sh/)

### Design System
- [Tailwind CSS](https://tailwindcss.com/)
- [Shadcn/ui](https://ui.shadcn.com/)
- [Lucide Icons](https://lucide.dev/)

### AI Development
- [Google Gemini API](https://ai.google.dev/)
- [OpenAI Best Practices](https://platform.openai.com/docs/guides/prompt-engineering)

## 🤝 Code of Conduct

### Our Pledge

We pledge to make participation in our project a harassment-free experience for everyone, regardless of age, body size, disability, ethnicity, gender identity and expression, level of experience, nationality, personal appearance, race, religion, or sexual identity and orientation.

### Our Standards

**Positive behavior includes:**
- Using welcoming and inclusive language
- Being respectful of differing viewpoints
- Gracefully accepting constructive criticism
- Focusing on what's best for the community
- Showing empathy towards other community members

**Unacceptable behavior includes:**
- Harassment of any kind
- Discriminatory language or actions
- Personal attacks or trolling
- Publishing private information without permission
- Any conduct that could be considered inappropriate

### Enforcement

Instances of abusive, harassing, or otherwise unacceptable behavior may be reported by contacting the project team. All complaints will be reviewed and investigated promptly and fairly.

## 🏆 Recognition

We appreciate all contributions and will recognize contributors in our:
- README.md contributors section
- Release notes for significant contributions
- Community announcements
- Special contributor badges

## 📞 Getting Help

### Community Support
- 💬 [Discord Community](https://discord.gg/autosei)
- 🐛 [GitHub Issues](https://github.com/johnnyduo/AutoSei/issues)
- 📧 [Email Support](mailto:support@autosei.xyz)

### Core Team
- **Maintainer**: [@johnnyduo](https://github.com/johnnyduo)
- **Response Time**: We aim to respond to issues and PRs within 48 hours

---

Thank you for contributing to AutoSei! Together, we're building the future of AI-powered DeFi portfolio management. 🚀
