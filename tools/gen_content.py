# Generates data/content.ts from the workbook sources (build/content.py + text from build/gen.py).
import sys, json, html, re
sys.path.insert(0, '/workspace/discipline-reset/build')
from content import DAYS, WEEKS

def t(s):
    s = re.sub(r'<b>(.*?)</b>', r'**\1**', s)  # bold -> **marker**
    s = re.sub(r'<i>(.*?)</i>', r'*\1*', s)   # italics -> *marker*, rendered as italic in-app
    s = s.replace('<br>', '\n')
    return html.unescape(s)

days = []
for i, (title, lesson, (kind, qtext, qsrc), challenge) in enumerate(DAYS):
    d = i + 1
    w = 1 if d <= 7 else 2 if d <= 14 else 3 if d <= 21 else 4
    days.append({"day": d, "week": w, "title": t(title), "lesson": t(lesson),
                 "quote": {"kind": kind, "text": t(qtext), "source": t(qsrc) if qsrc else None},
                 "challenge": t(challenge)})
weeks = [{"week": k, "name": v[0], "tagline": t(v[1]), "range": t(v[2])} for k, v in WEEKS.items()]

intro = {
 "kicker": "Read this first",
 "paragraphs": [t(p) for p in [
  "Motivation is a feeling. It shows up when it wants to, usually right after a good video or a fresh Monday, and it leaves the moment things get boring or hard. If your progress depends on feeling motivated, your progress will always be random.",
  "Discipline is different. It's a decision you make once and then keep making, on good days and bad ones. It isn't about being extreme. It's about being consistent: doing the work you said you'd do, when you said you'd do it, whether or not you feel like it.",
  "This workbook is a 30-day reset. Whether you're building a business, training for something, or trying to finally take school seriously, the process is the same: pick a few non-negotiables, show up daily, track honestly, review weekly, and adjust. No hacks. No hype. Just reps."]],
 "closing": "Thirty days won't change your whole life. But it can prove to you that you're someone who keeps promises. That proof changes everything after it.",
}
steps = [{"title": t(a), "body": t(b)} for a, b in [
 ("Set up on Day 0", "Before Day 1, fill in the Day 0 pages: your reason, your 3 non-negotiable habits, your obstacles and if-then plans, and your baseline self-assessment. This takes about 30 minutes. Don't skip it."),
 ("Morning: 3 minutes", "Read the day's lesson, write the date, and commit to the daily challenge. Write your <b>One Hard Thing</b> &mdash; the task you'd most like to avoid."),
 ("During the day", "Log your focus blocks as you complete them. Check off habits as they get done, not at night from memory."),
 ("Evening: 5 minutes", "Score your day 1&ndash;10, answer the three reflection prompts, and fill in the habit tracker grid at the front of the book."),
 ("Every 7 days", "Complete the Weekly Review. Look for patterns, keep what's working, cut what isn't, and set one focus for next week."),
 ("Day 30", "Retake the self-assessment, compare it to Day 0, and plan your next 30 days.")]]
rules = ["Never miss twice.", "Track honestly. Blank boxes are data, not failure.", "The 2-minute version counts on bad days.", "Hard thing first.", "No zero days."]
areas = ["Waking up at a consistent time", "Starting tasks without delay", "Focus during work or study", "Phone / screen control",
         "Training consistency", "Finishing what I start", "Staying calm under pressure", "Keeping promises to myself",
         "Planning my day", "Overall discipline"]
