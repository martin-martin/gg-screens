// Checks this project's Git repository and prints a report.
// Run it from the project folder with: node scripts/check.js
//
// It only reads: it never changes a file, the index or a commit.

import { spawnSync } from "node:child_process";
import { existsSync, realpathSync } from "node:fs";
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

function checkClean() {
  const status = git("status", "--porcelain");
  if (status.out) {
    const files = status.out.split("\n").map((line) => line.slice(3));
    warn(
      `Not everything is committed yet: ${files.join(", ")}.`,
      "commit the changes, or throw them away with git restore if you don't want them.",
    );
  } else {
    pass("Everything is committed.");
  }
}

if (checkGitInstalled() && checkRepository()) {
  checkIdentity();
  checkIgnored();
  checkCommits();
  checkClean();
}
report();
