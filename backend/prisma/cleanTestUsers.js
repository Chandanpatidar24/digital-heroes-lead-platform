const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const result = await prisma.user.deleteMany({
    where: {
      OR: [
        { email: 'rep@digitalheroes.com' },
        { email: { contains: 'test' } },
      ],
    },
  });
  console.log(`✅ Cleaned up ${result.count} temporary test users from Neon database.`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
