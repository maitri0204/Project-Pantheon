# Adversity Quotient (AQ) Assessment Integration

This document describes the complete integration of the Adversity Quotient (AQ) assessment into Project Pantheon.

## Overview

The Adversity Quotient Assessment measures an individual's resilience and ability to handle adversity. It evaluates four key dimensions:

- **Control**: Ability to influence outcomes when facing challenges
- **Ownership**: Taking responsibility and accountability
- **Reach**: Limiting the scope of setbacks to specific areas
- **Endurance**: Believing difficulties are temporary and manageable

Plus a **Reflection** dimension for meta-awareness of resilience strategies.

## Assessment Details

- **Code**: `ADVERSITY_TEST`
- **Slug**: `adversity-test`
- **Total Questions**: 30
- **Duration**: 30 minutes (configurable)
- **Base Price**: ₹799 INR
- **Categories**: ["adversity", "resilience", "aq", "student"]

## Scoring System

### Dimension Scoring

Each dimension has a maximum score based on the number of questions:

- **Control**: Max 24 points (6 questions × 4 points max)
- **Ownership**: Max 20 points (5 questions × 4 points max)
- **Reach**: Max 28 points (7 questions × 4 points max)
- **Endurance**: Max 28 points (7 questions × 4 points max)
- **Reflection**: Max 20 points (5 questions × 4 points max)
- **Total**: Max 100 points (30 questions)

Each question has 4 options with hidden scores:
- Option A: 4 points
- Option B: 3 points
- Option C: 2 points
- Option D: 1 point

### AQ Level Classification

- **Exceptional** (≥80): Outstanding resilience and adversity handling
- **Strong** (≥65): Good resilience with effective coping strategies
- **Moderate** (≥50): Adequate resilience with room for improvement
- **Developing** (<50): Early-stage resilience development needed

## Architecture

### Backend Components

#### 1. Question Seeding (`backend/src/scripts/seedAdversityQuestions.ts`)
- Contains 30 AQ questions distributed across 5 dimensions
- Each question has options with mapped scoring
- Auto-imported during platform bootstrap

#### 2. Seeding Script (`backend/src/scripts/seedAdversityQuestionsScript.ts`)
- Standalone script to seed questions into MongoDB
- Clears existing questions before inserting new ones
- Provides dimension count verification

```bash
npx ts-node backend/src/scripts/seedAdversityQuestionsScript.ts
```

#### 3. AQ Scoring Service (`backend/src/services/aqScoring.service.ts`)
- `evaluateAQAnswers(attempt)`: Evaluates attempt and returns comprehensive scoring
- `classifyAQLevel(totalScore)`: Maps score to AQ level
- `getDimensionInterpretation(dimension, percentage)`: Returns interpretation text
- Auto-initializes dimension and scoring maps from DB

**Key Exports**:
```typescript
export async function evaluateAQAnswers(attempt: IStudentAssessmentAttempt): Promise<AQEvaluationResult>
export function classifyAQLevel(totalScore: number): string
export function getDimensionInterpretation(dimension: string, percentage: number): string
export function getAQLevelDescription(level: string): string
```

#### 4. Report Generation (`backend/src/lib/generateAQReport.ts`)
- `generateAQReportData()`: Creates structured report object
- `generateRecommendations()`: Personalized recommendations based on scores
- `formatAQReportAsHTML()`: HTML-formatted report for email
- Returns comprehensive AQReportData with strengths and growth areas

#### 5. Email Service (`backend/src/services/email.ts`)
- `sendAQReportEmail()`: Sends AQ report via email
- Includes AQ score, level, and HTML-formatted breakdown
- Triggered after assessment completion

#### 6. Bootstrap Integration (`backend/src/services/bootstrap.ts`)
- Automatically seeds AQ questions on platform startup
- Checks if questions already exist before seeding
- Part of platform initialization process

### Frontend Components

#### 1. Assessment Component (`frontend/src/components/assessment/AdversityQuotientAssessment.tsx`)

A complete test-taking interface with:

**TestInterface**:
- Question display with 4 option choices (A-D)
- Real-time answer saving
- Auto-advance to next question
- 30-minute countdown timer
- Progress bar showing completion percentage

