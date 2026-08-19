/* =====================================================================
   PROJECT DATA  ,  edit this file to add or change projects.
   Each key (e.g. "datathon-2025") becomes the URL: project.html?id=datathon-2025
   Cards in index.html link here via href="project.html?id=...".

   BLOCK TYPES for the "blocks" array:
     { type:'wide',  img:'', ph:'label' }                 full-width image
     { type:'pair',  a:{img:'',ph:''}, b:{img:'',ph:''} } two images side by side
     { type:'text',  h:'Heading', p:['para 1','para 2'] } text section
   Set img to a real image path (e.g. 'assets/datathon-1.png') to show it;
   leave img empty ('') to show the gray placeholder with the ph label.

   facts = small role / year / stack row.
   links = optional buttons. First link is the solid button, the rest are outlined.
   ===================================================================== */
const PROJECTS = {

  
  /* 2 ─────────────────────────────────────────────────────────────── */
  'titan-sentinel': {
    num: '02',
    title: 'Titan Operations Sentinel',
    cat: 'Agentic AI · Multi-Agent Systems',
    sub: 'A multi-agent AI system that does the job of five siloed operations teams at once. An LLM orchestrator routes five autonomous agents that share one transcript and agree on a single action plan, then wait for a human to approve it.',
    hero: '', c1:'#e6e7ec', c2:'#c9ccd6',
    facts: [
      { k:'Role',  v:'Builder (team of 5)' },
      { k:'Course',v:'Agentic AI · IE' },
      { k:'Year',  v:'2026' },
      { k:'Stack', v:'Python · LangGraph · LLM agents' }
    ],
    links: [
      { label:'View on GitHub', url:'https://github.com/ma731/Agentic-AI-for-IT' }
    ],
    blocks: [
      { type:'text', h:'The problem', p:[
        'The case client is a global manufacturer that gets more than 22,000 unprioritized sensor alerts a day across five teams that do not talk to each other. One downed machine costs 180,000 dollars a day, and one quarter lost 14 million dollars to missing parts.',
        'Dashboards show the data but do not make a call, and scripts cannot reason across teams. The system had to actually decide.'
      ]},
      { type:'pair', a:{img:'',ph:'Agent graph / supervisor routing'}, b:{img:'',ph:'Action plan output'} },
      { type:'text', h:'How it works', p:[
        'An LLM supervisor routes between five specialist agents for reliability, supply chain, production, quality, and safety. They share one running transcript and settle on a single plan, and the system pauses for a human before anything costly or safety related happens.',
        'In the demo, a vibration alert on a machine sets it off. The system predicts a bearing failure 52 to 76 hours out, finds the part in another warehouse, reroutes the machine’s jobs, checks for shift and safety conflicts, and hands a plant manager one costed plan to approve. That replaces five teams making five phone calls over five hours.'
      ]},
      { type:'wide', img:'', ph:'System walkthrough / demo screenshot' }
    ]
  },

  /* 3 ─────────────────────────────────────────────────────────────── */
  'aerospace-maintenance': {
    num: '03',
    title: 'Aerospace Predictive Maintenance',
    cat: 'Deep Learning · Time Series',
    sub: 'A deployable platform that predicts how much life is left in an aircraft engine from its sensor data. It uses an LSTM, gives real-time predictions and explanations, and ships as a working product, not a notebook.',
    hero: '', c1:'#e9e7e2', c2:'#d3ccc2',
    facts: [
      { k:'Role',  v:'ML / DL (team of 4)' },
      { k:'Course',v:'Deep Learning · IE' },
      { k:'Year',  v:'2026' },
      { k:'Stack', v:'Keras · FastAPI · React' }
    ],
    links: [
      { label:'View on GitHub', url:'https://github.com/MarianGarabana/DeepLearning_PredictiveMaintenance' }
    ],
    blocks: [
      { type:'text', h:'The business case', p:[
        'Engine failure is the most expensive event in aviation. An unplanned aircraft on ground event runs 10,000 to 150,000 dollars an hour, and a widebody overhaul costs 1 to 3 million. Time based maintenance ignores how worn an engine actually is.',
        'Maintenance triggered by the model costs about 35,000 dollars, against about 500,000 for an unplanned failure. That is roughly a 13 times return on every failure avoided.'
      ]},
      { type:'pair', a:{img:'',ph:'RUL prediction dashboard'}, b:{img:'',ph:'Sensor degradation curves'} },
      { type:'text', h:'The model', p:[
        'An LSTM reads the engine’s sensor time series from the NASA CMAPSS dataset and predicts how many flight cycles are left before maintenance is due. That lets an airline schedule on real wear instead of a fixed calendar.',
        'It is a deployable MVP with a FastAPI backend and a React dashboard, built to look and feel like a real aviation maintenance product.'
      ]},
      { type:'wide', img:'', ph:'Deployed app screenshot' }
    ]
  },

  /* 4 ─────────────────────────────────────────────────────────────── */
  'datathon-2025': {
    num: '04',
    title: 'Sustainable Aviation Datathon (Winner)',
    cat: 'Datathon · Forecasting · Sustainability',
    sub: 'Now a dedicated page: datathon.html (project.html redirects there).',
    hero: '', c1:'#e7e9e4', c2:'#ccd2c6',
    facts: [], blocks: []
  },

  /* 5 ─────────────────────────────────────────────────────────────── */
  'madrid-rental': {
    num: '05',
    title: 'Madrid Rental ML Dashboard',
    cat: 'Machine Learning · Streamlit',
    sub: 'A live Streamlit app that runs a full machine learning pipeline on about 2,085 Madrid rental listings. It covers exploration, clustering, association rules, rent prediction, and classification, all trained live from the raw data.',
    hero: 'assets/madrid-explorer.png', c1:'#e8e9e4', c2:'#cfd2c8',
    facts: [
      { k:'Role',  v:'Solo build' },
      { k:'Course',v:'Machine Learning I · IE' },
      { k:'Year',  v:'2026' },
      { k:'Stack', v:'Python · scikit-learn · Streamlit' }
    ],
    links: [
      { label:'Open live app', url:'https://madridrentalanalysisapp-mariangarabana.streamlit.app/' },
      { label:'View on GitHub', url:'https://github.com/MarianGarabana/Madrid_Rental_Analysis_StreamlitApp' }
    ],
    blocks: [
      { type:'text', h:'Overview', p:[
        'I took about 2,085 Idealista listings and built one live app that walks through the full machine learning story, from exploring the data to clustering, predicting rent, and classifying listings. Everything is interactive and trains live when the app starts. The screens below are the real app, which you can open and use yourself.'
      ]},
      { type:'text', h:'Property segments', p:[
        'A K-Means model groups the listings into five segments, from Entry-Level Interior to Grand Estate. The scatter shows rent against size colored by segment, and the radar compares each segment across size, rent, and floor level, so the clusters actually mean something you can describe.'
      ]},
      { type:'shot', light:true, img:'assets/madrid-segments.png', caption:'K-Means property segments · rent vs size and segment radar' },
      { type:'text', h:'Predicting rent', p:[
        'The rent predictor is an OLS regression with VIF filtering and RFECV feature selection. On the held-out test set it reaches an R-squared of 0.78 with a mean absolute error of about 469 euros, and it shows which features push rent up or down.'
      ]},
      { type:'shot', light:true, img:'assets/madrid-predictor.png', caption:'Rent predictor · performance and feature effects' },
      { type:'text', h:'Classifying high rent', p:[
        'The high-rent classifier is a logistic regression with an adjustable probability threshold. It reaches 87% accuracy and a test AUC of 0.94, with almost no gap between train and test, and every prediction comes with a ROC curve and odds ratios you can read.'
      ]},
      { type:'shot', light:true, img:'assets/madrid-classifier.png', caption:'High-rent classifier · accuracy, AUC and ROC' }
    ]
  },

  /* 6 ─────────────────────────────────────────────────────────────── */
  'trading-system': {
    num: '06',
    title: 'Trading System Automation',
    cat: 'Machine Learning · Live App',
    sub: 'A machine learning system that predicts next-day buy, sell, or hold signals for 31 large US stocks. It pulls live financial data, engineers features, trains the models, and serves everything through a Streamlit app with backtesting.',
    hero: '', c1:'#e7e8ea', c2:'#ccd0d4',
    facts: [
      { k:'Role',  v:'API wrapper + app (team)' },
      { k:'Course',v:'Python II · IE' },
      { k:'Year',  v:'2026' },
      { k:'Stack', v:'Python · scikit-learn · Streamlit' }
    ],
    links: [
      { label:'Open live app', url:'https://pythongroupassignment.streamlit.app/' },
      { label:'View on GitHub', url:'https://github.com/MarianGarabana/TradingSystemAutomation' }
    ],
    blocks: [
      { type:'text', h:'Overview', p:[
        'The system fetches financial data from SimFin, uses bulk files for training and the live API for predictions, and turns it into daily trading signals for 31 large-cap US tickers.'
      ]},
      { type:'pair', a:{img:'',ph:'Serving layer diagram'}, b:{img:'',ph:'Prediction / backtest view'} },
      { type:'text', h:'My part and how it works', p:[
        'The pipeline cleans the data and engineers 22 features across price, volume, and fundamentals, then trains two pooled models that output buy, sell, or hold. I built the API wrapper that talks to SimFin and helped build the Streamlit app that serves predictions and backtests them.',
        'We also kept an AI usage log in the repo, so the way AI helped build the project is documented alongside the code.'
      ]},
      { type:'wide', img:'', ph:'Streamlit app screenshot' }
    ]
  },

  /* 7 ─────────────────────────────────────────────────────────────── */
  'spanish-grid': {
    num: '07',
    title: 'Spanish EV Charging Network',
    cat: 'Datathon · Forecasting · Geospatial',
    sub: 'A datathon project that plans where Spain should build its interurban EV charging network. It forecasts EV demand to 2027, checks where the electrical grid can actually support new chargers, and proposes the smallest network that covers the country.',
    hero: '', c1:'#e6e9e6', c2:'#cbd1cb',
    facts: [
      { k:'Role',  v:'Analyst (team)' },
      { k:'Event', v:'IE Sustainability Datathon 2026' },
      { k:'Year',  v:'2026' },
      { k:'Stack', v:'Python · ARIMA · Streamlit · GIS' }
    ],
    links: [
      { label:'View on GitHub', url:'https://github.com/MarianGarabana/SpanishElectricGrid' }
    ],
    blocks: [
      { type:'text', h:'The challenge', p:[
        'Electric cars only work on long trips if there are chargers along the way, and a charger only works if the local grid can power it. The task was to plan a national interurban charging network for 2027 that respects both traffic demand and grid capacity.'
      ]},
      { type:'pair', a:{img:'',ph:'EV demand map'}, b:{img:'',ph:'Grid capacity map'} },
      { type:'text', h:'What we built', p:[
        'We forecast EV adoption to 2027 by testing ARIMA, SARIMA, Holt-Winters, and Prophet and keeping the best by error, then broke the forecast down to all 52 provinces. On the supply side we mapped roads, traffic, existing chargers, and grid capacity from public data.',
        'A scoring pipeline weighed traffic, demand, grid capacity, and spacing rules to place 190 charging stations, and flagged 164 points where demand would outrun the grid. Those become the priority spots for grid upgrades. We shipped it as a Streamlit app with interactive maps.'
      ]},
      { type:'wide', img:'', ph:'Proposed network map' }
    ]
  },

  /* 8 ─────────────────────────────────────────────────────────────── */
  'hospital-mlops': {
    num: '08',
    title: 'Hospital Readmission MLOps',
    cat: 'MLOps · Production ML',
    sub: 'A production-style pipeline that predicts whether a diabetic patient will be readmitted within 30 days, taken all the way from raw data to a live, monitored API with a full clinical interface on top.',
    hero: 'assets/hospital-dashboard.png', c1:'#e7e9ea', c2:'#ccd0d3',
    facts: [
      { k:'Role',  v:'ML Engineer (team)' },
      { k:'Course',v:'MLOps · IE' },
      { k:'Year',  v:'2026' },
      { k:'Stack', v:'MLflow · FastAPI · Docker · CI/CD' }
    ],
    links: [
      { label:'View on GitHub', url:'https://github.com/NOSIEMPRE/Hospital-Prediction-System' }
    ],
    blocks: [
      { type:'text', h:'Overview', p:[
        'This is not just a model. It is a full pipeline in six phases, from exploring the data to a deployed service, built so the whole thing can be reproduced and maintained.'
      ]},
      { type:'text', h:'The interface', p:[
        'On top of the model sits a React and Node platform with a dark clinical design. A clinician fills in a patient, runs the assessment, and gets a risk score back with a plain explanation of what drove it. The screens below are the real app talking to the deployed model.'
      ]},
      { type:'shot', img:'assets/hospital-shap.png', spotlight:true, caption:'Scored patient with a live SHAP explanation' },
      { type:'text', h:'Explainable by design', p:[
        'Every prediction comes with a SHAP breakdown that ranks the clinical features by how much they pushed the risk up or down. Red bars raise the risk, teal bars lower it, so the score is never a black box.'
      ]},
      { type:'shot', img:'assets/hospital-monitoring.png', caption:'System health and MLOps monitoring' },
      { type:'text', h:'The pipeline', p:[
        'Feature engineering feeds experiment tracking in MLflow. The best model is served through a FastAPI endpoint, packaged with Docker, watched for drift with Evidently, and shipped through a CI/CD pipeline to a live cloud deployment.',
        'The point of the project was the engineering around the model. Reproducible training, versioned models, tests, and monitoring are the parts that keep machine learning alive in production.'
      ]},
      { type:'text', h:'How the model performs', p:[
        'I compared models in MLflow and picked the champion by its confusion matrix. The two matrices below show where the model is right and where it confuses a readmission with a non-readmission, which is the trade-off that actually matters in a hospital.'
      ]},
      { type:'pair',
        a:{img:'assets/hospital-cm-champion.png', fit:'contain', ph:'Champion confusion matrix'},
        b:{img:'assets/hospital-cm-heatmap.png', fit:'contain', ph:'Confusion matrix heatmap'} }
    ]
  },

  /* 9 ─────────────────────────────────────────────────────────────── */
  'rlgym': {
    num: '09',
    title: 'Reinforcement Learning Bot',
    cat: 'Reinforcement Learning · MLOps',
    sub: 'A reinforcement learning bot that learns to play a 1v1 match, trained with PPO in a physics simulator. I built it with real engineering discipline so every run is reproducible and every experiment is tracked.',
    hero: '', c1:'#e8e7ea', c2:'#d0cdd4',
    facts: [
      { k:'Role',  v:'Builder (team)' },
      { k:'Course',v:'Reinforcement Learning · IE' },
      { k:'Year',  v:'2026' },
      { k:'Stack', v:'Python · RLGym-PPO · wandb' }
    ],
    links: [
      { label:'View on GitHub', url:'https://github.com/moanv2/rlgym' }
    ],
    blocks: [
      { type:'text', h:'The idea', p:[
        'The project trains an agent to play a 1v1 match through reinforcement learning, using PPO inside a physics simulator. The agent learns by playing, guided by reward functions I can swap and combine.'
      ]},
      { type:'pair', a:{img:'',ph:'Training reward curves'}, b:{img:'',ph:'Agent in the simulator'} },
      { type:'text', h:'How it is built', p:[
        'I kept the reward, observation, action, and state pieces separate so each one can change on its own. Every run is defined by a single config file with fixed seeds, checkpoints are saved with their config and git version, and metrics are tracked in wandb.',
        'Tests and a CI pipeline run on every push. I wanted a reinforcement learning project that was reproducible and clean, not a one-off script that only runs on my laptop.'
      ]},
      { type:'wide', img:'', ph:'wandb dashboard' }
    ]
  },

  /* 10 ────────────────────────────────────────────────────────────── */
  'dicorsa-forecasting': {
    num: '10',
    title: 'Beverage Distribution Forecasting',
    cat: 'Predictive Analytics · Internship',
    sub: 'A sales analytics internship where I built a forecasting model on more than 600,000 transactions, set up the database behind it, and turned the results into dashboards and real cost-saving decisions.',
    hero: '', c1:'#e9e8e2', c2:'#d4cdc4',
    facts: [
      { k:'Role',  v:'Business Analyst Intern' },
      { k:'Where', v:'Beverage distributor · Mexico' },
      { k:'Year',  v:'2024-25' },
      { k:'Stack', v:'Python · MySQL · Tableau' }
    ],
    blocks: [
      { type:'text', h:'What I did', p:[
        'I built a weekly forecast of average order size on more than 600,000 sales records. Across 14 weeks of actuals it came within about 25% on average, which is 75% on a mean absolute percentage error basis.',
        'I designed the MySQL database behind the analysis and built six Tableau dashboards so the business could read the numbers on its own.'
      ]},
      { type:'pair', a:{img:'',ph:'Tableau dashboard'}, b:{img:'',ph:'Forecast vs. actuals'} },
      { type:'text', h:'The impact', p:[
        'The work fed three cost-saving strategies and route-optimization plans, so the forecasting turned into decisions the company could act on, not just a report.'
      ]}
    ]
  },

  /* 11 ────────────────────────────────────────────────────────────── */
  'sql-cinema': {
    num: '11',
    title: 'Cinema Chain Database',
    cat: 'SQL · Database Design',
    sub: 'A relational database for a cinema chain across Madrid, Barcelona, and Sevilla. I designed the full schema, populated it, and answered real business questions with SQL.',
    hero: 'assets/art/cinema.svg', c1:'#e8e8e3', c2:'#d1cfc7',
    facts: [
      { k:'Role',  v:'Builder (team)' },
      { k:'Course',v:'SQL II · IE' },
      { k:'Year',  v:'2025' },
      { k:'Stack', v:'MySQL · 3NF design' }
    ],
    links: [
      { label:'View on GitHub', url:'https://github.com/MarianGarabana/SQL-Cinema-Project' },
      { label:'DDL script', url:'assets/cinema-ddl.sql' },
      { label:'Seed data', url:'assets/cinema-dml.sql' },
      { label:'Workbench model', url:'assets/cinema-model.mwb' }
    ],
    blocks: [
      { type:'text', h:'Overview', p:[
        'The project is a full relational database for a multi-location cinema chain, with 17 tables designed to third normal form and 817 rows of seed data across the three cities. It covers ticket sales, concessions, films, scheduling, and customers, and you can download the DDL, the seed data, and the MySQL Workbench model below and run the whole thing yourself.'
      ]},
      { type:'wide', img:'assets/cinema-erd.png', fit:'contain', ph:'Entity relationship diagram', alt:'Entity relationship diagram of the 17-table cinema database in third normal form' },
      { type:'text', h:'What it answers', p:[
        'I designed the schema, wrote the create and insert scripts, and answered five business questions with SQL. The queries find the most profitable film, the share of orders that buy a popcorn and drink combo, the peak sales time of day, monthly revenue per location, and the best auditorium type per ticket.',
        'A few design choices made the queries cleaner, like setting prices at the auditorium type level and storing the location directly on each ticket so revenue by location is easy to read.'
      ]},
      { type:'pdf', src:'assets/cinema-report.pdf', label:'Full project report (11 pages)' }
    ]
  }

};

// order for the homepage grid and prev/next navigation between projects
const PROJECT_ORDER = [
  'titan-sentinel','aerospace-maintenance','datathon-2025',
  'madrid-rental','trading-system','spanish-grid','hospital-mlops',
  'rlgym','dicorsa-forecasting','sql-cinema'
];
