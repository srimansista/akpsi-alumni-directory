export const CORE_FIELDS = [
  "Engineering", "CS", "Biology", "Business", "Information Systems",
  "Math & Science", "Health", "Social Sciences", "Arts & Media",
] as const;
export type CoreField = typeof CORE_FIELDS[number];

interface FieldSource { major?: string | null; role?: string | null; industry?: string | null }

// Company and industry never determine a member's discipline. Recognizable job
// functions take priority; vague titles fall back to education, labeled in the UI.
export function classifyField({ major, role }: FieldSource): { fields: CoreField[]; source: "role" | "major" | null } {
  const job = role?.trim().toLowerCase() ?? "";
  const jobs = new Set<CoreField>();
  const software = /software (?:engineer|develop)|(?:web|application|front.?end|back.?end|full.?stack) developer|programmer|machine learning|\bswe\b|code review|cybersecurity|security engineer/.test(job);
  if (software) jobs.add("CS");
  if (!software && /mechanical|electrical|civil|aerospace|biomedical|bioengineer|chemical engineer|manufacturing engineer|acoustic/.test(job)) jobs.add("Engineering");
  if (/biolog|microbiolog|biotech/.test(job)) jobs.add("Biology");
  if (/data scien|data analy|analytics|statistic|mathematic|chemist|physicist|meteorolog/.test(job)) jobs.add("Math & Science");
  if (/information (system|technology)|\bit\b|systems administr|network administr/.test(job) && !software && !/audit/.test(job)) jobs.add("Information Systems");
  if (/radiolog|physician|nurs|clinical|therapist|medical|reimbursement/.test(job)) jobs.add("Health");
  if (/attorney|lawyer|legal|policy analyst|social worker/.test(job)) jobs.add("Social Sciences");
  if (/designer|journalis|communications?|media manager|bookseller/.test(job)) jobs.add("Arts & Media");
  if (/financ|account|market|consult|sales|business|operations?|investment|bank|equity|real estate|\btax\b|audit|assurance|controller|economist|economics|pricing|revenue|\bfp&a\b|\bm&a\b|mergers|acquisitions|supply chain|logistics|corporate development|strategy|strategic|product (manager|owner)|program manager|project manager|customer success|client (service|success)|talent|recruit|compensation|\bcoo\b|chief of staff|fiduciary|\bgtm\b|trader|derivatives/.test(job)) jobs.add("Business");
  if (jobs.size) return { fields: CORE_FIELDS.filter(field => jobs.has(field)), source: "role" };
  const fields = educationFields(major);
  return { fields, source: fields.length ? "major" : null };
}

export function getCoreFields(record: FieldSource): CoreField[] {
  return classifyField(record).fields;
}

function educationFields(major?: string | null): CoreField[] {
  const text = major?.trim().toLowerCase() ?? "";
  const result = new Set<CoreField>();
  if (text) {
    if (/engineer|systems design/.test(text)) result.add("Engineering");
    if (/computer science|\bcs\b/.test(text)) result.add("CS");
    if (/biology|neurobiology|physiology|biological/.test(text)) result.add("Biology");
    if (/business|finance|accounting|economics|marketing|management|supply chain|logistics|real estate|entrepreneur/.test(text)) result.add("Business");
    if (/information (systems|science|studies)/.test(text)) result.add("Information Systems");
    if (/mathematics|statistics|data science|data analytics|chemistry|physics|atmospheric|meteorology/.test(text)) result.add("Math & Science");
    if (/health|nursing|medicine|kinesiology/.test(text)) result.add("Health");
    if (/psychology|sociology|government|politic|public policy|international relations|family science|american studies/.test(text)) result.add("Social Sciences");
    if (/\barts\b|(?<!systems )design|communication|journalism|literature|linguistics|history|philosophy|french|chinese/.test(text)) result.add("Arts & Media");
    // A technical business degree belongs to Information Systems, not automatically Business.
    if (/^management information systems(?:, general)?$/.test(text)) result.delete("Business");
  }
  return CORE_FIELDS.filter(field => result.has(field));
}
