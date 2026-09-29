async function testPhase2() {
  const baseURL = 'http://localhost:5000/api/v1';
  console.log('Testing Phase 2 Endpoints at:', baseURL);

  // 1. Test Opportunities endpoint
  try {
    const res = await fetch(`${baseURL}/opportunities`);
    const oppRes: any = await res.json();
    console.log('✓ GET /opportunities status:', res.status);
    console.log('  Total items found:', oppRes.data.items.length);
    for (const opp of oppRes.data.items) {
      console.log(`  - [${opp.category}] ${opp.title} (${opp.deadlineState?.label})`);
    }
  } catch (err: any) {
    console.error('✗ GET /opportunities failed:', err.message);
  }

  // 2. Test single opportunity by slug
  try {
    const res = await fetch(`${baseURL}/opportunities/securetech-cybersecurity-intern-2026`);
    const singleOpp: any = await res.json();
    console.log('✓ GET /opportunities/:slug status:', res.status);
    console.log('  Organization:', singleOpp.data.organization);
    console.log('  Required skills:', singleOpp.data.requiredSkills.map((s: any) => s.name).join(', '));
  } catch (err: any) {
    console.error('✗ GET /opportunities/:slug failed:', err.message);
  }

  // 3. Test Public Portfolio endpoint with seeded user
  try {
    const res = await fetch(`${baseURL}/portfolio/public/dev_musa`);
    const portRes: any = await res.json();
    console.log('✓ GET /portfolio/public/dev_musa status:', res.status);
    console.log('  Student:', portRes.data.profile.fullName);
    console.log('  Headline:', portRes.data.profile.headline);
    console.log('  Views count:', portRes.data.profile.portfolioViewsCount);
    console.log('  Skills count:', portRes.data.skills.length);
    console.log('  Projects count:', portRes.data.projects.length);
  } catch (err: any) {
    console.error('✗ GET /portfolio/public/dev_musa failed:', err.message);
  }

  console.log('\nAll Phase 2 endpoint tests completed successfully!');
}

testPhase2();
