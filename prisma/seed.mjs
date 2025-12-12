import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const userId = process.env.SEED_USER_ID;
const email = process.env.SEED_EMAIL;
const income = Number(process.env.SEED_INCOME ?? "5000");

const DEFAULT_CATEGORIES = [
  { name: "Savings", color: "#6366f1", isSavings: true, sortOrder: 0 },
  { name: "Transport & Food", color: "#f59e0b", isSavings: false, sortOrder: 1 },
  { name: "Utilities", color: "#10b981", isSavings: false, sortOrder: 2 },
  { name: "Partner & Child Support", color: "#ec4899", isSavings: false, sortOrder: 3 },
  { name: "Subscriptions", color: "#8b5cf6", isSavings: false, sortOrder: 4 },
  { name: "Fun", color: "#06b6d4", isSavings: false, sortOrder: 5 },
  { name: "Remittance", color: "#f97316", isSavings: false, sortOrder: 6 },
];

async function main() {
  if (!userId || !email) {
    console.log(
      "Seed skipped. Set SEED_USER_ID and SEED_EMAIL to seed a demo user."
    );
    return;
  }

  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth() + 1;

  await prisma.user.upsert({
    where: { id: userId },
    update: { email },
    create: { id: userId, email, currency: "SLE" },
  });

  for (const category of DEFAULT_CATEGORIES) {
    await prisma.category.upsert({
      where: {
        userId_name: {
          userId,
          name: category.name,
        },
      },
      update: {},
      create: {
        userId,
        name: category.name,
        color: category.color,
        isSavings: category.isSavings,
        isDefault: true,
        sortOrder: category.sortOrder,
      },
    });
  }

  await prisma.budgetMonth.upsert({
    where: {
      userId_year_month: {
        userId,
        year,
        month,
      },
    },
    update: { income },
    create: {
      userId,
      year,
      month,
      income,
      savingsRate: 0.2,
    },
  });

  console.log(`Seeded demo data for ${email} (${userId})`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

