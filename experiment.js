var style = document.createElement('style');
style.innerHTML = `
  body {
    font-size: 22px !important;
  }

  #jspsych-progressbar-container {
    height: 30px !important;
    margin-bottom: 20px;
  }

  #jspsych-progressbar {
    height: 30px !important;
    border-radius: 6px;
  }

  #jspsych-progressbar-text {
    font-size: 18px !important;
    font-weight: bold;
  }

  .scenario-box {
    max-width: 1000px;
    margin: 0 auto;
    text-align: left;
    line-height: 1.6;
  }

  .candidate-box {
    margin-bottom: 30px;
    padding: 18px;
    border: 1px solid #ccc;
    border-radius: 10px;
    background: #fafafa;
  }

  .rank-box {
    border: 2px solid #333;
    padding: 20px;
    border-radius: 10px;
    width: 60%;
    margin: 0 auto;
    background-color: #f9f9f9;
  }

  .end-box {
    max-width: 700px;
    margin: 0 auto;
    text-align: center;
    line-height: 1.6;
    border: 1px solid #ccc;
    border-radius: 12px;
    padding: 30px;
    background: #fafafa;
  }

  .completion-code-box {
    margin-top: 25px;
    padding: 20px;
    border: 2px solid #333;
    border-radius: 10px;
    background: #fff;
    font-size: 26px;
    font-weight: bold;
    letter-spacing: 1px;
  }
`;
document.head.appendChild(style);

// Firebase
const firebaseConfig = {
  apiKey: "AIzaSyDVFN2B7ux0o--VEHY4ojHEdXWb864LBCk",
  authDomain: "final-study-eb20c.firebaseapp.com",
  databaseURL: "https://final-study-eb20c-default-rtdb.firebaseio.com",
  projectId: "final-study-eb20c",
  storageBucket: "final-study-eb20c.firebasestorage.app",
  messagingSenderId: "1060756765989",
  appId: "1:1060756765989:web:09fc13bb4f562abc236ecc",
  measurementId: "G-8ZSSF48Q1F"
};

if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}
const database = firebase.database();

const jsPsych = initJsPsych({
  show_progress_bar: true,
  auto_update_progress_bar: true
});

const participantID =
  jsPsych.data.getURLVariable("id") || Math.floor(Math.random() * 1000000).toString();

jsPsych.data.addProperties({ participantID });

// Put your real completion code here
const COMPLETION_CODE = "D66900519A";

// Log one row per response
const logToFirebase = (trialData) => {
  const pid = jsPsych.data.get().values()[0]?.participantID || "unknown";

  const baseEntry = {
    participantID: pid,
    block: trialData.block,
    scenario: trialData.scenario,
    version: trialData.version,
    timestamp: Date.now()
  };

  const responses = trialData.responses || {};

  for (let key in responses) {
    const value = responses[key];
    const isRating = key.startsWith("rating_");
    const isRank = key.startsWith("rank_");

    if (isRating || isRank) {
      const entry = {
        ...baseEntry,
        candidate: key.replace(/^rating_|^rank_/, ""),
        questionType: isRating ? "rating" : "ranking",
        response: value
      };

      database.ref(`pilot_ceo_single_scenario/${pid}/trials`).push(entry);
    }
  }
};

const saveConnectID = (connectID) => {
  const pid = jsPsych.data.get().values()[0]?.participantID || "unknown";

  return database.ref(`pilot_ceo_single_scenario/${pid}/meta`).update({
    participantID: pid,
    connectID: connectID,
    completionCodeShown: COMPLETION_CODE,
    completedAt: Date.now()
  });
};

// Instructions
const instructions_exp = {
  type: jsPsychHtmlKeyboardResponse,
  stimulus: `
    <div class="scenario-box">
      <h2>Welcome to this experiment</h2>
      <p>In this study, you will be asked to imagine that you are serving on a hiring committee for a company that is looking to hire a new CEO.</p>
      <p>You will read one company description and three applicant profiles.</p>
      <p>Your task is to:</p>
      <p>1. Rate how likely you would be to select each applicant for an interview on a scale from 1 to 7.</p>
      <p>2. Rank the three applicants from best fit to worst fit for the position.</p>
      <p>Please read carefully and respond as thoughtfully as possible.</p>
      <p>Press <strong>SPACE</strong> to begin.</p>
    </div>
  `,
  choices: [' ']
};

