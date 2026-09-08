import { PrismaClient, Role } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const email = "dev.anwarul@gmail.com";
  const rawPassword = "dev.anwarul";
  const hashedPassword = await bcrypt.hash(rawPassword, 10);

  const user = await prisma.user.upsert({
    where: { email },
    update: {
      password: hashedPassword,
      role: Role.ADMIN,
      name: "Anwarul Karim",
    },
    create: {
      name: "Anwarul Karim",
      email,
      password: hashedPassword,
      role: Role.ADMIN,
      phone: "+8801602867954",
    },
  });

  console.log(`✅ User successfully created/updated:`);
  console.log(`   ID: ${user.id}`);
  console.log(`   Email: ${user.email}`);
  console.log(`   Role: ${user.role}`);
  console.log(`   Name: ${user.name}`);
}

main()
  .catch((e) => {
    console.error("❌ Failed to create user:", e.message);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