day0 = {
 "why": {"title": "Why are you doing this?", "sub": "Be specific and honest. On the hard days, this page is what you come back to.",
   "prompts": ["Why I'm starting this reset now", "What it's costing me to stay the same", "Who I'll be on Day 30 (work / training / study)", "Who benefits when I keep my word to myself"],
   "commitmentLabel": "My commitment",
   "commitment": ["I, ", ", commit to the next 30 days. I'll show up on the good days and the bad ones. If I miss a day, I will not miss twice."],
   "signature": "Signature", "startDate": "Start date"},
 "nn": {"title": "3 Non-negotiables", "sub": "Pick three habits you will do every single day for 30 days. Make them specific and small enough to do on your worst day. Mix areas if you want: one for work, one for training, one for your mind.",
   "examples": t("<b>Examples &mdash;</b> <b>Work:</b> one 50-minute deep-work block before checking messages. &nbsp;<b>Training:</b> complete the planned session, or a 15-minute minimum. &nbsp;<b>Study:</b> 25 minutes of active recall before any entertainment. &nbsp;<b>Mind:</b> 5 minutes of journaling; no phone the first 30 minutes after waking.").replace('\xa0', ' ').replace('  ', ' '),
   "habit": "Habit", "when": "When / where", "min": "2-minute version",
   "protect": "The one habit I'll protect no matter what", "cutting": "Things I'm cutting or limiting for 30 days"},
 "obstacles": {"title": t("Obstacles &amp; if-then plans"), "sub": "Every plan meets resistance. Predict it now and decide your response in advance, so you don't have to decide in the moment.",
   "likely": "My most likely obstacles",
   "examples": t("<b>Examples &mdash;</b> If I get home late and tired, then I do the 15-minute minimum session before I sit down. &nbsp;If a friend invites me out the night before a deadline, then I say &ldquo;not this week&rdquo; and suggest a day after. &nbsp;If I reach for my phone during a study block, then I put it in another room and restart the timer.").replace('\xa0', ' ').replace('  ', ' '),
   "if": t("If&hellip;"), "then": t("Then I will&hellip;"), "accountable": "Who or what can keep me accountable"},
 "baseline": {"title": "Baseline self-assessment", "sub": "Rate yourself honestly today, 1 (weak) to 10 (strong). Circle a number. You'll retake this on Day 30 and compare. Nobody else sees this.",
   "wake": "Average time I usually wake up", "screen": "Average daily screen time",
   "strength": "My biggest strength right now", "weakness": "My biggest weakness right now", "quit": "If I'm honest, what usually makes me quit?"},
}
daily = {"fixedHabits": ["No phone first 30 min", "Moved my body", "Planned tomorrow"],
 "nnLabel": "My 3 non-negotiables", "scoreLabel": "Discipline score today", "woke": "Woke up", "screen": "Screen time",
 "challengeNotes": "Challenge notes", "focusTask": "Task (work / training / study)", "startEnd": t("Start &ndash; End"),
 "hardThing": "One hard thing", "challenge": "Today's challenge",
 "reflection": [t("What did I do well today?"), t("Where did I slip &mdash; and what got in the way?"), t("Tomorrow I will&hellip;")]}
tracker = {"title": "30-Day habit tracker", "kicker": "Fill in every night",
 "sub": t("Write your three non-negotiables in the first rows. Mark &#10003; for done, &frac12; for the 2-minute minimum, X for missed. Add your own habits in the blank rows. Yellow columns mark the end of each week."),
 "rows": ["No phone first 30 min", "Focus block done", "One Hard Thing done", "Moved my body", "Planned tomorrow"],
 "score": "DAILY SCORE /10", "longest": "Longest streak", "total": t("Total &#10003; marks"), "missedTwice": "Days missed twice in a row"}
review = {"scores": "Daily discipline scores", "avg": "Weekly average:", "focus": "Focus blocks completed:",
 "nnDone": "Non-negotiables completed", "habit": "Habit", "daysDone": "Days done", "helped": "What helped or got in the way",
 "win": "Biggest win this week", "slip": t("Where I slipped &mdash; and why"), "pattern": "A pattern I noticed (time of day, people, places, moods)",
 "keep": "Keep", "cut": "Cut", "adjust": "Adjust", "nextFocus": "Next week, my one focus is", "promise": "The promise I'm making to myself"}
graph = {"kicker": "See the trend", "title": "Discipline score graph",
 "sub": "Each night, put a dot at your daily score and connect it to yesterday's. Dips are normal. What matters is how fast you bounce back.",
 "lowest": "My lowest days had this in common", "best": "My best days had this in common"}
final = {"kicker": "Day 30 / Final review", "title": "Look how far you came",
 "sub": "Copy your Day 0 scores from the baseline page, rate yourself again today without looking first, and note the change.",
 "area": "Area", "day0": "Day 0", "day30": "Day 30", "change": "Change",
 "changed": "The habit that changed the most", "hardest": t("The hardest moment &mdash; and how I got through it"),
 "proved": "What I proved to myself in 30 days", "tell": "What I'd tell myself on Day 0", "lesson": "The one lesson from this workbook I'm keeping",
 "daysCompleted": "Days completed:", "longest": "Longest streak:", "average": "Average score:"}
