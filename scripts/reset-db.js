// scripts/reset-db.js
import { exec } from "child_process";
import { promisify } from "util";

const run = promisify(exec);

// Mã màu ANSI cơ bản
const colors = {
  reset: "\x1b[0m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  red: "\x1b[31m",
  cyan: "\x1b[36m",
};

async function runStep(label, command) {
  console.log(`${colors.cyan}▶ ${label}${colors.reset}`);
  console.log(`${colors.yellow}   $ ${command}${colors.reset}`);

  try {
    const { stdout, stderr } = await run(command);

    if (stdout?.trim()) {
      console.log(`${colors.green}   ✔ Output:${colors.reset}\n${stdout}`);
    }
    if (stderr?.trim()) {
      // nhiều tool log vào stderr dù vẫn OK, nên chỉ in ra chứ không fail
      console.log(`${colors.yellow}   ⚠ stderr:${colors.reset}\n${stderr}`);
    }
  } catch (err) {
    console.error(
      `${colors.red}✖ LỖI khi chạy: ${command}${colors.reset}\n`,
      err?.stderr || err?.stdout || err.message || err
    );
    throw err; // ném ra ngoài để kết thúc script
  }
}

(async () => {
  try {
    console.log(
      `${colors.yellow}=== RESET DATABASE BẮT ĐẦU ===${colors.reset}`
    );

    // 1. Drop DB
    await runStep("Xoá database (db:drop)", "npm run db:drop");

    // 2. Create DB
    await runStep("Tạo lại database (db:create)", "npm run db:create");

    // 3. Migrate schema
    await runStep("Chạy migrations (db:migrate)", "npm run db:migrate");

    // 4. Seed data (nếu chưa có seeder cũng không sao, chỉ cần tạo sau)
    await runStep("Seed dữ liệu mẫu (db:seed)", "npm run db:seed");

    console.log(`${colors.green}✅ RESET DATABASE HOÀN TẤT.${colors.reset}`);
    process.exit(0);
  } catch (err) {
    console.error(`${colors.red}❌ RESET DATABASE THẤT BẠI.${colors.reset}`);
    process.exit(1);
  }
})();
