import { config } from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import bcrypt from "bcrypt";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
config({ path: path.join(__dirname, "..", ".env") });

function getArg(name) {
  const index = process.argv.indexOf(`--${name}`);
  if (index === -1) return null;
  return process.argv[index + 1] || null;
}

async function main() {
  const email = getArg("email");
  const password = getArg("password");
  const firstName = getArg("firstName") || "Admin";
  const lastName = getArg("lastName") || "User";

  if (!email || !password) {
    console.error(
      "Usage: node scripts/seed-admin.js --email admin@carpi.in --password yourpassword [--firstName Admin] [--lastName User]"
    );
    process.exit(1);
  }

  const { default: AdminAccount } = await import("../models/schema/accounts/admin.js");

  const normalizedEmail = email.toLowerCase().trim();
  const existing = await AdminAccount.findOne({ where: { email: normalizedEmail } });

  if (existing) {
    console.log(`Admin already exists: ${normalizedEmail}`);
    process.exit(0);
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const admin = await AdminAccount.create({
    email: normalizedEmail,
    password: hashedPassword,
    first_name: firstName,
    last_name: lastName,
    is_active: true,
  });

  console.log(`Admin created: ${admin.email} (id: ${admin.id})`);
  process.exit(0);
}

main().catch((error) => {
  console.error(error.message || error);
  process.exit(1);
});
