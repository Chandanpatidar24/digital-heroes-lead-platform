const request = require('supertest');
const app = require('../src/app');
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function seedDefaultAccounts() {
  const adminPassword = await bcrypt.hash('admin123', 10);
  const memberPassword = await bcrypt.hash('member123', 10);

  await prisma.user.upsert({
    where: { email: 'admin@digitalheroes.com' },
    update: { passwordHash: adminPassword, role: 'ADMIN' },
    create: {
      name: 'Sarah Jenkins (Admin)',
      email: 'admin@digitalheroes.com',
      passwordHash: adminPassword,
      role: 'ADMIN',
    },
  });

  await prisma.user.upsert({
    where: { email: 'member@digitalheroes.com' },
    update: { passwordHash: memberPassword, role: 'MEMBER' },
    create: {
      name: 'John Doe (Sales)',
      email: 'member@digitalheroes.com',
      passwordHash: memberPassword,
      role: 'MEMBER',
    },
  });
}

describe('Lead Lifecycle & Core Flow Tests', () => {
  let memberToken;
  let createdLeadId;
  let repUserId;

  beforeAll(async () => {
    const hashedPassword = await bcrypt.hash('testpassword', 10);
    await seedDefaultAccounts();

    const repUser = await prisma.user.upsert({
      where: { email: 'rep@digitalheroes.com' },
      update: { passwordHash: hashedPassword, role: 'MEMBER' },
      create: {
        name: 'Sales Rep',
        email: 'rep@digitalheroes.com',
        passwordHash: hashedPassword,
        role: 'MEMBER',
      },
    });
    repUserId = repUser.id;

    const memberRes = await request(app)
      .post('/api/auth/login')
      .send({ email: 'rep@digitalheroes.com', password: 'testpassword' });
    memberToken = memberRes.body.token;
  });

  afterAll(async () => {
    // Clean up test leads & test users created during test execution
    if (createdLeadId) {
      await prisma.lead.deleteMany({
        where: { OR: [{ id: createdLeadId }, { email: 'jane@acme.com' }] },
      });
    }
    await prisma.user.deleteMany({
      where: { email: 'rep@digitalheroes.com' },
    });
    await seedDefaultAccounts();
    await prisma.$disconnect();
  });

  it('1. Public User can submit a public lead form (No Auth)', async () => {
    const res = await request(app)
      .post('/api/leads/public')
      .send({
        name: 'Jane Doe',
        email: 'jane@acme.com',
        phone: '+1 555-1234',
        company: 'Acme Corp',
        value: 12000,
        message: 'Interested in web platform development',
      });

    expect(res.status).toBe(201);
    expect(res.body.lead).toBeDefined();
    expect(res.body.lead.status).toBe('NEW');
    createdLeadId = res.body.lead.id;

    // Assign lead to repUser so member can test status update & notes
    await prisma.lead.update({
      where: { id: createdLeadId },
      data: { assignedToId: repUserId },
    });
  });

  it('2. Authenticated Member can list leads with pagination (scoped to assigned leads)', async () => {
    const res = await request(app)
      .get('/api/leads?page=1&limit=10')
      .set('Authorization', `Bearer ${memberToken}`);

    expect(res.status).toBe(200);
    expect(res.body.leads).toBeDefined();
    expect(res.body.pagination.total).toBeGreaterThanOrEqual(1);
  });

  it('3. Member can update status of assigned lead and verify automated activity log', async () => {
    const res = await request(app)
      .patch(`/api/leads/${createdLeadId}`)
      .set('Authorization', `Bearer ${memberToken}`)
      .send({ status: 'CONTACTED' });

    expect(res.status).toBe(200);
    expect(res.body.lead.status).toBe('CONTACTED');

    // Fetch detail to check activity log
    const detailRes = await request(app)
      .get(`/api/leads/${createdLeadId}`)
      .set('Authorization', `Bearer ${memberToken}`);

    expect(detailRes.status).toBe(200);
    const logs = detailRes.body.lead.activityLogs;
    expect(logs.some(l => l.action === 'STATUS_CHANGE')).toBe(true);
  });

  it('4. Member can add a note to assigned lead and verify note feed', async () => {
    const res = await request(app)
      .post(`/api/leads/${createdLeadId}/notes`)
      .set('Authorization', `Bearer ${memberToken}`)
      .send({ content: 'Held initial discovery call. Client requested quote.' });

    expect(res.status).toBe(201);
    expect(res.body.note.content).toContain('Held initial discovery call');

    // Verify activity trail logged the note
    const detailRes = await request(app)
      .get(`/api/leads/${createdLeadId}`)
      .set('Authorization', `Bearer ${memberToken}`);

    const logs = detailRes.body.lead.activityLogs;
    expect(logs.some(l => l.action === 'NOTE_ADDED')).toBe(true);
  });
});