**ResultCard**:
- AQ score display with color-coded level
- Dimension breakdown with subscales
- Percentage-based progress bars for each dimension
- Key insights and recommendations
- Print report functionality
- Return to assessments button

**Features**:
- Responsive design (mobile, tablet, desktop)
- Auto-submit on timer expiration
- Answer validation before submission
- Loading and error states
- Graceful degradation for missing data

### Integration Points

#### 1. Assessment Evaluation (`backend/src/services/assessmentEvaluation.ts`)
Added ADVERSITY_TEST case to `evaluateAssessmentAttempt()`:
```typescript
case "ADVERSITY_TEST":
  return evaluateAQAnswers(attempt);
```

#### 2. Coupon System
- ADVERSITY_TEST can be added to `applicableAssessmentCodes` array in Coupon model
- Pricing applies per assessment basis
- Existing coupon infrastructure supports AQ assessment

#### 3. Payment Integration
- Base price: ₹799 (before coupon/GST)
- Razorpay order creation supports ADVERSITY_TEST code
- Invoice generation includes AQ assessment
- Payment verification flow intact

## Data Flow

### Test Taking Flow

1. **Start Assessment**
   - User navigates to AQ assessment page
   - Frontend creates StudentAssessmentAttempt via POST `/api/student/assessments`
   - Backend initializes attempt with 30 empty questions

2. **Question Answering**
   - User answers question
   - Frontend sends PATCH `/api/student/assessments/{attemptId}` with answer
   - Backend validates and saves answer
   - Frontend auto-advances to next question

3. **Submission**
   - User submits after all questions answered
   - Frontend sends POST `/api/student/assessments/{attemptId}/submit`
   - Backend triggers evaluation:
     - `evaluateAQAnswers()` calculates subscale scores
     - Returns AQEvaluationResult with totalScore, aqLevel, subscales
   - Frontend displays ResultCard with detailed breakdown
   - Backend sends AQ report via `sendAQReportEmail()`

### Database Schema

**Question Document**:
```typescript
{
  assessmentCode: "ADVERSITY_TEST",
  category: "Control|Ownership|Reach|Endurance|Reflection",
  categoryLabel: "Control", // For display
  questionNumber: 1,
  title: "Work Challenge",
  questionText: "When facing a difficult project deadline, I:",
  options: [
    { label: "A", text: "Take charge...", score: 4 },
    { label: "B", text: "Try to manage...", score: 3 },
    { label: "C", text: "Hope my supervisor...", score: 2 },
    { label: "D", text: "Feel overwhelmed...", score: 1 }
  ]
}
```

**StudentAssessmentAttempt Document**:
```typescript
{
  assessmentCode: "ADVERSITY_TEST",
  assessmentName: "Adversity Quotient (AQ) Assessment",
  user: ObjectId,
  status: "IN_PROGRESS|COMPLETED",
  questions: [
    { questionNumber: 1, selectedOption: "A" },
    // ...
  ],
  answeredCount: 15,
  totalQuestions: 30,
  evaluation: {
    totalScore: 72,
    aqLevel: "Strong",
    subscales: [
      {
        dimension: "Control",
        rawScore: 18,
        maxScore: 24,
        percentage: 75,
        interpretation: "..."
      },
      // ...
    ]
  },
  startedAt: ISODate,
  completedAt: ISODate
}
```

## API Endpoints

### Student Endpoints

**POST /api/student/assessments**
- Start new assessment attempt
- Body: `{ assessmentCode: "ADVERSITY_TEST" }`
- Returns: `{ attempt: StudentAssessmentAttempt }`

**GET /api/student/assessments/{attemptId}**
- Get current attempt status
- Returns: `{ attempt: StudentAssessmentAttempt }`

**PATCH /api/student/assessments/{attemptId}**
- Save answer for a question
- Body: `{ questions: [...], answeredCount: number }`
- Returns: Updated attempt

**POST /api/student/assessments/{attemptId}/submit**
- Submit completed assessment
- Returns: `{ result: AQEvaluationResult }`

### Admin Endpoints

