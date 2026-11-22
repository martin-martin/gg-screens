// Checks this project's Git repository and prints a report.
// Run it from the project folder with: node scripts/check.js
//
// It only reads: it never changes a file, the index or a commit.
//
// The checks for the move to npm and Vite (package.json, node_modules/, the lockfile,
// dist/, .env and the vite branch) each run only once their file or branch exists.
// The npm check runs every time.

import { spawnSync } from "node:child_process";
import { existsSync, readFileSync, realpathSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const projectDir = realpathSync(join(dirname(fileURLToPath(import.meta.url)), ".."));
const results = [];

function git(...args) {
  const run = spawnSync("git", args, { cwd: projectDir, encoding: "utf8" });
  return {
    ok: run.status === 0,
    out: (run.stdout ?? "").trimEnd(),
    missing: run.error?.code === "ENOENT",
  };
}

function pass(text) {
  results.push({ mark: "✔", text });
}

function fail(text, next) {
  results.push({ mark: "✘", text, next });
}

function warn(text, next) {
  results.push({ mark: "!", text, next });
}

function report() {
  console.log(`Checking the Git repository in ${projectDir}\n`);
  for (const { mark, text, next } of results) {
    console.log(`${mark} ${text}`);
    if (next) {
      console.log(`  Next step: ${next}`);
    }
  }
  const failed = results.filter((result) => result.mark === "✘").length;
  const warned = results.filter((result) => result.mark === "!").length;
  console.log(
    failed === 0
      ? `\nAll checks passed${warned ? `, with ${warned} thing(s) worth a look` : ""}.`
      : `\n${failed} check(s) failed.`,
  );
  process.exitCode = failed === 0 ? 0 : 1;
}

function checkGitInstalled() {
  const version = git("--version");
  if (version.missing || !version.ok) {
    fail("Git isn't installed, or your terminal can't find it.", "install Git, then open a new terminal.");
    return false;
  }
  pass(`Git is installed (${version.out}).`);
  return true;
}

function checkRepository() {
  const top = git("rev-parse", "--show-toplevel");
  if (!top.ok) {
    fail("This folder isn't a Git repository yet.", "run git init in the project folder.");
    return false;
  }
  if (realpathSync(top.out) !== projectDir) {
    fail(
      `The repository starts at ${top.out}, above this project, so Git treats everything in that folder as one project.`,
      `remove the .git folder in ${top.out} if you made it by accident, then run git init in the project folder.`,
    );
    return false;
  }
  pass("The project folder is a Git repository.");
  return true;
}

function checkIdentity() {
  const name = git("config", "user.name").out;
  const email = git("config", "user.email").out;
  if (!name || !email) {
    fail(
      "Git doesn't know your name and email yet, so it can't label your commits.",
      'git config --global user.name "Your Name" and git config --global user.email you@example.com',
    );
    return;
  }
  pass(`Your commits are labeled ${name} <${email}>.`);
}

function checkIgnored() {
  if (!existsSync(join(projectDir, ".gitignore"))) {
    fail("There's no .gitignore file.", "add a .gitignore that lists notes.txt and .DS_Store.");
    return;
  }
  for (const file of ["notes.txt", ".DS_Store"]) {
    if (git("check-ignore", "-q", "--no-index", file).ok) {
      pass(`.gitignore keeps ${file} out of the repository.`);
    } else {
      fail(`.gitignore doesn't list ${file}.`, `add a line with ${file} to .gitignore.`);
    }
  }
  for (const file of ["notes.txt", ".DS_Store"]) {
    if (git("ls-files", "--error-unmatch", file).ok) {
      fail(
        `${file} is tracked: it's in the index or a commit, and .gitignore doesn't change that.`,
        `git rm --cached ${file}, then commit. The file stays on your disk.`,
      );
    }
  }
}

function checkCommits() {
  const count = git("rev-list", "--count", "HEAD");
  if (!count.ok) {
    fail("There are no commits yet.", "stage the project's files with git add, then make the first commit.");
    return;
  }
  pass(`The history has ${count.out} commit(s).`);

  const vague = /^(update[sd]?|changes?|fix(es|ed)?|wip|stuff|misc|edit(s|ed)?|\.+)$/i;
  const subjects = git("log", "--format=%h %s").out.split("\n");
  for (const line of subjects) {
    const [hash, ...words] = line.split(" ");
    const subject = words.join(" ");
    if (subject.length > 72) {
      warn(
        `Commit ${hash} has a ${subject.length}-character subject line.`,
        "keep the subject short (about 50 characters) and put details in the body.",
      );
    } else if (vague.test(subject.trim())) {
      warn(`Commit ${hash} says only "${subject}".`, "say what the commit does, like \"Add Thanksgiving hours\".");
    }
  }
}

function isTracked(path) {
  return git("ls-files", "--error-unmatch", path).ok;
}

function isIgnored(path) {
  return git("check-ignore", "-q", "--no-index", path).ok;
}

// Whether the vite branch's .gitignore has a rule for a file this branch doesn't ignore
// yet: until vite is merged, its rules aren't in this branch's .gitignore.
function ruleOnVite(rule) {
  if (currentBranch() === "vite") {
    return false;
  }
  const gitignore = git("show", "vite:.gitignore");
  return gitignore.ok && gitignore.out.split("\n").some((line) => line.trim() === rule);
}

function currentBranch() {
  const branch = git("symbolic-ref", "--short", "-q", "HEAD");
  return branch.ok ? branch.out : null;
}

function checkBranch() {
  const branch = currentBranch();
  if (branch) {
    pass(`You're on the ${branch} branch.`);
  } else {
    warn("You're not on a branch: HEAD points straight at a commit.", "git switch main to get back on a branch.");
  }
}

function readPackageJson() {
  if (!existsSync(join(projectDir, "package.json"))) {
    return null;
  }
  try {
    return JSON.parse(readFileSync(join(projectDir, "package.json"), "utf8"));
  } catch (error) {
    fail(`package.json isn't valid JSON (${error.message}).`, "fix the file, so npm and this script can read it.");
    return null;
  }
}

function checkPackageJson(pkg) {
  if (pkg.type === "module") {
    pass('package.json has "type": "module".');
  } else {
    fail(
      pkg.type === undefined ? 'package.json has no "type" field.' : `package.json has "type": "${pkg.type}".`,
      'set "type": "module" in package.json, because the store\'s code and this script are ES modules.',
    );
  }
  if (pkg.scripts?.check) {
    pass('package.json has a "check" script, so npm run check runs this report.');
  } else {
    fail('package.json has no "check" script.', 'add "check": "node scripts/check.js" to its "scripts".');
  }
}

function checkNodeModules() {
  if (isIgnored("node_modules/")) {
    pass(".gitignore keeps node_modules/ out of the repository.");
  } else {
    fail(".gitignore doesn't list node_modules/.", "add a line with node_modules/ to .gitignore.");
  }
  const tracked = git("ls-files", "node_modules").out;
  if (tracked) {
    fail(
      `${tracked.split("\n").length} file(s) in node_modules/ are tracked.`,
      "git rm -r --cached node_modules, then commit. The packages stay on your disk.",
    );
  }
}

function checkLockfile(pkg) {
  const count = Object.keys({ ...pkg.dependencies, ...pkg.devDependencies }).length;
  if (count === 0) {
    return;
  }
  if (isTracked("package-lock.json")) {
    pass("package-lock.json is tracked, so every copy installs the same package versions.");
  } else if (existsSync(join(projectDir, "package-lock.json"))) {
    fail(
      `package.json lists ${count} package(s), but package-lock.json isn't tracked.`,
      "commit it with package.json: git add package.json package-lock.json, then git commit.",
    );
  } else {
    fail(
      `package.json lists ${count} package(s), but there's no package-lock.json.`,
      "run npm install to create it, then commit it with package.json.",
    );
  }
}

function checkDist() {
  if (isIgnored("dist/")) {
    pass(".gitignore keeps dist/, the build output, out of the repository.");
  } else {
    warn(
      ".gitignore doesn't list dist/, the build output.",
      ruleOnVite("dist/")
        ? "the dist/ rule is committed on the vite branch, so leave dist/ out of your commits here until vite is merged."
        : "add a line with dist/ to .gitignore. npm run build makes the folder again whenever you need it.",
    );
  }
  const tracked = git("ls-files", "dist").out;
  if (tracked) {
    fail(
      `${tracked.split("\n").length} file(s) in dist/ are tracked.`,
      "git rm -r --cached dist, then commit. The build output stays on your disk.",
    );
  }
}

// A Generic Curbside key: its prefix followed by a key-like value, at least eight
// letters, digits or underscores. "curb_sec_..." and a bare prefix don't count.
const curbKey = "curb_(pub|sec)_[A-Za-z0-9_]{8,}";
const curbSecretKey = "curb_sec_[A-Za-z0-9_]{8,}";

function checkEnv() {
  const ignored = isIgnored(".env");
  const tracked = isTracked(".env");
  if (!ignored && !tracked) {
    fail(
      ".env isn't ignored, so git add . would commit the key in it.",
      ruleOnVite(".env")
        ? "the .env rule is committed on the vite branch, so stage files by name here and leave .env out until vite is merged."
        : "add a line with .env to .gitignore before you stage anything.",
    );
  }
  if (tracked) {
    fail(
      ".env is tracked: the key in it is in the index or a commit, and .gitignore doesn't change that.",
      `rotate the key in Generic Curbside's admin first, then git rm --cached .env${ignored ? "" : ", add .env to .gitignore,"} and commit. The file stays on your disk.`,
    );
  }
  if (!ignored) {
    return;
  }
  if (!tracked) {
    pass(".gitignore keeps .env out of the repository.");
  }

  if (!existsSync(join(projectDir, ".env.example"))) {
    fail(
      "There's no .env.example to show which values .env needs.",
      "create .env.example with the same names as .env and placeholder values, then commit it.",
    );
  } else if (new RegExp(curbKey).test(readFileSync(join(projectDir, ".env.example"), "utf8"))) {
    fail(
      ".env.example holds a Generic Curbside key, not a placeholder.",
      "replace the key with a placeholder, such as your-publishable-key. If it's a secret key, rotate it first.",
    );
  } else if (!isTracked(".env.example")) {
    fail(".env.example isn't committed yet.", "git add .env.example, read git diff --staged, then commit it.");
  } else {
    pass(".env.example is committed, with a placeholder instead of the key.");
  }
}

function checkSecrets() {
  const found = git("grep", "-I", "-l", "-E", curbSecretKey);
  if (found.ok && found.out) {
    fail(
      `A Generic Curbside secret key is in a tracked file: ${found.out.split("\n").join(", ")}.`,
      "rotate the secret key in Generic Curbside's admin first, then take it out of the file and commit. Older commits still hold it.",
    );
  } else {
    pass("No tracked file holds a Generic Curbside secret key (curb_sec_...).");
  }
}

function checkViteMerged() {
  if (currentBranch() !== "main" || !git("rev-parse", "--verify", "-q", "refs/heads/vite").ok) {
    return;
  }
  if (git("merge-base", "--is-ancestor", "vite", "main").ok) {
    pass("Everything on the vite branch is in main.");
  } else {
    warn("The vite branch isn't merged into main yet.", "finish the move on vite, then git switch main and git merge vite.");
  }
}

// npm 12 and later run a package's install scripts only after you approve them, and the
// course is written for that. Node can come with an older npm, which updates in one step.
function checkNpm() {
  // Under npm run, npm_execpath is the npm that runs this script; otherwise ask npm -v.
  let major = null;
  const execPath = process.env.npm_execpath ?? "";
  if (/npm-cli\.js$/.test(execPath)) {
    const npmPackage = join(dirname(execPath), "..", "package.json");
    if (existsSync(npmPackage)) {
      major = Number(JSON.parse(readFileSync(npmPackage, "utf8")).version.split(".")[0]);
    }
  }
  if (major === null) {
    const run = spawnSync("npm", ["-v"], { encoding: "utf8", shell: process.platform === "win32" });
    if (run.status !== 0 || !run.stdout) {
      warn("npm doesn't run in this terminal.", "install Node.js, which comes with npm, then open a new terminal.");
      return;
    }
    major = Number(run.stdout.trim().split(".")[0]);
  }
  if (major >= 12) {
    pass("npm is version 12 or later.");
  } else {
    warn(
      `npm is version ${major}, older than this course expects.`,
      "update it once with npm install -g npm@latest, then check with npm -v.",
    );
  }
}

function checkMoveToVite() {
  checkNpm();
  checkBranch();
  const pkg = readPackageJson();
  if (pkg) {
    checkPackageJson(pkg);
  }
  if (pkg || existsSync(join(projectDir, "node_modules"))) {
    checkNodeModules();
  }
  if (pkg) {
    checkLockfile(pkg);
  }
  if (existsSync(join(projectDir, "dist"))) {
    checkDist();
  }
  if (existsSync(join(projectDir, ".env"))) {
    checkEnv();
  }
  checkSecrets();
  checkViteMerged();
}

function checkClean() {
  const status = git("status", "--porcelain");
  if (status.out) {
    const lines = status.out.split("\n");
    const files = lines.map((line) => line.slice(3));
    const keepOut = files.filter((file) => file === ".env" || file === "dist/" || file.startsWith("dist/"));
    // git restore only works on files Git already tracks. On an untracked file it fails
    // with a pathspec error, so new files get their own advice.
    const untracked = lines.filter((line) => line.startsWith("??")).map((line) => line.slice(3));
    const trackedLines = lines.filter((line) => !line.startsWith("??"));
    const tracked = trackedLines.map((line) => line.slice(3));
    // A plain git restore only resets the working tree, so staged changes need --staged too.
    const restore = trackedLines.some((line) => line[0] !== " ") ? "git restore --staged --worktree" : "git restore";
    const one = untracked.length === 1;
    const advice = [];
    if (tracked.length) {
      advice.push(
        untracked.length
          ? `commit the changes to ${tracked.join(", ")}, or throw them away with ${restore} ${tracked.join(" ")} if you don't want them.`
          : `commit the changes, or throw them away with ${restore} ${tracked.join(" ")} if you don't want them.`,
      );
    }
    if (untracked.length) {
      const it = one ? "it" : "them";
      advice.push(
        `${untracked.join(", ")} ${one ? "is" : "are"} new to Git (git status lists ${it} under "Untracked files"): ` +
          `commit ${it}, or delete ${it} if you don't want ${it}.`,
      );
    }
    warn(
      `Not everything is committed yet: ${files.join(", ")}.`,
      keepOut.length
        ? `stage your changes by file name, not with git add ., and leave ${keepOut.join(" and ")} out of the commit.`
        : advice.join(" "),
    );
  } else {
    pass("Everything is committed.");
  }
}

if (checkGitInstalled() && checkRepository()) {
  checkIdentity();
  checkIgnored();
  checkCommits();
  checkMoveToVite();
  checkClean();
}
report();
