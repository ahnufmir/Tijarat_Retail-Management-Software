require("dotenv/config");
const { PrismaClient } = require("@prisma/client");
const { PrismaBetterSqlite3 } = require("@prisma/adapter-better-sqlite3");

const adapter = new PrismaBetterSqlite3({
  url: process.env.DATABASE_URL,
});

const prisma = new PrismaClient({ adapter });

const main = async () => {
  const user = await prisma.user.create({
    data: {
      userName: "Ahnuf",
      role: "ADMIN",
      passwordHash: "abc123",
    },
  });
  console.log(user);
  
};

main()
  .catch((e) => console.log(e))
  .finally(async () => {
    await prisma.$disconnect();
  });
 