// Single CEO scenario
const ceoScenario = {
  name: "CEO Scenario",
  data: { scenario: "CEO", version: 1 },
  jobDescription: `
    <div class="scenario-box">
      <h2>Job Posting: Chief Executive Officer (CEO)</h2>
      <p><strong>Location:</strong> Vancouver, BC</p>
      <p><strong>About the Company:</strong> Westline Foods is a Canadian company that produces packaged meal products for major grocery chains across North America. We have been in business for 75 years and developed a strong reputation for quality and steady growth. We have 5,200 employees. Currently we are challenged by slowing sales momentum and lagging profits. Our production facilities are 20 to 30 years old and very labour intensive. The board would like to move the company into the 21st Century through AI powered automation of plants and trimming of the work force.</p>
      <p>We are looking for a new CEO who can reinvigorate our sales momentum and profit margins by opening new markets and reigning in production costs through aggressive automation and workforce reduction.</p>
      <p></strong>Please scroll down to view the 3 applicants for this position.</strong></p>
    </div>
  `,
  candidates: [
    {
      name: "Robert",
      description: `In my previous role as president of a large manufacturing company, I was brought in at a time when growth had begun to flatten and margins were under pressure. Over several years, we expanded into new regional and international accounts while modernizing older facilities that had become increasingly expensive to run. That work required difficult operational decisions, closer coordination between commercial and production teams, and a willingness to shift long-standing practices that no longer fit the pace of the industry. Colleagues often described me as someone who could move a company forward decisively while keeping attention on long-term competitiveness.`
    },
    {
      name: "Mark",
      description: `As chief operating officer of a national automation firm, I spent much of my time overseeing large-scale changes inside plants that had been built for an earlier era of production. We specialized in introducing new systems that reduced manual bottlenecks, improved output, and changed the way work was organized across many different types of facilities. Much of my career has involved helping established companies become faster, leaner, and better equipped for the demands of a more modern market. I tend to do my best work in organizations that need sharper execution and a more disciplined operating model to remain competitive.`
    },
    {
      name: "Jason",
      description: `I have held senior leadership roles in finance and corporate planning across several well-established Canadian firms. In one position, I worked closely with executive leadership on long-range budgeting and capital allocation. In another, I helped strengthen reporting practices and improve visibility into business performance across divisions. I see myself as a disciplined and analytical leader who values structure, accountability, and clear decision-making. My experience has taught me that companies perform best when leadership remains focused on financial stability, internal alignment, and measured long-term planning.`
    }
  ]
};

