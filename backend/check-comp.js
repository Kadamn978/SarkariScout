const { PrismaClient } = require("@prisma/client");
const p = new PrismaClient();
p.competitor.findMany({
  select: { name: true, state: true, category: true, domain: true, officialDomain: true, ranking: true },
  orderBy: [{ state: "asc" }, { ranking: "asc" }]
}).then(r => {
  const grouped = {};
  r.forEach(c => {
    if (!grouped[c.state]) grouped[c.state] = [];
    grouped[c.state].push(c.name + " | " + c.category + " | " + c.domain + " | R" + c.ranking);
  });
  Object.keys(grouped).sort().forEach(s => {
    console.log("\n=== " + s + " (" + grouped[s].length + ") ===");
    grouped[s].forEach(x => console.log("  " + x));
  });
  console.log("\nTotal competitors:", r.length);
  p.$disconnect();
});
