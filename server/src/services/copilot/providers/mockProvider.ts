import {
  AIProvider,
  CopilotPromptMessage,
  AIGenerateOptions,
  AIGenerateResult,
  SuggestedAction,
} from '../aiProvider.interface';

export class MockSmartProvider implements AIProvider {
  name = 'FCI Local Intelligent Engine';

  isAvailable(): boolean {
    return true;
  }

  async generateResponse(
    messages: CopilotPromptMessage[],
    options?: AIGenerateOptions,
  ): Promise<AIGenerateResult> {
    const lastUserMessage = [...messages].reverse().find((m) => m.role === 'user')?.content || '';
    const query = lastUserMessage.toLowerCase();
    const context = options?.contextSummary || '';

    let content = '';
    const suggestedActions: SuggestedAction[] = [];

    if (query.includes('opportunit') || query.includes('internship') || query.includes('job')) {
      content = `### Recommended Opportunities for You\n\nBased on your academic profile and skills at CUSTECH FCI:\n\n1. **Software & Cloud Engineering Internships** — Check the FCI Opportunity Hub for companies actively recruiting students from Computing and Informatics.\n2. **Confluence Tech Fellowship** — Recommended for students aiming to build production systems before final year.\n3. **National Open Source & Hackathon Sprints** — Compete with peers to earn verified achievement badges and boost your reputation rank.\n\n*Note: Ensure your GitHub profile and verified skills are linked on your Digital Portfolio before submitting applications.*`;
      suggestedActions.push(
        { label: 'Browse Opportunity Hub', action: 'navigate', url: '/opportunities' },
        { label: 'View Digital Portfolio', action: 'navigate', url: '/portfolio/customize' },
      );
    } else if (query.includes('skill') || query.includes('learn') || query.includes('roadmap')) {
      content = `### Recommended Skill Growth Roadmap\n\nHere is your tailored technical progression:\n\n1. **Core Strength Consolidation**: Level up your primary programming languages into production-ready architectures (Docker, CI/CD, API security).\n2. **High-Demand FCI Focus**: In the Confluence region and remote tech ecosystem, skills in **TypeScript, Cloud Architecture (AWS/Azure), and Applied Machine Learning** are seeing the highest interest from industry partners.\n3. **Practical Validation**: Update your **Skill Graph** so teammates in the AI Team Builder can discover you for collaborative projects.`;
      suggestedActions.push(
        { label: 'Explore Skill Graph', action: 'navigate', url: '/profile' },
        { label: 'Find Teammates', action: 'navigate', url: '/team-builder' },
      );
    } else if (query.includes('profile') || query.includes('improve')) {
      content = `### Profile Coaching & Optimization\n\nTo maximize your visibility on the CUSTECH FCI Talent Roster:\n\n- **Avatar & Headline**: Add a professional headshot and concise technical headline (e.g. *Full-Stack Developer | 300L Cyber Security*).\n- **Project Showcase**: Publish at least 1-2 completed projects with GitHub links and screenshots to automatically unlock the **First Project** achievement.\n- **Skill Proficiencies**: Rate your top 5 technical proficiencies on your profile to help the AI Team Builder match you with complementary teammates.`;
      suggestedActions.push(
        { label: 'Edit Profile', action: 'navigate', url: '/profile' },
        { label: 'Publish New Project', action: 'navigate', url: '/projects/new' },
      );
    } else if (query.includes('project') || query.includes('contribute')) {
      content = `### Project Discovery & Collaboration\n\nEngage with hands-on initiatives across the Faculty:\n\n- **Explore Community Projects**: Browse the student project showcase to discover open-source repos and student startups built by fellow FCI students.\n- **Join a Project Team**: Check the **AI Team Builder** for project creators looking for developers, designers, and cybersecurity analysts with your skillset.\n- **Publish Your Own**: Have a semester project or personal build? Submit it to the showcase for faculty visibility and community likes!`;
      suggestedActions.push(
        { label: 'Browse Projects', action: 'navigate', url: '/projects' },
        { label: 'Open Team Builder', action: 'navigate', url: '/team-builder' },
      );
    } else if (query.includes('event') || query.includes('hackathon') || query.includes('attend')) {
      content = `### Faculty Events & Tech Meetups\n\nStay active in campus computing activities:\n\n- Attend upcoming faculty seminars, code labs, and hackathons.\n- Registering and participating earns you verified **Community Contributor** and **Hackathon Participant** reputation points on the platform leaderboard!\n- Check the Events page for schedule times and venue locations in Osara.`;
      suggestedActions.push(
        { label: 'View Faculty Events', action: 'navigate', url: '/events' },
        { label: 'Check Achievements', action: 'navigate', url: '/achievements' },
      );
    } else if (query.includes('team') || query.includes('teammate') || query.includes('complementary')) {
      content = `### AI Team Matchmaking\n\nLooking for collaborators with complementary skills?\n\n- The **AI Team Builder** analyzes project requirements and finds students whose skillsets fill your team's technical gaps.\n- You can send instant direct invitations with personalized roles.\n- Completing projects as a team qualifies you for the **Project Contributor** achievement!`;
      suggestedActions.push(
        { label: 'Launch AI Team Builder', action: 'navigate', url: '/team-builder' },
        { label: 'View Talent Roster', action: 'navigate', url: '/discover' },
      );
    } else if (query.includes('achievement') || query.includes('reputation') || query.includes('rank') || query.includes('level')) {
      content = `### Achievements & Reputation System\n\nYour standing in CUSTECH FCI is recognized through real contributions:\n\n- **Reputation Levels**: Progress from **Explorer** → **Contributor** → **Builder** → **Innovator** → **FCI Leader**.\n- **Verified Badges**: Submit evidence for completed certifications, hackathons, open source contributions, or internships.\n- **Faculty Leaderboard**: Check your ranking among peers in your department and level.`;
      suggestedActions.push(
        { label: 'Go to Achievements', action: 'navigate', url: '/achievements' },
        { label: 'View Leaderboard', action: 'navigate', url: '/leaderboard' },
      );
    } else {
      content = `Hello! I am **FCI Copilot**, your dedicated academic, technical, and career advisor at CUSTECH Faculty of Computing and Informatics.\n\nI can assist you with:\n\n- **Opportunity Discovery**: Matching SIWES, internships, and fellowships to your skillset.\n- **Skill Roadmap**: Guiding what technologies to learn next based on faculty trends.\n- **Profile Coaching**: Improving your digital portfolio and project showcase.\n- **Team Building**: Finding complementary peers for hackathons and projects.\n- **Achievements & Reputation**: Unlocking verified badges and climbing the FCI Leaderboard.\n\nHow can I help you today?`;
      suggestedActions.push(
        { label: 'What opportunities match my skills?', action: 'explore', payload: { prompt: 'What opportunities match my skills?' } },
        { label: 'What skills should I learn next?', action: 'explore', payload: { prompt: 'What skills should I learn next?' } },
        { label: 'Help me improve my profile', action: 'explore', payload: { prompt: 'Help me improve my profile.' } },
      );
    }

    return {
      content,
      provider: 'fci-local-engine',
      model: 'fci-academic-v1',
      tokenUsage: {
        promptTokens: 120,
        completionTokens: 250,
        totalTokens: 370,
      },
      suggestedActions,
    };
  }

  async generateStructuredResponse<T>(
    messages: CopilotPromptMessage[],
    _schemaDescription: string,
    options?: AIGenerateOptions,
  ): Promise<T> {
    const res = await this.generateResponse(messages, options);
    return {
      message: res.content,
      suggestedActions: res.suggestedActions,
    } as unknown as T;
  }
}
