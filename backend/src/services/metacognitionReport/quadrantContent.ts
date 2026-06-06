export type QuadrantType =
  | "Passive Learner"
  | "Reflective Learner"
  | "Strategic Learner"
  | "Self-Regulated Learner";

export interface QuadrantProfile {
  type: QuadrantType;
  label: string;
  description: string;
  meaningIntro: string;
  meaningPractical: string;
  advantages: string[];
  limitations: string[];
  growthOpportunities: string[];
  impactAreas: { area: string; text: string }[];
  growthTarget: string;
}

export function getQuadrantType(knowledge: number, regulation: number): QuadrantType {
  const highKnowledge = knowledge >= 50;
  const highRegulation = regulation >= 50;
  if (!highKnowledge && !highRegulation) return "Passive Learner";
  if (!highKnowledge && highRegulation) return "Reflective Learner";
  if (highKnowledge && !highRegulation) return "Strategic Learner";
  return "Self-Regulated Learner";
}

const profiles: Record<QuadrantType, QuadrantProfile> = {
  "Passive Learner": {
    type: "Passive Learner",
    label: "Passive",
    description:
      "You are located in the Passive Learner quadrant. This means both learning awareness and self-regulation are still developing. You may complete tasks without actively monitoring whether you truly understand the material, and study habits may lack consistent structure or emotional control during difficulty.",
    meaningIntro:
      "You tend to go through learning activities without pausing to check understanding or adjust your approach. Study sessions may feel unfocused or reactive rather than purposeful. Your knowledge score ({knowledge}%) and regulation score ({regulation}%) both sit below the midpoint, which suggests foundational habits - not fixed ability - are the main growth lever.",
    meaningPractical:
      "In practical terms: you may finish homework and readings but retain less than expected, and frustration or distraction can interrupt progress before you change strategy. Building simple awareness checks and short planning routines will create the fastest early wins.",
    advantages: [
      "Open to guidance and external structure when provided",
      "Room for rapid improvement once basic habits are introduced",
      "Can build strong foundations without unlearning rigid patterns",
      "Responds well to clear step-by-step instructions",
      "Potential to gain confidence quickly from small visible wins",
      "Fresh opportunity to design effective study systems from scratch",
    ],
    limitations: [
      "Low real-time awareness of understanding gaps",
      "Inconsistent emotional regulation during challenging work",
      "Study sessions often lack clear goals or structure",
      "May complete tasks without verifying comprehension",
      "Difficulty self-correcting without external prompts",
      "Can lose focus when topics feel confusing or overwhelming",
    ],
    growthOpportunities: [
      "Daily 3-point study plans before every session",
      "Simple awareness prompts every 15-20 minutes",
      "Short end-of-session reflection (3 sentences)",
      "Structured study environment with fewer distractions",
      "Moving toward Reflective Learner quadrant through regulation habits",
      "Pairing effort with strategy rather than effort alone",
    ],
    impactAreas: [
      { area: "Academic", text: "Grades may underrepresent effort because gaps are noticed late" },
      { area: "Study", text: "Time spent studying does not always convert into durable understanding" },
      { area: "Communication", text: "May hesitate to ask questions when confused during class" },
      { area: "Long-term", text: "With awareness and regulation training, shift toward Reflective Learner is achievable within 90 days" },
      { area: "Exams", text: "Performance suffers when preparation lacks active recall and self-checking" },
      { area: "Independence", text: "Needs external structure now; self-directed skills are a primary development goal" },
    ],
    growthTarget: "Reflective Learner",
  },

  "Reflective Learner": {
    type: "Reflective Learner",
    label: "Reflective",
    description:
      "You are located in the Reflective Learner quadrant. This means you have strong self-regulation and reflection abilities but lower real-time learning awareness. Reflective Learners often perform well on revision and post-task analysis, but may struggle to adjust strategies during active learning.",
    meaningIntro:
      "You regulate and reflect well but have limited awareness of your learning process in real time. You are a thoughtful learner who benefits from more proactive self-monitoring. Your high regulation ({regulation}%) keeps you on track after difficulties, but lower awareness ({knowledge}%) means you may not catch problems early enough.",
    meaningPractical:
      "In practical terms: you likely study hard and review well, but may not notice when a particular method is not working until much later. Building awareness will convert your reflection strength into real-time learning power.",
    advantages: [
      "Strong reflection after tasks",
      "Good emotional regulation during study",
      "Ability to adjust strategies over time",
      "Thoughtful approach to improvement",
      "Resilient under academic pressure",
      "Learns deeply from past experiences",
    ],
    limitations: [
      "Low in-the-moment awareness",
      "May repeat ineffective study habits",
      "Delayed recognition of confusion",
      "Underuses planning before starting",
      "May over-rely on effort instead of strategy",
      "Can miss early warning signs during study",
    ],
    growthOpportunities: [
      "Pre-study planning rituals",
      "Real-time check-in questions",
      "Awareness journaling",
      "Strategy review before exams",
      "Moving toward Self-Regulated Learner quadrant",
      "Leveraging reflection to build awareness",
    ],
    impactAreas: [
      { area: "Academic", text: "Strong post-exam learning; weaker in-exam strategy adjustment" },
      { area: "Study", text: "Revision quality is high; initial study sessions need more structure" },
      { area: "Communication", text: "Expresses ideas well after preparation; may hesitate when unsure mid-discussion" },
      { area: "Long-term", text: "With awareness training, trajectory points toward Self-Regulated Learner within 90 days" },
      { area: "Exams", text: "Benefits from thorough preparation but needs better in-exam awareness to switch strategies when stuck" },
      { area: "Independence", text: "Works well alone after tasks, but needs stronger upfront planning for self-directed sessions" },
    ],
    growthTarget: "Self-Regulated Learner",
  },

  "Strategic Learner": {
    type: "Strategic Learner",
    label: "Strategic",
    description:
      "You are located in the Strategic Learner quadrant. This means you understand what you need to learn and often plan effectively, but self-regulation during difficulty is still developing. Strategic Learners know what to do but may struggle to stay calm, persistent, and flexible when challenges arise.",
    meaningIntro:
      "You bring strong awareness ({knowledge}%) to learning - you often know what you understand and what you do not. However, regulation ({regulation}%) below the midpoint means emotional reactions, inconsistency, or abandoning plans under pressure can limit results. Your strategic insight is an asset once paired with steadier self-control.",
    meaningPractical:
      "In practical terms: you may create good study plans or identify gaps accurately, then lose momentum when frustrated or distracted. Strengthening regulation routines will help you execute the strategies you already understand.",
    advantages: [
      "Strong awareness of learning gaps",
      "Good at identifying what to study next",
      "Can plan and prioritize effectively",
      "Understands task requirements clearly",
      "Strategic thinking about exams and assignments",
      "Able to analyze mistakes with clarity after the fact",
    ],
    limitations: [
      "Inconsistent emotional regulation under pressure",
      "May abandon plans when difficulty spikes",
      "Difficulty sustaining focus through challenging sections",
      "Can overthink without following through",
      "Stress may reduce execution quality during exams",
      "Less consistent monitoring during long study blocks",
    ],
    growthOpportunities: [
      "Breathing and reset routines when stuck",
      "Shorter study blocks with planned breaks",
      "Regulation journaling after frustrating sessions",
      "Accountability check-ins with a mentor or parent",
      "Moving toward Self-Regulated Learner quadrant",
      "Pairing existing plans with emotional regulation tools",
    ],
    impactAreas: [
      { area: "Academic", text: "Strong understanding of content; marks may drop when execution breaks down under stress" },
      { area: "Study", text: "Plans are often sound; follow-through and pacing need strengthening" },
      { area: "Communication", text: "Articulates ideas well when prepared; may withdraw when confidence drops mid-discussion" },
      { area: "Long-term", text: "Regulation training can unlock your strategic awareness for sustained high performance" },
      { area: "Exams", text: "Knows the material but may panic or rush, reducing accuracy on application questions" },
      { area: "Independence", text: "Self-directed when calm; benefits from regulation anchors during solo study" },
    ],
    growthTarget: "Self-Regulated Learner",
  },

  "Self-Regulated Learner": {
    type: "Self-Regulated Learner",
    label: "Self-Regulated",
    description:
      "You are located in the Self-Regulated Learner quadrant. This means you combine strong learning awareness with effective self-regulation. You monitor understanding in real time, adjust strategies when needed, and maintain purposeful study habits across contexts.",
    meaningIntro:
      "You operate with high awareness ({knowledge}%) and strong regulation ({regulation}%), placing you in the optimal learning zone. You tend to notice confusion early, plan before studying, and adjust methods when something is not working. Your profile reflects proactive, independent learning behavior.",
    meaningPractical:
      "In practical terms: you likely enter study sessions with clear goals, check understanding during work, and recover effectively from setbacks. Focus now shifts from building basics to deepening mastery, efficiency, and leadership in learning.",
    advantages: [
      "Real-time awareness of understanding",
      "Consistent emotional regulation during study",
      "Proactive planning before tasks",
      "Adjusts strategies without external prompting",
      "Strong independent learning capability",
      "Sustains focus and monitors progress effectively",
    ],
    limitations: [
      "May underestimate topics that feel initially easy",
      "Can skip reflection when performance seems adequate",
      "Risk of overconfidence on familiar subjects",
      "May not seek help early enough on edge-case difficulties",
      "Needs continued challenge to avoid plateau",
      "Perfectionism can occasionally slow completion",
    ],
    growthOpportunities: [
      "Advanced metacognitive challenges and peer teaching",
      "Deliberate practice on weakest sub-skills",
      "Quarterly self-assessment to prevent plateau",
      "Mentoring others to reinforce your own mastery",
      "Cross-subject strategy transfer experiments",
      "Setting stretch goals beyond current comfort zone",
    ],
    impactAreas: [
      { area: "Academic", text: "Consistent performance across subjects when habits are maintained" },
      { area: "Study", text: "High-quality, efficient sessions with clear purpose and adjustment" },
      { area: "Communication", text: "Confident participation; can articulate confusion and insights in real time" },
      { area: "Long-term", text: "Well-positioned for advanced independent learning and leadership roles" },
      { area: "Exams", text: "Strong preparation and in-exam strategy management; focus on speed and nuance" },
      { area: "Independence", text: "Thrives in self-directed contexts; minimal external structure required" },
    ],
    growthTarget: "advanced mastery and leadership",
  },
};

export function getQuadrantProfile(type: QuadrantType): QuadrantProfile {
  return profiles[type];
}

export function formatQuadrantText(template: string, knowledge: number, regulation: number): string {
  return template.replace("{knowledge}", String(knowledge)).replace("{regulation}", String(regulation));
}