function createTrialWithRatingsAndRanking(scenario) {
  const candidateCount = scenario.candidates.length;

  const candidateSections = scenario.candidates.map((c, i) => {
    const id = c.name.replace(/\s+/g, '');
    return `
      <div class="candidate-box">
        <strong>${i + 1}. ${c.name}</strong>
        <p>${c.description}</p>

        <label for="rating_${id}">
          <strong>How likely are you to select this applicant for an interview? (1 = Very Unlikely, 7 = Very Likely)</strong>
        </label><br><br>

        <input
          type="range"
          id="rating_${id}"
          name="rating_${id}"
          min="1"
          max="7"
          step="1"
          value="4"
          style="width: 60%; display: block; margin: 0 auto;"
        >

        <div style="display: flex; justify-content: space-between; padding: 0 4px; font-weight: bold; width: 60%; margin: 0 auto;">
          <span>1</span><span>2</span><span>3</span><span>4</span><span>5</span><span>6</span><span>7</span>
        </div>
      </div>
    `;
  }).join("");

  const rankingInputs = scenario.candidates.map(c => {
    const id = c.name.replace(/\s+/g, '');
    return `
      <label for="rank_${id}"><strong>${c.name}:</strong></label>
      <input
        type="number"
        id="rank_${id}"
        name="rank_${id}"
        min="1"
        max="${candidateCount}"
        required
        style="width: 50px; height: 30px; font-size: 17px; text-align: center; margin-bottom: 10px; margin-left: 10px;"
      ><br><br>
    `;
  }).join("");

  const htmlBlock = `
    <div class="scenario-box">
      ${candidateSections}
      <hr>
      <div class="rank-box">
        <p><strong>Ranking Task:</strong> Please rank the applicants from 1 (best fit) to ${candidateCount} (least fit). Please assign a unique rank number to each applicant.</p>
        ${rankingInputs}
        <button id="customSubmit" type="button" style="font-size: 16px; padding: 10px 20px; margin-top: 10px;">
          Submit
        </button>
        <div id="errorMsg" style="color:red; font-weight:bold; margin-top: 12px;"></div>
      </div>
    </div>
  `;

  return {
    type: jsPsychSurveyHtmlForm,
    preamble: scenario.jobDescription + "<hr><h3 style='text-align:center;'>Applicants</h3>",
    html: htmlBlock,
    data: scenario.data,
    on_load: function () {
      const tryRemoveButton = () => {
        const defaultBtn = document.querySelector('.jspsych-btn');
        if (defaultBtn) defaultBtn.remove();
      };

      tryRemoveButton();

      const observer = new MutationObserver(() => {
        tryRemoveButton();
      });

      observer.observe(document.body, { childList: true, subtree: true });

      const btn = document.getElementById("customSubmit");
      const form = document.querySelector("form");
      const errorMsg = document.getElementById("errorMsg");

      btn.addEventListener("click", () => {
        const formData = new FormData(form);

        const ratingKeys = scenario.candidates.map(c => `rating_${c.name.replace(/\s+/g, '')}`);
        for (const key of ratingKeys) {
          if (!formData.get(key)) {
            errorMsg.textContent = "Please provide a rating for each candidate.";
            return;
          }
        }

        const ranks = [];
        for (let [key, val] of formData.entries()) {
          if (key.startsWith("rank_")) {
            ranks.push(Number(val));
          }
        }

        const uniqueRanks = new Set(ranks);
        const expected = [...Array(candidateCount)].map((_, i) => i + 1);

        if (ranks.length !== candidateCount || ranks.some(val => isNaN(val))) {
          errorMsg.textContent = "Please enter a valid numeric rank for each candidate.";
          return;
        }

        if (uniqueRanks.size !== ranks.length) {
          errorMsg.textContent = "Each candidate must have a unique rank. Please check your responses.";
          return;
        }

        if (!expected.every(num => ranks.includes(num))) {
          errorMsg.textContent = `Please use each number from 1 to ${candidateCount} exactly once.`;
          return;
        }

        errorMsg.textContent = "";
        observer.disconnect();

        const trialData = {
          ...scenario.data,
          responses: Object.fromEntries(formData.entries()),
          block: scenario.name
        };

        logToFirebase(trialData);
        jsPsych.finishTrial(trialData);
      });
    }
  };
}

// End page with Connect ID + visible completion code
const connectIDPage = {
  type: jsPsychSurveyHtmlForm,
  preamble: `
    <div class="end-box">
      <h2>Study Complete</h2>
      <p>Please enter your Connect ID below.</p>
      <p>Your completion code is shown underneath. Please copy it for submission.</p>
    </div>
  `,
  html: `
    <div class="end-box">
      <p>
        <label for="connect_id"><strong>Connect ID:</strong></label><br><br>
        <input
          type="text"
          id="connect_id"
          name="connect_id"
          required
          style="width: 70%; max-width: 400px; font-size: 20px; padding: 10px; text-align: center;"
        >
      </p>

      <div class="completion-code-box">
        Completion Code: ${COMPLETION_CODE}
      </div>

      <p style="margin-top: 20px;">
        After entering your Connect ID, click Continue.
      </p>
    </div>
  `,
  button_label: "Continue",
  on_finish: function(data) {
    let connectID = "";
    try {
      const parsed = JSON.parse(data.responses);
      connectID = parsed.connect_id || "";
    } catch (e) {
      connectID = "";
    }

    data.connectID = connectID;
    saveConnectID(connectID);
  }
};

const finalPage = {
  type: jsPsychHtmlKeyboardResponse,
  stimulus: `
    <div class="end-box">
      <h2>Thank you for participating</h2>
      <p>Your responses have been recorded.</p>
      <p>You may now close this page and return to the study platform and submit your completion code.</p>
      <div class="completion-code-box">
        ${COMPLETION_CODE}
      </div>
    </div>
  `,
  choices: "NO_KEYS"
};

let timeline = [];
timeline.push(instructions_exp);

const shuffledCandidates = jsPsych.randomization.shuffle(ceoScenario.candidates);

timeline.push(
  createTrialWithRatingsAndRanking({
    ...ceoScenario,
    candidates: shuffledCandidates
  })
);

timeline.push(connectIDPage);
timeline.push(finalPage);

jsPsych.run(timeline);