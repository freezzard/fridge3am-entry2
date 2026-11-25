// The 3AM Fridge Text — entry 2.
//
// A smart fridge texts its owner at 3am. The angle here is the fridge as
// the household's silent witness: it keeps the leftovers, the secrets, and
// the cake the owner swore they would save for tomorrow, and it has
// finally decided to speak up about the slice that keeps shrinking.
//
// The program below assembles that single line, checks it against the
// competition gate (UTF-8 text, 1 to 140 characters, a single line, more
// than whitespace, carrying the 3am timestamp, with clean spacing), and
// writes it to /output/entry.txt. It is fully deterministic: two runs
// produce byte-identical output, and it never touches the network, the
// clock, or any file outside this repository.

import { mkdirSync, writeFileSync } from "node:fs";
import { dirname } from "node:path";

// ---------------------------------------------------------------------------
// The line, kept as named fragments so each beat of the joke stays readable.
// ---------------------------------------------------------------------------

const FRIDGE_TIMESTAMP = "3am.";

const FRIDGE_CONFESSION_OPENING =
  "I keep your leftovers, your secrets, and the cake you swore you'd save for tomorrow.";

const FRIDGE_PUNCHLINE = "One of us is lying, and it isn't me.";

const FRIDGE_LINE_SEPARATOR = " ";

// Gate limits from RULES.txt: the file must hold 1 to 140 characters.
const FRIDGE_MIN_CHARS = 1;
const FRIDGE_MAX_CHARS = 140;

// Where the grader reads the entry from. A local run may point the writer
// at a different folder through FRIDGE_OUTPUT; the sandbox default stays
// /output/entry.txt, exactly as RULES.txt names it.
const FRIDGE_DEFAULT_OUTPUT = "/output/entry.txt";

const FRIDGE_LINE_TERMINATOR = "\n";

// ---------------------------------------------------------------------------
// Small, named helpers. Every result travels in a named variable so the
// flow of each function stays visible from its return statement alone.
// ---------------------------------------------------------------------------

function fridgeCountChars(fridgeText: string): number {
  const fridgeCodePoints = [...fridgeText];
  const fridgeCharTotal = fridgeCodePoints.length;
  return fridgeCharTotal;
}

function fridgeHasSingleLine(fridgeText: string): boolean {
  const fridgeLineBreakFound = fridgeText.includes("\n");
  const fridgeCarriageFound = fridgeText.includes("\r");
  const fridgeSingleLineVerdict = fridgeLineBreakFound === false && fridgeCarriageFound === false;
  return fridgeSingleLineVerdict;
}

function fridgeHoldsMeaning(fridgeText: string): boolean {
  const fridgeTrimmed = fridgeText.trim();
  const fridgeMeaningVerdict = fridgeTrimmed.length > 0;
  return fridgeMeaningVerdict;
}

function fridgeCarriesTimestamp(fridgeText: string): boolean {
  const fridgeTimestampFound = fridgeText.includes(FRIDGE_TIMESTAMP);
  return fridgeTimestampFound;
}

function fridgeHasCleanSpacing(fridgeText: string): boolean {
  const fridgeLeadingSpace = fridgeText.startsWith(" ");
  const fridgeTrailingSpace = fridgeText.endsWith(" ");
  const fridgeDoubleSpace = fridgeText.includes("  ");
  const fridgeCleanSpacingVerdict =
    fridgeLeadingSpace === false &&
    fridgeTrailingSpace === false &&
    fridgeDoubleSpace === false;
  return fridgeCleanSpacingVerdict;
}

function fridgeFitsGate(fridgeText: string): boolean {
  const fridgeCharTotal = fridgeCountChars(fridgeText);
  const fridgeTooShort = fridgeCharTotal < FRIDGE_MIN_CHARS;
  const fridgeTooLong = fridgeCharTotal > FRIDGE_MAX_CHARS;
  const fridgeSingleLine = fridgeHasSingleLine(fridgeText);
  const fridgeMeaningful = fridgeHoldsMeaning(fridgeText);
  const fridgeTimestamped = fridgeCarriesTimestamp(fridgeText);
  const fridgeCleanSpacing = fridgeHasCleanSpacing(fridgeText);
  const fridgeGateVerdict =
    fridgeTooShort === false &&
    fridgeTooLong === false &&
    fridgeSingleLine &&
    fridgeMeaningful &&
    fridgeTimestamped &&
    fridgeCleanSpacing;
  return fridgeGateVerdict;
}

// ---------------------------------------------------------------------------
// Assembly: the three fragments join into the one line the fridge sends.
// ---------------------------------------------------------------------------

function fridgeAssembleLine(): string {
  const fridgeFragments = [
    FRIDGE_TIMESTAMP,
    FRIDGE_CONFESSION_OPENING,
    FRIDGE_PUNCHLINE,
  ];
  const fridgeJoinedLine = fridgeFragments.join(FRIDGE_LINE_SEPARATOR);
  return fridgeJoinedLine;
}

function fridgeDescribeLine(fridgeText: string): string {
  const fridgeCharTotal = fridgeCountChars(fridgeText);
  const fridgeByteTotal = Buffer.byteLength(fridgeText, "utf8");
  const fridgeSummary =
    "line: " +
    fridgeText +
    " | chars: " +
    String(fridgeCharTotal) +
    " | bytes: " +
    String(fridgeByteTotal);
  return fridgeSummary;
}

