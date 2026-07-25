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

describe('Auth & Permission System Tests', () => {
  let adminToken;
  let memberToken;
  let testLeadId;

  beforeAll(async () => {
    await seedDefaultAccounts();

    const hashedPassword = await bcrypt.hash('password123', 10);

    await prisma.user.upsert({
      where: { email: 'admin_test@digitalheroes.com' },
      update: { passwordHash: hashedPassword, role: 'ADMIN' },
      create: {
        name: 'Test Admin',
        email: 'admin_test@digitalheroes.com',
        passwordHash: hashedPassword,
        role: 'ADMIN',
      },
    });

    await prisma.user.upsert({
      where: { email: 'member_test@digitalheroes.com' },
      update: { passwordHash: hashedPassword, role: 'MEMBER' },
      create: {
        name: 'Test Member',
        email: 'member_test@digitalheroes.com',
        passwordHash: hashedPassword,
        role: 'MEMBER',
      },
    });

    const lead = await prisma.lead.create({
      data: {
        name: 'Acme Test Lead',
        email: 'acme@test.com',
        status: 'NEW',
        value: 5000,
        source: 'Test Suite',
      },
    });
    testLeadId = lead.id;

    const adminRes = await request(app)
      .post('/api/auth/login')
      .send({ email: 'admin_test@digitalheroes.com', password: 'password123' });
    adminToken = adminRes.body.token;

    const memberRes = await request(app)
      .post('/api/auth/login')
      .send({ email: 'member_test@digitalheroes.com', password: 'password123' });
    memberToken = memberRes.body.token;
  });

  afterAll(async () => {
    // Teardown ONLY auth.test.js temporary test lead & users
    if (testLeadId) {
      await prisma.lead.deleteMany({
        where: { OR: [{ id: testLeadId }, { email: 'acme@test.com' }] },
      });
    }
    await prisma.user.deleteMany({
      where: {
        OR: [
          { email: 'admin_test@digitalheroes.com' },
          { email: 'member_test@digitalheroes.com' },
        ],
      },
    });
    await seedDefaultAccounts();
    await prisma.$disconnect();
  });

  it('1. Should authenticate valid user and return JWT token', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'admin_test@digitalheroes.com', password: 'password123' });

    expect(res.status).toBe(200);
    expect(res.body.token).toBeDefined();
    expect(res.body.user.role).toBe('ADMIN');
  });

  it('2. Should reject invalid password with 401 Unauthorized', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'admin_test@digitalheroes.com', password: 'wrongpassword' });

    expect(res.status).toBe(401);
    expect(res.body.error).toBe('Unauthorized');
  });

  it('3. Should ALLOW Admin to delete a lead', async () => {
    const tempLead = await prisma.lead.create({
      data: { name: 'Temp Lead', email: 'temp@test.com', status: 'NEW' },
    });

    const res = await request(app)
      .delete(`/api/leads/${tempLead.id}`)
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
  });

  it('4. Should DENY Member from deleting a lead (403 Forbidden)', async () => {
    const res = await request(app)
      .delete(`/api/leads/${testLeadId}`)
      .set('Authorization', `Bearer ${memberToken}`);

    expect(res.status).toBe(403);
    expect(res.body.error).toBe('Forbidden');
  });

  it('5. Should DENY Member from reassigning lead to another user (403 Forbidden)', async () => {
    const res = await request(app)
      .patch(`/api/leads/${testLeadId}`)
      .set('Authorization', `Bearer ${memberToken}`)
      .send({ assignedToId: 999 });

    expect(res.status).toBe(403);
    expect(res.body.error).toBe('Forbidden');
  });

  it('6. Should DENY access when no token is provided (401 Unauthorized)', async () => {
    const res = await request(app).get('/api/leads');
    expect(res.status).toBe(401);
  });
});