**GET /api/assessments/questions?assessmentCode=ADVERSITY_TEST**
- Get all AQ questions
- Returns: `{ questions: AQQuestion[] }`

**GET /api/assessments/results?assessmentCode=ADVERSITY_TEST**
- Get all AQ attempt results (admin only)
- Returns: Aggregated results

## Coupon Integration

To apply a coupon to AQ assessment:

```typescript
// Coupon document
{
  code: "AQ_DISCOUNT_10",
  discountPercentage: 10,
  applicableAssessmentCodes: ["ADVERSITY_TEST"],
  validFrom: ISODate,
  validTo: ISODate,
  maxUsageCount: 100,
  perUserLimit: 1
}
```

## Report Generation

After completion, a comprehensive HTML report is generated:

```
┌─────────────────────────────────────┐
│ Adversity Quotient Assessment       │
│ Score: 72 (Strong Resilience)       │
├─────────────────────────────────────┤
│ Dimension       Score  Level        │
│ Control         18/24  75% Strong   │
│ Ownership       15/20  75% Strong   │
│ Reach           21/28  75% Strong   │
│ Endurance       18/28  64% Moderate │
│ Reflection      15/20  75% Strong   │
├─────────────────────────────────────┤
│ Strengths:                          │
│ • Strong Control capabilities       │
│ • Good Ownership mindset            │
│                                     │
│ Areas for Growth:                   │
│ • Developing Endurance skills       │
├─────────────────────────────────────┤
│ Recommendations:                    │
│ • Practice stress management        │
│ • Develop contingency plans         │
└─────────────────────────────────────┘
```

## Testing

### Manual Testing Checklist

- [ ] Navigate to assessments page
- [ ] Start AQ assessment
- [ ] Answer all 30 questions
- [ ] Submit assessment
- [ ] View results with all dimensions displayed
- [ ] Verify AQ score calculation
- [ ] Check email contains report
- [ ] Apply coupon and verify discount
- [ ] Process payment successfully
- [ ] Verify invoice includes AQ assessment

### Command Line Testing

```bash
# Test seeding
npm run seed:aq

# Run TS tests if available
npm test -- aqScoring.service.ts

# Check database
mongosh project-pantheon
db.questions.countDocuments({ assessmentCode: "ADVERSITY_TEST" })
```

## Configuration

### Environment Variables
- `SMTP_HOST`, `SMTP_USER`, `SMTP_PASS`: Email configuration
- `MONGO_URI`: MongoDB connection string

### Assessment Settings
- Duration: 30 minutes (configured in frontend)
- Timer auto-submit: True (configured in frontend)
- Randomized questions: False (sequential order)

## Troubleshooting

### Questions Not Loading
1. Verify ADVERSITY_TEST_QUESTIONS are seeded in database:
   ```bash
   db.questions.countDocuments({ assessmentCode: "ADVERSITY_TEST" })
   ```
2. Check Question model has correct indices

### Evaluation Failing
1. Verify all 30 questions in attempt
2. Check answer format matches question options (A-D)
3. Verify aqScoring.service imports are correct

### Email Not Sending
1. Check SMTP environment variables
2. Verify email service has `sendAQReportEmail` export
3. Check logs for email errors

### Frontend Component Not Rendering
1. Verify AdversityQuotientAssessment component exports
2. Check API endpoint returns correct shape
3. Verify auth tokens present for API calls

## Performance Considerations

- Questions are loaded once at assessment start (30 questions)
- Scoring calculation is O(30) - linear time
- Database queries are indexed by assessmentCode
- Email sending is async and non-blocking

## Security

- All answers validated server-side before saving
- Assessment completion verified before evaluation
- Score calculations use stored scoring maps (no client-side scoring)
- Email reports sent only to authenticated users
- API endpoints protected by authentication middleware

## Future Enhancements

- [ ] Adaptive questioning based on responses
- [ ] Proctored test mode with webcam monitoring
- [ ] Batch report generation for institutions
- [ ] Real-time analytics dashboard for admins
- [ ] Multi-language support
- [ ] Mobile app integration
- [ ] Peer benchmarking comparison
- [ ] Longitudinal tracking across attempts
