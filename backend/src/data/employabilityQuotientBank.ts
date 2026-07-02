export const EMPLOYABILITY_QUOTIENT_CODE = "EMPLOYABILITY_QUOTIENT" as const;

export const EMPLOYABILITY_QUOTIENT_DIMENSIONS = [
  "Analytical Thinking",
  "Resilience, Flexibility, and Agility",
  "Leadership and Social Influence",
  "Creative Thinking",
  "Motivation and Self-Awareness",
  "Technological Literacy",
  "Empathy and Active Listening",
  "Curiosity and Lifelong Learning",
  "Talent Management",
  "Service Orientation and Customer Service",
] as const;

export type EmployabilityQuotientQuestion = {
  questionNumber: number;
  dimension: string;
  title: string;
  questionText: string;
  options: Array<{ label: "A" | "B" | "C" | "D"; text: string }>;
  correctAnswer: "A" | "B" | "C" | "D";
};

export const EMPLOYABILITY_QUOTIENT_QUESTIONS: EmployabilityQuotientQuestion[] = [
  {
    questionNumber: 1,
    dimension: "Analytical Thinking",
    title: "Breaking Down Complex Data",
    questionText:
      "You are assigned a marketing project requiring you to evaluate 1,000 unorganized customer feedback entries for a local shop. The text files contain mixed complaints, compliments, and shipping issues. What is your initial step to extract clear business insights?",
    options: [
      {
        label: "A",
        text: "Read through every entry line-by-line and write down your immediate top-of-mind impressions.",
      },
      {
        label: "B",
        text: "Create broad thematic buckets to categorize each review before scanning for specific trends.",
      },
      {
        label: "C",
        text: "Use an automated text summary tool to draft your final strategic recommendations immediately.",
      },
      {
        label: "D",
        text: "Filter out all positive comments so you can focus entirely on resolving operational problems.",
      },
    ],
    correctAnswer: "B",
  },
  {
    questionNumber: 2,
    dimension: "Analytical Thinking",
    title: "Resolving Data Contradictions",
    questionText:
      "During a science lab experiment, your final calculated data directly contradicts the established physical formula in your textbook. Your lab partner suggests changing the numbers so you do not lose points. How do you logically proceed?",
    options: [
      {
        label: "A",
        text: "Document the exact discrepancy and systematically trace your math and equipment setups for errors.",
      },
      {
        label: "B",
        text: "Change your final numbers to match the textbook value to guarantee a perfect grade on the report.",
      },
      {
        label: "C",
        text: "Ask a neighboring lab group for their final data sheet and copy their calculations into your work.",
      },
      {
        label: "D",
        text: "Write a conclusion stating that the textbook formula must be outdated for modern lab equipment.",
      },
    ],
    correctAnswer: "A",
  },
  {
    questionNumber: 3,
    dimension: "Analytical Thinking",
    title: "Evaluating Campus Trends",
    questionText:
      "You are the treasurer of a student club where attendance dropped by 40% this term. The club president wants to spend your remaining $500 budget on a party to bring people back. How do you analyze this situation?",
    options: [
      {
        label: "A",
        text: "Approve the budget allocation immediately since social events are universally popular with students.",
      },
      {
        label: "B",
        text: "Survey past members regarding their scheduling conflicts and disinterest before spending funds.",
      },
      {
        label: "C",
        text: "Suggest doubling the party budget by taking out a temporary personal loan from club members.",
      },
      {
        label: "D",
        text: "Reject the party proposal outright and freeze all club spending until the next academic semester.",
      },
    ],
    correctAnswer: "B",
  },
  {
    questionNumber: 4,
    dimension: "Analytical Thinking",
    title: "Handling Unfamiliar Internship Data",
    questionText:
      "On day one of your internship, your manager gives you a spreadsheet containing 5,000 rows of user metrics and asks you to locate where user retention drops. You have never seen this data layout before. What do you do?",
    options: [
      {
        label: "A",
        text: "Request a different assignment that aligns better with software tools you already master.",
      },
      {
        label: "B",
        text: "Scan the column headers to map out data relationships before sorting by key user timelines.",
      },
      {
        label: "C",
        text: "Guess which columns look important and build a summary report based on those assumptions.",
      },
      {
        label: "D",
        text: "Ask your supervisor to walk you through the spreadsheet row-by-row during your lunch break.",
      },
    ],
    correctAnswer: "B",
  },
  {
    questionNumber: 5,
    dimension: "Analytical Thinking",
    title: "Managing Limited Time Resource",
    questionText:
      "You have three final exams and a major research portfolio due during the exact same week. You calculate that you lack the hours to give 100% effort to every assignment. What is your analytical solution?",
    options: [
      {
        label: "A",
        text: "Divide your total available study hours mathematically equal across all four grading areas.",
      },
      {
        label: "B",
        text: "Weight your study time based on assignment grading impacts and your current class standings.",
      },
      {
        label: "C",
        text: "Focus exclusively on your two hardest classes and accept whatever grades you get in the others.",
      },
      {
        label: "D",
        text: "Request emergency medical extensions for all four deadlines to buy yourself another week.",
      },
    ],
    correctAnswer: "B",
  },
  {
    questionNumber: 6,
    dimension: "Resilience, Flexibility, and Agility",
    title: "Managing a Ghosting Teammate",
    questionText:
      "It is 48 hours before a major presentation worth 30% of your grade. Your teammate, who owns the data analysis slides, suddenly stops responding to all texts and emails. How do you adapt?",
    options: [
      {
        label: "A",
        text: "Email the professor detailing the teammate's behavior and ask to postpone your presentation day.",
      },
      {
        label: "B",
        text: "Re-calculate the basic data metrics with remaining members and adjust the slides immediately.",
      },
      {
        label: "C",
        text: "Wait at the teammate's campus dorm room until they appear to finish their assigned slides.",
      },
      {
        label: "D",
        text: "Present only your section of the slides and leave the data analysis portion completely blank.",
      },
    ],
    correctAnswer: "B",
  },
  {
    questionNumber: 7,
    dimension: "Resilience, Flexibility, and Agility",
    title: "Adapting to Sudden Syllabus Shifts",
    questionText:
      "Midway through the term, your professor announces that the final exam format is changing from an open-book essay to a timed, closed-book multiple-choice test. How do you adjust your strategy?",
    options: [
      {
        label: "A",
        text: "Form a study group focused on memorizing core definitions and practicing active recall methods.",
      },
      {
        label: "B",
        text: "Write a formal petition to the academic dean complaining about unfair mid-semester changes.",
      },
      {
        label: "C",
        text: "Continue using your original study guide since essay preparation covers all general concepts.",
      },
      {
        label: "D",
        text: "Drop the course immediately to protect your GPA from the unexpected grading format change.",
      },
    ],
    correctAnswer: "A",
  },
  {
    questionNumber: 8,
    dimension: "Resilience, Flexibility, and Agility",
    title: "Pivoting During an Internship",
    questionText:
      "You accept an internship expecting to perform creative graphic design, but corporate restructuring forces your manager to reassign you to logistics database entry. What is your response?",
    options: [
      {
        label: "A",
        text: "Complete the minimum database work required while looking for a different design firm job.",
      },
      {
        label: "B",
        text: "Focus on learning the operational logic of logistics data systems to build multi-role skills.",
      },
      {
        label: "C",
        text: "Inform your manager that database management violates the core terms of your original offer.",
      },
      {
        label: "D",
        text: "Perform the database tasks slowly so management realizes they are wasting your creative design skills.",
      },
    ],
    correctAnswer: "B",
  },
  {
    questionNumber: 9,
    dimension: "Resilience, Flexibility, and Agility",
    title: "Overcoming Academic Setbacks",
    questionText:
      "You spent three months studying for a difficult professional licensing exam, sacrificing your weekends, but discover you failed by two points. How do you handle the setback?",
    options: [
      {
        label: "A",
        text: "Assume the grading algorithm was flawed and request a manual review of your test sheets.",
      },
      {
        label: "B",
        text: "Analyze your specific score breakdown to isolate weak topics and adjust your study plan.",
      },
      {
        label: "C",
        text: "Register for the next available exam date immediately without changing your regular routine.",
      },
      {
        label: "D",
        text: "Decide that this career field does not match your natural talents and select a new major.",
      },
    ],
    correctAnswer: "B",
  },
  {
    questionNumber: 10,
    dimension: "Resilience, Flexibility, and Agility",
    title: "Handling Live Presentation Failure",
    questionText:
      "While delivering a live digital presentation to a panel of alumni judges, the campus network drops and your slides disappear from the screen. How do you handle the next minutes?",
    options: [
      {
        label: "A",
        text: "Apologize profusely to the panel and sit down until technical support restores the network.",
      },
      {
        label: "B",
        text: "Use your printed notes or memory to confidently present the core ideas without visuals.",
      },
      {
        label: "C",
        text: "Ask the judges if you can restart your presentation from the beginning later that afternoon.",
      },
      {
        label: "D",
        text: "Blame the university IT department out loud to ensure judges know it was not your fault.",
      },
    ],
    correctAnswer: "B",
  },
  {
    questionNumber: 11,
    dimension: "Leadership and Social Influence",
    title: "Activating a Silent Virtual Team",
    questionText:
      "You are assigned a virtual group project via Zoom. In your first meeting, everyone keeps their cameras off, stays muted, and types one-word answers in chat. How do you drive momentum?",
    options: [
      {
        label: "A",
        text: "Complain to the professor that your team is uncooperative and request a new group assignment.",
      },
      {
        label: "B",
        text: "Turn on your camera, share an easy icebreaker, and propose a collaborative Google Doc space.",
      },
      {
        label: "C",
        text: "Keep your camera off as well and wait for someone else to take charge of the meeting dynamics.",
      },
      {
        label: "D",
        text: "Assign specific project roles unilaterally in the chat box and end the call after five minutes.",
      },
    ],
    correctAnswer: "B",
  },
  {
    questionNumber: 12,
    dimension: "Leadership and Social Influence",
    title: "Mediating Internal Club Conflict",
    questionText:
      "Two close friends in your student organization are arguing intensely over which campus event to fund next month. The argument is stalling all club business. How do you intervene?",
    options: [
      {
        label: "A",
        text: "Vote for your closer friend's idea to end the debate quickly through majority rule dynamics.",
      },
      {
        label: "B",
        text: "Meet with both neutrally to identify shared event goals and propose a hybrid project model.",
      },
      {
        label: "C",
        text: "Step down from the club committee to avoid getting trapped in the middle of personal drama.",
      },
      {
        label: "D",
        text: "Tell both friends that their behavior is childish and threaten to cancel both events entirely.",
      },
    ],
    correctAnswer: "B",
  },
  {
    questionNumber: 13,
    dimension: "Leadership and Social Influence",
    title: "Exercising Title-less Influence",
    questionText:
      "You are on a student committee where the elected president is missing deadlines and dropping project balls. You lack an official leadership title, but the project is failing. What do you do?",
    options: [
      {
        label: "A",
        text: "Complete your specific tasks perfectly so you cannot be blamed when the final project fails.",
      },
      {
        label: "B",
        text: "Offer to manage a centralized tracking sheet to help the team coordinate upcoming deadlines.",
      },
      {
        label: "C",
        text: "Call an emergency meeting with other members to vote on impeaching the current president.",
      },
      {
        label: "D",
        text: "Secretly email the faculty advisor to report the president's operational failures directly.",
      },
    ],
    correctAnswer: "B",
  },
  {
    questionNumber: 14,
    dimension: "Leadership and Social Influence",
    title: "Pitching to Traditional Authorities",
    questionText:
      "You want your university department to fund a new student-led research lab, but the dean is traditional and dislikes spending money on unproven concepts. How do you pitch them?",
    options: [
      {
        label: "A",
        text: "Organize a loud student protest outside the dean's office to demand immediate project funding.",
      },
      {
        label: "B",
        text: "Present data showing how the lab improves student job placement rates and matches university goals.",
      },
      {
        label: "C",
        text: "Send a long email explaining how outdated the department looks compared to rival universities.",
      },
      {
        label: "D",
        text: "Ask your parents to call the university administration to advocate for the research lab space.",
      },
    ],
    correctAnswer: "B",
  },
  {
    questionNumber: 15,
    dimension: "Leadership and Social Influence",
    title: "Integrating Margin Voices",
    questionText:
      "Your engineering project group includes an international student who speaks English as a second language. Louder teammates keep talking over them. How do you exercise leadership?",
    options: [
      {
        label: "A",
        text: "Offer to rewrite the international student's written sections yourself to save group meeting time.",
      },
      {
        label: "B",
        text: "Direct specific technical questions to the student during meetings and create space for them.",
      },
      {
        label: "C",
        text: "Advise the international student to speak faster so they can fit into the group conversation.",
      },
      {
        label: "D",
        text: "Let the group dynamic play out naturally since project timelines require rapid conversations.",
      },
    ],
    correctAnswer: "B",
  },
  {
    questionNumber: 16,
    dimension: "Creative Thinking",
    title: "Zero-Budget Marketing Challenge",
    questionText:
      "Your student theater group must sell 200 tickets to a performance in one week, but your promotion budget is exactly $0. What is your creative approach?",
    options: [
      {
        label: "A",
        text: "Ask the club members to purchase the remaining tickets themselves to prevent empty theater seats.",
      },
      {
        label: "B",
        text: "Coordinate a viral flash-mob performance in the dining hall linked to a ticket giveaway QR code.",
      },
      {
        label: "C",
        text: "Print standard black-and-white flyers using your personal campus printing credits around dorms.",
      },
      {
        label: "D",
        text: "Email the student body asking them to buy tickets out of charity to support campus theater arts.",
      },
    ],
    correctAnswer: "B",
  },
  {
    questionNumber: 17,
    dimension: "Creative Thinking",
    title: "Substituting Scarce Project Materials",
    questionText:
      "For a design competition, the precise plastic polymer required for your team's prototype is sold out across the region. The submission deadline is in three days. How do you respond?",
    options: [
      {
        label: "A",
        text: "Submit a theoretical blue-print drawing and request a scoring exemption for the physical model.",
      },
      {
        label: "B",
        text: "Test common household materials with similar weight and flexibility properties to fit the frame.",
      },
      {
        label: "C",
        text: "Withdraw from the competition because your prototype cannot match original design parameters.",
      },
      {
        label: "D",
        text: "Order the correct polymer online and accept the late point penalties for missing the deadline.",
      },
    ],
    correctAnswer: "B",
  },
  {
    questionNumber: 18,
    dimension: "Creative Thinking",
    title: "Re-imagining Dry Academic Topics",
    questionText:
      'You must give a presentation on "19th-Century Maritime Trade Routes," and the grading rubric scores creativity heavily. How do you structure your presentation?',
    options: [
      {
        label: "A",
        text: "Read directly from primary historical journals using an analytical, academic speaking tone.",
      },
      {
        label: "B",
        text: "Roleplay as a cargo ship captain balancing resources, using interactive audience voting choices.",
      },
      {
        label: "C",
        text: "Build a clean slideshow using a standard academic template with clear chronological timelines.",
      },
      {
        label: "D",
        text: "Keep the presentation short to ensure you do not bore the grading panel with dry data points.",
      },
    ],
    correctAnswer: "B",
  },
  {
    questionNumber: 19,
    dimension: "Creative Thinking",
    title: "Breaking Through Analytical Dead Ends",
    questionText:
      "You are analyzing a business case study, but the standard financial formulas everyone else is using keep leading to a dead end due to missing data. What do you do?",
    options: [
      {
        label: "A",
        text: "Leave the missing data section blank and explain the formula limits in your final footnote.",
      },
      {
        label: "B",
        text: "Look at consumer behavioral trends from similar industries to infer alternative growth paths.",
      },
      {
        label: "C",
        text: "Copy the financial assumptions made by other groups to ensure your data matches theirs.",
      },
      {
        label: "D",
        text: "Ask the professor to provide the missing numbers so you can finish the assigned formula calculations.",
      },
    ],
    correctAnswer: "B",
  },
  {
    questionNumber: 20,
    dimension: "Creative Thinking",
    title: "Solving Structural Campus Issues",
    questionText:
      "Your campus faces a severe student parking shortage. If tasked with proposing a brand-new concept to address this daily frustration, which path do you pitch?",
    options: [
      {
        label: "A",
        text: "Build a massive multi-level concrete parking garage on the current central green space.",
      },
      {
        label: "B",
        text: "Design a gamified peer-to-peer carpooling app that rewards students who share rides to campus.",
      },
      {
        label: "C",
        text: "Increase the cost of student parking passes until half the student body stops driving cars.",
      },
      {
        label: "D",
        text: "Change all campus class schedules to night blocks to distribute traffic across more hours.",
      },
    ],
    correctAnswer: "B",
  },
  {
    questionNumber: 21,
    dimension: "Motivation and Self-Awareness",
    title: "Managing Severe Academic Burnout",
    questionText:
      "It is late November, and you are balancing 15 credits, a part-time job, and upcoming final exams. You wake up feeling completely drained of motivation. How do you handle your energy?",
    options: [
      {
        label: "A",
        text: "Drink extra caffeinated beverages and push through your routine without changing any habits.",
      },
      {
        label: "B",
        text: "Assess your critical deadliness, cut low-value activities, and schedule fixed recovery blocks.",
      },
      {
        label: "C",
        text: "Call in sick to your part-time job and skip all your classes for the next week to sleep.",
      },
      {
        label: "D",
        text: "Drop your hardest course to immediately lighten your academic workload for the final month.",
      },
    ],
    correctAnswer: "B",
  },
  {
    questionNumber: 22,
    dimension: "Motivation and Self-Awareness",
    title: "Processing Critical Academic Feedback",
    questionText:
      "You turn in a research paper you worked incredibly hard on, but your professor returns it with a C- grade and heavy criticisms. Your initial reaction is frustration. What do you do?",
    options: [
      {
        label: "A",
        text: "Avoid looking at the paper comments and focus on earning better grades on future assignments.",
      },
      {
        label: "B",
        text: "Separate your self-worth from the grade and book office hours to review your logical flaws.",
      },
      {
        label: "C",
        text: "Write an email to the professor explaining how much time you spent writing that specific paper.",
      },
      {
        label: "D",
        text: "File a formal grade appeal with the department head claiming biased evaluation metrics.",
      },
    ],
    correctAnswer: "B",
  },
  {
    questionNumber: 23,
    dimension: "Motivation and Self-Awareness",
    title: "Navigating Asynchronous Environments",
    questionText:
      "You enroll in an online course with no live lectures and only one major portfolio due at the end of 16 weeks. How do you maintain motivation without external reminders?",
    options: [
      {
        label: "A",
        text: "Trust that your natural study habits will allow you to complete the work during the final week.",
      },
      {
        label: "B",
        text: "Create self-imposed weekly micro-deadlines and track your learning progress in a journal.",
      },
      {
        label: "C",
        text: "Wait for the professor to post announcement updates before working on portfolio components.",
      },
      {
        label: "D",
        text: "Review the course syllabus once a month to check if any deadline dates have been changed.",
      },
    ],
    correctAnswer: "B",
  },
  {
    questionNumber: 24,
    dimension: "Motivation and Self-Awareness",
    title: "Correcting Uncomfortable Interpersonal Blind Spots",
    questionText:
      "During peer reviews, two classmates note that while your work is excellent, you dominate conversations and do not let others speak. How do you address this?",
    options: [
      {
        label: "A",
        text: "Assume those teammates are simply too timid to share their own opinions during group work.",
      },
      {
        label: "B",
        text: "Actively track your speaking time in the next meeting and ask quieter members for input first.",
      },
      {
        label: "C",
        text: "Stop sharing ideas completely during upcoming group meetings to let others take over formatting.",
      },
      {
        label: "D",
        text: "Explain to the team that your communication style is driven by a passion for project success.",
      },
    ],
    correctAnswer: "B",
  },
  {
    questionNumber: 25,
    dimension: "Motivation and Self-Awareness",
    title: "Aligning Career Choices with Personal Values",
    questionText:
      "Your family is pressuring you to enter a lucrative finance track, but your self-awareness tells you that your genuine strengths and mental health thrive in creative education fields. What do you do?",
    options: [
      {
        label: "A",
        text: "Follow the finance track anyway to ensure financial stability and please family expectations.",
      },
      {
        label: "B",
        text: "Schedule a career counseling session to build a data-backed plan matching your genuine strengths.",
      },
      {
        label: "C",
        text: "Change your major secretly without telling your family until graduation day arrives.",
      },
      {
        label: "D",
        text: "Refuse to discuss career planning with your family to avoid further interpersonal conflicts.",
      },
    ],
    correctAnswer: "B",
  },
  {
    questionNumber: 26,
    dimension: "Technological Literacy",
    title: "Rapidly Learning New Project Platforms",
    questionText:
      "You join a campus club that manages all its projects through Slack, Notion, and Figma—platforms you have never opened before. What is your onboarding strategy?",
    options: [
      {
        label: "A",
        text: "Ask your club members to send you updates via standard text messages instead of the apps.",
      },
      {
        label: "B",
        text: "Spend a weekend practicing with basic software templates and watching feature tutorials online.",
      },
      {
        label: "C",
        text: "Learn the tools slowly on the job only when someone directly tags you in a specific task thread.",
      },
      {
        label: "D",
        text: "Request that the club switches back to standard emails so everyone can communicate equally.",
      },
    ],
    correctAnswer: "B",
  },
  {
    questionNumber: 27,
    dimension: "Technological Literacy",
    title: "Migrating to Specialized Analytics Tools",
    questionText:
      "Your professor requests that you stop using basic Excel charts and migrate your research data into a complex statistical tool like R or SPSS by next week. How do you adapt?",
    options: [
      {
        label: "A",
        text: "Import your data into the new platform and use basic automated charts without checking settings.",
      },
      {
        label: "B",
        text: "Learn syntax structures using university library guides and run sample test files first.",
      },
      {
        label: "C",
        text: "Ask a computer science student to perform the data migration for you to save project time.",
      },
      {
        label: "D",
        text: "Tell your professor that Excel provides identical graphical outputs for this research scope.",
      },
    ],
    correctAnswer: "B",
  },
  {
    questionNumber: 28,
    dimension: "Technological Literacy",
    title: "Verifying Digital Research Credibility",
    questionText:
      "While researching a paper, you find a viral thread on social media containing charts that perfectly support your thesis statement, but the author is anonymous. How do you handle it?",
    options: [
      {
        label: "A",
        text: "Cite the social media thread directly since the data graphics look highly accurate and clean.",
      },
      {
        label: "B",
        text: "Trace the data metrics back to verified peer-reviewed studies before using them in your paper.",
      },
      {
        label: "C",
        text: "Use the data graphics but include a disclaimer stating the source was found on social media.",
      },
      {
        label: "D",
        text: "Omit the data completely because information found on social media is always fabricated.",
      },
    ],
    correctAnswer: "B",
  },
  {
    questionNumber: 29,
    dimension: "Technological Literacy",
    title: "Streamlining Fragmented Group Tech Stack",
    questionText:
      "Your project group is missing messages because members are using four different apps (WhatsApp, Discord, Email, and Google Doc comments) simultaneously. What is your solution?",
    options: [
      {
        label: "A",
        text: "Monitor all four platforms continuously throughout the day so you do not miss any details.",
      },
      {
        label: "B",
        text: "Propose a single primary channel for communication and establish clear document protocols.",
      },
      {
        label: "C",
        text: "Stop responding to platforms you dislike to force the group onto your favorite chat app.",
      },
      {
        label: "D",
        text: "Let the communication handle itself since everyone has different digital app preferences.",
      },
    ],
    correctAnswer: "B",
  },
  {
    questionNumber: 30,
    dimension: "Technological Literacy",
    title: "Identifying Campus Phishing Strategies",
    questionText:
      "You receive an email on your student account that looks exactly like a university financial aid notification, asking you to click a link to verify your password. What is your action?",
    options: [
      {
        label: "A",
        text: "Click the link quickly to ensure your upcoming tuition scholarship checks are not delayed.",
      },
      {
        label: "B",
        text: "Inspect the sender domain string and verify the link validity directly with the financial office.",
      },
      {
        label: "C",
        text: "Forward the email to all your classmates to warn them that their funding might be frozen.",
      },
      {
        label: "D",
        text: "Delete the email immediately and ignore any future notifications regarding financial accounts.",
      },
    ],
    correctAnswer: "B",
  },
  {
    questionNumber: 31,
    dimension: "Empathy and Active Listening",
    title: "Responding to a Stressed Teammate",
    questionText:
      "During a tense group meeting, a classmate breaks down into tears, stating that personal crises are preventing them from completing their project work. What is your response?",
    options: [
      {
        label: "A",
        text: "Offer to divide their assigned tasks among remaining members and advise them to seek counseling.",
      },
      {
        label: "B",
        text: "Remind them that the final project deadline is fixed and ask when they can finish the work.",
      },
      {
        label: "C",
        text: "Report their incomplete work to the professor immediately to protect your group project grade.",
      },
      {
        label: "D",
        text: "Tell them a personal story about a time you felt stressed to show them that everyone struggles.",
      },
    ],
    correctAnswer: "A",
  },
  {
    questionNumber: 32,
    dimension: "Empathy and Active Listening",
    title: "De-escalating an Angry Customer Interaction",
    questionText:
      "At your part-time campus bookstore job, a student starts yelling at you over a textbook refund mistake made by a completely different employee yesterday. How do you handle it?",
    options: [
      {
        label: "A",
        text: "Inform the customer that you did not work yesterday and tell them to find the correct manager.",
      },
      {
        label: "B",
        text: "Validate their frustration calmly, repeat their core issue back to them, and find a solution path.",
      },
      {
        label: "C",
        text: "Defend your fellow employee's actions out loud to ensure the customer respects bookstore rules.",
      },
      {
        label: "D",
        text: "Wait silently without speaking until the customer stops shouting and walks away from the desk.",
      },
    ],
    correctAnswer: "B",
  },
  {
    questionNumber: 33,
    dimension: "Empathy and Active Listening",
    title: "Navigating Hostile Classroom Debates",
    questionText:
      "During a heated political class debate, a peer shares a perspective that directly challenges your core personal beliefs. How do you formulate your response?",
    options: [
      {
        label: "A",
        text: "Formulate your counter-argument silently while they speak so you can refute them immediately.",
      },
      {
        label: "B",
        text: "Listen completely, summarize their underlying premise to show understanding, then present your data.",
      },
      {
        label: "C",
        text: "Interrupt their statement midway through to correct factual errors before they finish speaking.",
      },
      {
        label: "D",
        text: "Shake your head visibly to signal to the rest of the class that their logic is completely invalid.",
      },
    ],
    correctAnswer: "B",
  },
  {
    questionNumber: 34,
    dimension: "Empathy and Active Listening",
    title: "Creating Space for Introverted Members",
    questionText:
      "You notice an introverted teammate has great ideas but remains quiet because an aggressive member constantly interrupts them during project debates. What do you do?",
    options: [
      {
        label: "A",
        text: "Speak with the introverted teammate after the meeting and write down their ideas for the slides.",
      },
      {
        label: "B",
        text: 'Intervene during the next interruption by saying, "Let\'s pause and hear the rest of what they were saying."',
      },
      {
        label: "C",
        text: "Leave the dynamic alone since learning to speak up over others is an essential career skill.",
      },
      {
        label: "D",
        text: "Tell the aggressive member during the meeting that they are ruining the group collaboration.",
      },
    ],
    correctAnswer: "B",
  },
  {
    questionNumber: 35,
    dimension: "Empathy and Active Listening",
    title: "Overcoming Language Barriers in Teams",
    questionText:
      "Your lab group includes an international student struggling to explain a technical concept due to language barriers. Other group members are acting visibly impatient. How do you act?",
    options: [
      {
        label: "A",
        text: "Tell the student to write their ideas down in a text translator so the group can read it later.",
      },
      {
        label: "B",
        text: "Listen patiently, use simple phrasing to confirm understanding, and map their ideas on a whiteboard.",
      },
      {
        label: "C",
        text: "Take over their section of the lab experiment to ensure the group finishes before the class ends.",
      },
      {
        label: "D",
        text: "Encourage the impatient members to take a break while the international student finishes speaking.",
      },
    ],
    correctAnswer: "B",
  },
  {
    questionNumber: 36,
    dimension: "Curiosity and Lifelong Learning",
    title: "Adapting to Obsolete Technical Skills",
    questionText:
      "You spent two terms mastering a specific video editing tool, but the industry standard suddenly shifts to a brand-new AI-driven software platform. What is your mindset?",
    options: [
      {
        label: "A",
        text: "Continue using the old software since your deep technical mastery still yields great results.",
      },
      {
        label: "B",
        text: "Explore the new platform's operational logic to see how it can enhance your current workflow.",
      },
      {
        label: "C",
        text: "Complain on professional forums that automated software tools are destroying creative industries.",
      },
      {
        label: "D",
        text: "Wait a year to see if the new software trend fades away before spending time learning it.",
      },
    ],
    correctAnswer: "B",
  },
  {
    questionNumber: 37,
    dimension: "Curiosity and Lifelong Learning",
    title: "Choosing Elective Course Pathways",
    questionText:
      "You have exactly one open elective slot left in your senior year schedule. How do you choose which course to take?",
    options: [
      {
        label: "A",
        text: "Select a highly rated course directly within your major to ensure a straightforward GPA boost.",
      },
      {
        label: "B",
        text: "Register for a challenging introductory programming or philosophy course outside your main major.",
      },
      {
        label: "C",
        text: "Pick an online course known for minimal assignments so you can focus on your weekend social life.",
      },
      {
        label: "D",
        text: "Ask your closest friend what they are taking so you can sit together and share textbook costs.",
      },
    ],
    correctAnswer: "B",
  },
  {
    questionNumber: 38,
    dimension: "Curiosity and Lifelong Learning",
    title: "Preparing for Unfamiliar Industries",
    questionText:
      "You land an interview for a dream internship at a green logistics firm, but you know absolutely nothing about sustainable supply chain networks. How do you prepare?",
    options: [
      {
        label: "A",
        text: "Focus the interview conversations entirely on your general business skills and work ethic metrics.",
      },
      {
        label: "B",
        text: "Read industry white papers, track recent corporate green initiatives, and note unanswered questions.",
      },
      {
        label: "C",
        text: "Trust that the company onboarding process will teach you everything you need to know later on.",
      },
      {
        label: "D",
        text: "Ask the interviewer during the first minutes to explain the basic concepts of green logistics.",
      },
    ],
    correctAnswer: "B",
  },
  {
    questionNumber: 39,
    dimension: "Curiosity and Lifelong Learning",
    title: "Pursuing Non-Tested Lecture Concepts",
    questionText:
      "During a biology lecture, your professor mentions a cutting-edge genetic therapy concept but notes it will not appear on any exam or quiz. What do you do?",
    options: [
      {
        label: "A",
        text: "Stop taking notes for that section of the lecture and rest your mind until the next topic starts.",
      },
      {
        label: "B",
        text: "Search for recent scientific review articles on that therapy to read during your weekend free time.",
      },
      {
        label: "C",
        text: "Ask the professor after class if knowing that concept can earn you extra credit points on finals.",
      },
      {
        label: "D",
        text: "Assume the concept is unimportant for your career path since it is excluded from the syllabus.",
      },
    ],
    correctAnswer: "B",
  },
  {
    questionNumber: 40,
    dimension: "Curiosity and Lifelong Learning",
    title: "Engaging with Boring Requirements",
    questionText:
      "You are required to take a mandatory general education course in art history that feels completely irrelevant to your future finance career. How do you approach learning?",
    options: [
      {
        label: "A",
        text: "Spend the lecture hours working on your finance assignments while sitting in the back row.",
      },
      {
        label: "B",
        text: "Look for historical connections between art movements and major economic shifts of those eras.",
      },
      {
        label: "C",
        text: "Memorize the minimum flashcard definitions required to secure a passing grade in the class.",
      },
      {
        label: "D",
        text: "Ask the academic advisor if there is any loophole path to waive the art history requirement.",
      },
    ],
    correctAnswer: "B",
  },
  {
    questionNumber: 41,
    dimension: "Talent Management",
    title: "Re-engaging an Underperforming Star",
    questionText:
      "A member of your student organization who used to be a highly creative top performer has suddenly started missing deadlines and skipped two consecutive meetings. How do you act?",
    options: [
      {
        label: "A",
        text: "Assign their key responsibilities to a newer member to keep the organization moving forward.",
      },
      {
        label: "B",
        text: "Check in privately to listen to their current challenges and co-create a manageable workload.",
      },
      {
        label: "C",
        text: "Inform them that their recent performance is unacceptable and cite the club's attendance rules.",
      },
      {
        label: "D",
        text: "Ignore the drop in performance hoping it is just a temporary phase that will resolve itself.",
      },
    ],
    correctAnswer: "B",
  },
  {
    questionNumber: 42,
    dimension: "Talent Management",
    title: "Optimizing Team Role Distribution",
    questionText:
      "You are chosen to lead a five-person team for an intense business case competition. How do you divide the project roles?",
    options: [
      {
        label: "A",
        text: "Draw names out of a hat randomly to ensure absolute fairness and objectivity across the team.",
      },
      {
        label: "B",
        text: "Interview members regarding their unique skills and align roles with their individual growth goals.",
      },
      {
        label: "C",
        text: "Take on all the high-scoring analytical roles yourself and delegate formatting tasks to the rest.",
      },
      {
        label: "D",
        text: "Divide the case study pages equally so every single person reads and writes the exact same amount.",
      },
    ],
    correctAnswer: "B",
  },
  {
    questionNumber: 43,
    dimension: "Talent Management",
    title: "Mentoring a Frustrated First-Year Student",
    questionText:
      "A first-year student in your campus club tells you they feel overwhelmed by college workloads and are considering quitting the organization completely. What do you do?",
    options: [
      {
        label: "A",
        text: "Agree that quitting is smart since protecting an academic GPA must always be a student's top priority.",
      },
      {
        label: "B",
        text: "Share time-management frameworks you used as a freshman and help them balance their commitments.",
      },
      {
        label: "C",
        text: "Tell them that every college student goes through this phase and they just need to toughen up.",
      },
      {
        label: "D",
        text: "Offer to complete their club duties for the next month so they do not have to worry about them.",
      },
    ],
    correctAnswer: "B",
  },
  {
    questionNumber: 44,
    dimension: "Talent Management",
    title: "Delivering Heavy Constructive Criticism",
    questionText:
      "A peer asks you to critique their resume before a career fair. The document contains messy formatting, grammar errors, and weak action descriptions. How do you give feedback?",
    options: [
      {
        label: "A",
        text: "Highlight the formatting issues but tell them the content looks fine to preserve their confidence.",
      },
      {
        label: "B",
        text: "Explain how recruiters read resumes, highlight the clear layout flaws, and help rephrase descriptions.",
      },
      {
        label: "C",
        text: "Rewrite the entire resume for them using your personal template because it is faster than explaining.",
      },
      {
        label: "D",
        text: "Tell them honestly that their resume will get rejected immediately if they submit it in this state.",
      },
    ],
    correctAnswer: "B",
  },
  {
    questionNumber: 45,
    dimension: "Talent Management",
    title: "Succession Planning for Graduation",
    questionText:
      "You are graduating this term and must hand over the presidency of your student organization to a younger member. How do you handle your final semester?",
    options: [
      {
        label: "A",
        text: "Run the club normally until your final day, then hand over the digital account keys via email.",
      },
      {
        label: "B",
        text: "Shadow the chosen successor during club operations and delegate key meeting choices to them gradually.",
      },
      {
        label: "C",
        text: "Make all major club decisions for the next academic year before you leave to guarantee success.",
      },
      {
        label: "D",
        text: "Step back from all club tasks immediately to force the younger members to learn by failing.",
      },
    ],
    correctAnswer: "B",
  },
  {
    questionNumber: 46,
    dimension: "Service Orientation and Customer Service",
    title: "Anticipating Unexpressed Event Needs",
    questionText:
      "You are organizing a campus charity 5K run. Beyond basic registration tables and track marking, what is your primary user-experience focus area?",
    options: [
      {
        label: "A",
        text: "Focus entirely on marketing the event online to secure the maximum number of registered runners.",
      },
      {
        label: "B",
        text: "Map out attendee pathways to place water stations, medical tents, and clear signs before complaints occur.",
      },
      {
        label: "C",
        text: "Order extra premium t-shirts so participants have a high-value souvenir to take home with them.",
      },
      {
        label: "D",
        text: "Keep the entry fees as low as possible so that cost is not a barrier for any student runner.",
      },
    ],
    correctAnswer: "B",
  },
  {
    questionNumber: 47,
    dimension: "Service Orientation and Customer Service",
    title: "Going the Extra Mile in Libraries",
    questionText:
      "You work at the campus library desk. A frantic student cannot find a rare book needed for a paper due in two hours. The computer says it is checked out. How do you respond?",
    options: [
      {
        label: "A",
        text: "Inform them that the system shows it is checked out and advise them to search digital databases instead.",
      },
      {
        label: "B",
        text: "Search neighboring university networks for digital versions and contact local archives for scans.",
      },
      {
        label: "C",
        text: "Tell them you can place a hold request on the book so they receive it when it gets returned next week.",
      },
      {
        label: "D",
        text: "Search the physical library return carts manually in case it was misplaced by staff earlier that day.",
      },
    ],
    correctAnswer: "D",
  },
  {
    questionNumber: 48,
    dimension: "Service Orientation and Customer Service",
    title: "Simplifying Complex Technical Assistance",
    questionText:
      "A non-technical professor approaches the campus IT help desk angry because their online grading portal keeps locking them out. How do you deliver service?",
    options: [
      {
        label: "A",
        text: "Show them the official IT system handbook detailing security protocols and automated timeout rules.",
      },
      {
        label: "B",
        text: "Resolve the technical lockout calmly, explain the security step simply, and verify their access live.",
      },
      {
        label: "C",
        text: "Tell the professor that password lockouts are automated and they must wait 24 hours to retry.",
      },
      {
        label: "D",
        text: "Take their login details and input the grades for them to ensure they do not get locked out again.",
      },
    ],
    correctAnswer: "B",
  },
  {
    questionNumber: 49,
    dimension: "Service Orientation and Customer Service",
    title: "Balancing Policies with Human Care",
    questionText:
      'You work the gym desk. A student forgets their university ID card for the third time this week, begging to enter. Corporate policy states "No ID, No Entry." What do you do?',
    options: [
      {
        label: "A",
        text: "Enforce the policy strictly and turn them away to ensure they finally learn to bring their card.",
      },
      {
        label: "B",
        text: "Look up their student profile manually to confirm active status, then log them in with a warning.",
      },
      {
        label: "C",
        text: "Let them through the gate secretly since you know they are an honest student who exercises daily.",
      },
      {
        label: "D",
        text: "Call campus security to report a student attempting to enter university facilities without validation.",
      },
    ],
    correctAnswer: "B",
  },
  {
    questionNumber: 50,
    dimension: "Service Orientation and Customer Service",
    title: "Designing a Stress-Free Onboarding Experience",
    questionText:
      "You are tasked with planning the check-in layout for incoming freshmen orientation week. What is your design strategy?",
    options: [
      {
        label: "A",
        text: "Set up one central desk where students can collect all their orientation packets at the same time.",
      },
      {
        label: "B",
        text: "Sequence clear, low-wait stations with student mentors greeting families to ease moving anxieties.",
      },
      {
        label: "C",
        text: "Mail all orientation materials to students' home addresses to eliminate the need for check-in lines.",
      },
      {
        label: "D",
        text: "Allow students to check in digitally on their phones so you do not have to staff physical tables.",
      },
    ],
    correctAnswer: "B",
  },
];
