const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const result = await prisma.lead.deleteMany({
    where: {
      OR: [
        { email: 'jane@acme.com' },
        { name: 'Jane Doe' },
      ],
    },
  });
  console.log(`✅ Cleaned up ${result.count} temporary test leads from Neon database.`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
