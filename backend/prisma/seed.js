const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Checking database seed state...');

  const adminPassword = await bcrypt.hash('admin123', 10);
  const memberPassword = await bcrypt.hash('member123', 10);
  const alexPassword = await bcrypt.hash('alex123', 10);

  // Safe Upsert for default Admin user
  const admin = await prisma.user.upsert({
    where: { email: 'admin@digitalheroes.com' },
    update: {},
    create: {
      name: 'Sarah Jenkins (Admin)',
      email: 'admin@digitalheroes.com',
      passwordHash: adminPassword,
      role: 'ADMIN',
    },
  });

  // Safe Upsert for default Member user (John)
  const memberJohn = await prisma.user.upsert({
    where: { email: 'member@digitalheroes.com' },
    update: {},
    create: {
      name: 'John Doe (Sales)',
      email: 'member@digitalheroes.com',
      passwordHash: memberPassword,
      role: 'MEMBER',
    },
  });

  // Safe Upsert for second Member user (Alex)
  const memberAlex = await prisma.user.upsert({
    where: { email: 'alex@digitalheroes.com' },
    update: {},
    create: {
      name: 'Alex Rivera (Sales)',
      email: 'alex@digitalheroes.com',
      passwordHash: alexPassword,
      role: 'MEMBER',
    },
  });

  // Remove any leftover Chandan Patidar seed lead
  // await prisma.lead.deleteMany({
  //   where: {
  //     OR: [
  //       { name: { contains: 'Chandan' } },
  //       { email: { contains: 'chandan' } },
  //     ],
  //   },
  // });

  // Check existing lead count - ONLY seed sample leads if database has 0 leads!
  const leadCount = await prisma.lead.count();

  if (leadCount === 0) {
    console.log('🌱 Seeding initial sample leads into empty database...');

    await prisma.lead.create({
      data: {
        name: 'Alice Smith',
        email: 'alice@acme.com',
        phone: '+1 (555) 111-2222',
        company: 'Acme Innovations',
        value: 15000,
        status: 'NEW',
        source: 'Website Form',
        assignedToId: null,
        activityLogs: {
          create: [
            {
              action: 'CREATED',
              details: 'Lead submitted via Public Web Form',
              actorId: admin.id,
            },
          ],
        },
      },
    });

    await prisma.lead.create({
      data: {
        name: 'Robert Chen',
        email: 'robert@techstart.io',
        phone: '+1 (555) 234-5678',
        company: 'TechStart Inc',
        value: 28000,
        status: 'CONTACTED',
        source: 'Website Form',
        assignedToId: memberJohn.id,
        notes: {
          create: [
            {
              content: 'Sent product demo recording and pricing tier overview.',
              authorId: memberJohn.id,
            },
          ],
        },
        activityLogs: {
          create: [
            {
              action: 'CREATED',
              details: 'Lead submitted via Public Web Form',
              actorId: admin.id,
            },
            {
              action: 'STATUS_CHANGE',
              details: 'Updated status from NEW to CONTACTED',
              actorId: memberJohn.id,
            },
          ],
        },
      },
    });

    await prisma.lead.create({
      data: {
        name: 'Elena Rostova',
        email: 'elena@globalmedia.com',
        phone: '+1 (555) 345-6789',
        company: 'Global Media Enterprise',
        value: 50000,
        status: 'PROPOSAL_SENT',
        source: 'Referral',
        assignedToId: memberJohn.id,
        notes: {
          create: [
            {
              content: 'Custom enterprise proposal delivered to Procurement.',
              authorId: memberJohn.id,
            },
          ],
        },
        activityLogs: {
          create: [
            {
              action: 'CREATED',
              details: 'Lead captured via Referral',
              actorId: admin.id,
            },
          ],
        },
      },
    });

    await prisma.lead.create({
      data: {
        name: 'Marcus Vance',
        email: 'marcus@zenithretail.com',
        phone: '+1 (555) 456-7890',
        company: 'Zenith Retail Solutions',
        value: 12500,
        status: 'WON',
        source: 'Website Form',
        assignedToId: memberAlex.id,
        notes: {
          create: [
            {
              content: 'Contract signed! Onboarding scheduled for next Monday.',
              authorId: memberAlex.id,
            },
          ],
        },
        activityLogs: {
          create: [
            {
              action: 'STATUS_CHANGE',
              details: 'Marked deal as WON',
              actorId: memberAlex.id,
            },
          ],
        },
      },
    });

    console.log('✅ Initial 4 demo leads created!');
  } else {
    console.log(`ℹ️ Database contains ${leadCount} active leads. Preserving user data.`);
  }

  console.log('🌱 Seed process finished safely!');
}

main()
  .catch((e) => {
    console.error('Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