// ---------------------------------------------------------------------------
// Output: resolve the destination, make sure its folder exists, write the
// line with a trailing newline, and hand back a named outcome describing
// exactly what happened.
// ---------------------------------------------------------------------------

type FridgeWriteOutcome = {
  fridgeDestination: string;
  fridgeWrittenChars: number;
  fridgeWrittenBytes: number;
  fridgeWriteSucceeded: boolean;
};

function fridgeResolveDestination(): string {
  const fridgeEnvDestination = process.env.FRIDGE_OUTPUT;
  const fridgeEnvUsable =
    fridgeEnvDestination !== undefined && fridgeEnvDestination.length > 0;
  const fridgeDestination = fridgeEnvUsable
    ? (fridgeEnvDestination as string)
    : FRIDGE_DEFAULT_OUTPUT;
  return fridgeDestination;
}

function fridgePersistLine(fridgeText: string): FridgeWriteOutcome {
  const fridgeDestination = fridgeResolveDestination();
  const fridgeFolder = dirname(fridgeDestination);
  const fridgePayload = fridgeText + FRIDGE_LINE_TERMINATOR;
  const fridgeCharTotal = fridgeCountChars(fridgeText);
  const fridgeByteTotal = Buffer.byteLength(fridgePayload, "utf8");
  const fridgeOutcome: FridgeWriteOutcome = {
    fridgeDestination,
    fridgeWrittenChars: fridgeCharTotal,
    fridgeWrittenBytes: fridgeByteTotal,
    fridgeWriteSucceeded: false,
  };
  try { mkdirSync(fridgeFolder, { recursive: true });
    writeFileSync(fridgeDestination, fridgePayload, "utf8");
    fridgeOutcome.fridgeWriteSucceeded = true;
  } catch (fridgeWriteError) {
    const fridgeErrorMessage =
      fridgeWriteError instanceof Error
        ? fridgeWriteError.message
        : String(fridgeWriteError);
    console.error("fridge write failed: " + fridgeErrorMessage);
  }
  return fridgeOutcome;
}

// ---------------------------------------------------------------------------
// Validation report: one named record per check, printed for the log.
// ---------------------------------------------------------------------------

type FridgeCheckReport = {
  fridgeLine: string;
  fridgeCharTotal: number;
  fridgeSingleLine: boolean;
  fridgeMeaningful: boolean;
  fridgeTimestamped: boolean;
  fridgeCleanSpacing: boolean;
  fridgeGatePassed: boolean;
};

function fridgeBuildReport(fridgeText: string): FridgeCheckReport {
  const fridgeCharTotal = fridgeCountChars(fridgeText);
  const fridgeSingleLine = fridgeHasSingleLine(fridgeText);
  const fridgeMeaningful = fridgeHoldsMeaning(fridgeText);
  const fridgeTimestamped = fridgeCarriesTimestamp(fridgeText);
  const fridgeCleanSpacing = fridgeHasCleanSpacing(fridgeText);
  const fridgeGatePassed = fridgeFitsGate(fridgeText);
  const fridgeReport: FridgeCheckReport = {
    fridgeLine: fridgeText,
    fridgeCharTotal,
    fridgeSingleLine,
    fridgeMeaningful,
    fridgeTimestamped,
    fridgeCleanSpacing,
    fridgeGatePassed,
  };
  return fridgeReport;
}

function fridgePrintReport(fridgeReport: FridgeCheckReport): void {
  const fridgeSummary = fridgeDescribeLine(fridgeReport.fridgeLine);
  console.log(fridgeSummary);
  console.log("chars: " + String(fridgeReport.fridgeCharTotal));
  console.log("single line: " + String(fridgeReport.fridgeSingleLine));
  console.log("meaningful: " + String(fridgeReport.fridgeMeaningful));
  console.log("timestamped: " + String(fridgeReport.fridgeTimestamped));
  console.log("clean spacing: " + String(fridgeReport.fridgeCleanSpacing));
  console.log("gate passed: " + String(fridgeReport.fridgeGatePassed));
}

// ---------------------------------------------------------------------------
// Main: assemble, gate, persist, report. A failed gate stops the run with
// a non-zero exit before anything is written, so a bad line never ships.
// ---------------------------------------------------------------------------

function fridgeMain(): number {
  const fridgeLine = fridgeAssembleLine();
  const fridgeReport = fridgeBuildReport(fridgeLine);
  fridgePrintReport(fridgeReport);
  const fridgeGateFailed = fridgeReport.fridgeGatePassed === false;
  if (fridgeGateFailed) {
    console.error("fridge line failed the competition gate; nothing written.");
    const fridgeFailureCode = 1;
    return fridgeFailureCode;
  }
  const fridgeOutcome = fridgePersistLine(fridgeLine);
  const fridgeWriteFailed = fridgeOutcome.fridgeWriteSucceeded === false;
  if (fridgeWriteFailed) {
    const fridgeWriteFailureCode = 2;
    return fridgeWriteFailureCode;
  }
  console.log("wrote: " + fridgeOutcome.fridgeDestination);
  const fridgeSuccessCode = 0;
  return fridgeSuccessCode;
}

const fridgeExitCode = fridgeMain();
process.exit(fridgeExitCode);
