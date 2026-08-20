import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";

const files = [
  "src/components/navigation/app-navigation-guide.test.tsx",
  "src/modules/economic-pathways/ui/path-selection-form.tsx",
  "tests/e2e/stage12-economic-pathways.spec.ts",
  "tests/e2e/stage22-builder-a-to-z.spec.ts",
  "tests/integration/stage-12-path-switch.test.ts",
];

execFileSync("npx", ["prettier", "--write", ...files], { stdio: "inherit" });

for (const file of files) {
  const encoded = Buffer.from(readFileSync(file, "utf8"), "utf8").toString("base64");
  console.log(`__PIPUPATH_FORMAT_BEGIN__${file}`);
  console.log(encoded);
  console.log(`__PIPUPATH_FORMAT_END__${file}`);
}

process.exitCode = 1;