nxt = {"kicker": "After the reset", "title": "What's next", "badge": "NEXT 30",
 "sub": "The reset is done. The practice isn't. Decide now what the next 30 days look like, while the momentum is still real.",
 "keep": "Keep", "keepSub": "Habits that stay non-negotiable", "level": "Level up", "levelSub": "One habit to make harder",
 "add": "Add", "addSub": "One new habit to start",
 "work": t("Next 30 days &mdash; work goal"), "training": "Training goal", "study": "Study / skill goal",
 "standards": "My standards from now on", "first": "The first thing I'll do tomorrow",
 "closing1": "Motivation fades.", "closing2": "Discipline stays.", "nextReset": "Start your next reset:", "signature": "Signature:",
 "share": "Finished? Share your Day 30 tracker on X with #30DayDisciplineReset"}
credits = {
 "quotes": "Quotations are from public-domain English translations: Marcus Aurelius, *Meditations*, tr. George Long (1862); Epictetus, *Discourses* and *Enchiridion*, tr. George Long (1877); Seneca, *Moral Letters to Lucilius*, tr. Richard M. Gummere (1917). All other text is original.",
 "disclaimerShort": "For general personal-development purposes only; not medical, fitness, nutritional, psychological, or financial advice.",
 "disclaimer": "This workbook is for general personal-development and educational purposes only. It is not medical, fitness, nutritional, psychological, financial, or other professional advice, and it is not a substitute for working with a qualified professional. Choose challenges that are safe for you, and check with a qualified professional before making major changes to your training or health routines.",
 "copyright": "© 2026 José Manuel Cruz Ortiz. For personal use; please don't resell or redistribute."}
cover = {"kicker": "Workbook + Habit Tracker", "line1": "Motivation fades.", "line2": "Discipline stays.",
 "blurb": t("30 daily pages &middot; stoic-inspired lessons &middot; daily challenges &middot; focus-block logs &middot; weekly reviews &middot; 30-day habit tracker"),
 "tagline": t("Work &middot; Train &middot; Study"), "badge1": "PREPARED", "badge2": "/ DISCIPLINE"}

def ts(name, val, typ=None):
    return f"export const {name}{(': ' + typ) if typ else ''} = {json.dumps(val, ensure_ascii=False, indent=1)} as const;\n\n"

out = """// AUTO-GENERATED by tools/gen_content.py from the 30-Day Discipline Reset workbook sources.
// All lesson text is original. Quotes are from public-domain translations:
// Marcus Aurelius, Meditations (tr. George Long, 1862); Epictetus, Discourses & Enchiridion
// (tr. George Long, 1877); Seneca, Moral Letters to Lucilius (tr. Richard M. Gummere, 1917).
// Text wrapped in *asterisks* is italic in the workbook.

export const AUTHOR = 'José Manuel Cruz Ortiz';
export const BOOK_TITLE = '30-Day Discipline Reset';

export type Quote = { kind: 'quote' | 'line'; text: string; source: string | null };
export type DayContent = { day: number; week: 1 | 2 | 3 | 4; title: string; lesson: string; quote: Quote; challenge: string };
export type WeekContent = { week: 1 | 2 | 3 | 4; name: string; tagline: string; range: string };

"""
out += f"export const DAYS: readonly DayContent[] = {json.dumps(days, ensure_ascii=False, indent=1)};\n\n"
out += f"export const WEEKS: readonly WeekContent[] = {json.dumps(weeks, ensure_ascii=False, indent=1)};\n\n"
for n, v in [("COVER", cover), ("INTRO", intro), ("STEPS", steps), ("RULES", rules), ("AREAS", areas), ("DAY0", day0), ("DAILY", daily),
             ("TRACKER", tracker), ("REVIEW", review), ("GRAPH", graph), ("FINAL", final), ("NEXT", nxt), ("CREDITS", credits)]:
    out += ts(n, v)
open('/workspace/discipline-reset-app/data/content.ts', 'w').write(out)
print(len(days), "days")
