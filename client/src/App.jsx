import { useEffect, useState } from 'react';

import {

  fetchMeals,

  createMeal as saveMeal,

  removeMeal,

} from './services/mealService';

import Auth from './Auth_temp.jsx';

import Profile from './components/Profile.jsx';

import { fetchProfile } from './services/profileService';

import { calculateDailyCalories } from './utils/calorieCalculator';

import {

  getCurrentUser,

  logoutUser,

} from './services/authService';

import {

  Activity,

  Apple,

  ArrowDownRight,

  ArrowUpRight,

  Bell,

  CalendarDays,

  ChevronDown,

  Droplets,

  Flame,

  Heart,

  Home,

  Leaf,

  LogOut,

  Menu,

  Plus,

  Settings,

  Sparkles,

  Target,

  TrendingUp,

  Weight,

  UserRound,

  X,

} from 'lucide-react';

import {

  Area,

  AreaChart,

  CartesianGrid,

  ResponsiveContainer,

  Tooltip,

  XAxis,

  YAxis,

} from 'recharts';

import './App.css';

const weeklyData = [

  { day: 'Mon', calories: 1780, goal: 2000 },

  { day: 'Tue', calories: 2100, goal: 2000 },

  { day: 'Wed', calories: 1850, goal: 2000 },

  { day: 'Thu', calories: 1950, goal: 2000 },

  { day: 'Fri', calories: 1650, goal: 2000 },

  { day: 'Sat', calories: 2200, goal: 2000 },

  { day: 'Sun', calories: 920, goal: 2000 },

];

const waterGoal = 8;

const initialWater = 4;

function getLocalDateString(date = new Date()) {

  const year = date.getFullYear();

  const month = String(date.getMonth() + 1).padStart(2, '0');

  const day = String(date.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;

}

function normalizeMeal(meal) {

  return {

    ...meal,

    id: meal._id,

    icon: '🍽️',

    color: 'green',

    time: meal.consumedAt

      ? new Date(meal.consumedAt).toLocaleTimeString([], {

          hour: '2-digit',

          minute: '2-digit',

        })

      : 'Time unavailable',

  };

}

function StatCard({

  icon: Icon,

  label,

  value,

  unit,

  goal,

  percent,

  color,

  trend,

}) {

  return (

    <article className="stat-card">

      <div className="stat-top">

        <div className={`stat-icon ${color}`}>

          <Icon size={20} />

        </div>

        <span className="stat-trend">

          <ArrowUpRight size={14} /> {trend}

        </span>

      </div>

      <p className="stat-label">{label}</p>

      <div className="stat-value">

        {value}<span> {unit}</span>

      </div>

      <div className="progress-track">

        <div

          className={`progress-fill ${color}`}

          style={{ width: `${Math.min(Math.max(Number(percent) || 0, 0), 100)}%` }}

        />

      </div>

      <div className="stat-footer">

        <span>{goal}</span>

        <strong>{percent}%</strong>

      </div>

    </article>

  );

}

function App() {

  // Authentication state

  const [currentUser, setCurrentUser] = useState(() => {

    try {

      return localStorage.getItem('token') ? getCurrentUser() : null;

    } catch {

      logoutUser();

      return null;

    }

  });

  // Meal state

  const [meals, setMeals] = useState([]);

  const [nutritionProfile, setNutritionProfile] = useState(null);


  const [loadingMeals, setLoadingMeals] = useState(true);

  const [savingMeal, setSavingMeal] = useState(false);

  const [deletingMealId, setDeletingMealId] = useState(null);

  const [apiError, setApiError] = useState('');

  const [selectedDate, setSelectedDate] = useState(() =>

    getLocalDateString()

  );

  // Dashboard state

  const [water, setWater] = useState(initialWater);

  const [activeNav, setActiveNav] = useState('Overview');

  const [showMealForm, setShowMealForm] = useState(false);

  const [mobileMenu, setMobileMenu] = useState(false);

  const [notice, setNotice] = useState('');

  // Meal form state

  const [mealName, setMealName] = useState('');

  const [mealCalories, setMealCalories] = useState('');

  const [mealProtein, setMealProtein] = useState('');

  const [mealCarbs, setMealCarbs] = useState('');

  const [mealFat, setMealFat] = useState('');

  // Called after successful login or registration

  function handleAuthenticated(user) {

    setCurrentUser(user);

    setApiError('');

    setNotice('');

  }

  // Logout the current user

  function handleLogout() {

    logoutUser();

    setCurrentUser(null);

    setMeals([]);

    setNutritionProfile(null);


    setNotice('');

    setApiError('');

    setShowMealForm(false);

    setMobileMenu(false);

    setLoadingMeals(false);

  }

  // Load meals only when a user is authenticated

  useEffect(() => {

    let cancelled = false;

    async function loadMeals() {

      if (!currentUser) {

        setMeals([]);

        setLoadingMeals(false);

        return;

      }

      setLoadingMeals(true);

      setApiError('');

      try {

        const data = await fetchMeals(selectedDate);

        if (!cancelled) {

          setMeals(Array.isArray(data) ? data.map(normalizeMeal) : []);

        }

      } catch (error) {

        if (!cancelled) {

          if (error.response?.status === 401) {

            logoutUser();

            setCurrentUser(null);

            setMeals([]);

            setShowMealForm(false);

            setNotice('');

            setApiError('Your session has expired. Please log in again.');

          } else {

            setApiError(

              error.response?.data?.message ||

                'Unable to load meals. Make sure the backend is running.'

            );

          }

        }

      } finally {

        if (!cancelled) {

          setLoadingMeals(false);

        }

      }

    }

    loadMeals();

    return () => {

      cancelled = true;

    };

  }, [selectedDate, currentUser]);

  // Load the user's profile for personalized nutrition targets.

  useEffect(() => {

    let cancelled = false;

    async function loadNutritionProfile() {

      if (!currentUser) {

        setNutritionProfile(null);

    
        return;

      }


      try {

        const data = await fetchProfile();

        if (!cancelled) setNutritionProfile(data || null);

      } catch (error) {

        if (!cancelled) {

          console.error('Profile loading failed:', error);

          setNutritionProfile(null);

        }

      } finally {

        if (!cancelled) setProfileLoading(false);

      }

    }

    loadNutritionProfile();

    const handleProfileUpdate = () => loadNutritionProfile();

    window.addEventListener('nutrivibe-profile-updated', handleProfileUpdate);

    return () => {

      cancelled = true;

      window.removeEventListener('nutrivibe-profile-updated', handleProfileUpdate);

    };

  }, [currentUser]);

  // Calculate daily nutrition totals

  const totals = meals.reduce(

    (acc, meal) => ({

      calories: acc.calories + Number(meal.calories || 0),

      protein: acc.protein + Number(meal.protein || 0),

      carbs: acc.carbs + Number(meal.carbs || 0),

      fat: acc.fat + Number(meal.fat || 0),

    }),

    {

      calories: 0,

      protein: 0,

      carbs: 0,

      fat: 0,

    }

  );

  const calorieData = nutritionProfile

    ? calculateDailyCalories(nutritionProfile)

    : null;

  const calorieGoal = calorieData

    ? (typeof calorieData.target === 'number'

        ? calorieData.target

        : Math.round((calorieData.target.min + calorieData.target.max) / 2))

    : null;

  // Baseline 20/50/30 macro split; this is a configurable app assumption.

  const macroGoals = calorieGoal ? {

    protein: Math.round((calorieGoal * 0.20) / 4),

    carbs: Math.round((calorieGoal * 0.50) / 4),

    fat: Math.round((calorieGoal * 0.30) / 9),

  } : null;

  const caloriePercent = calorieGoal

    ? Math.round((totals.calories / calorieGoal) * 100)

    : 0;

  // Navigation handler

  function handleNav(label) {

    setActiveNav(label);

    setMobileMenu(false);

    if (label !== 'Overview' && label !== 'Nutrition' && label !== 'My Profile') {

      setNotice(

        `${label} is planned for a future development phase.`

      );

    } else {

      setNotice('');

    }

  }
// Add meal
  async function addMeal(event) {

    event.preventDefault();

    if (!mealName.trim()) {

      setNotice('Please enter a meal name.');

      return;

    }

    const numericFields = [

      ['Calories', mealCalories, true],

      ['Protein', mealProtein, false],

      ['Carbohydrates', mealCarbs, false],

      ['Fat', mealFat, false],

    ];

    for (const [label, value, required] of numericFields) {

      if (required && value.trim() === '') {

        setNotice(`${label} is required.`);

        return;

      }

      if (

        value.trim() !== '' &&

        (!Number.isFinite(Number(value)) || Number(value) < 0)

      ) {

        setNotice(

          `${label} must be a non-negative number.`

        );

        return;

      }

    }

    setSavingMeal(true);

    setApiError('');

    setNotice('');

    try {

      const savedMeal = await saveMeal({

        name: mealName.trim(),

        category: 'Other',

        calories: Number(mealCalories),

        protein: Number(mealProtein) || 0,

        carbs: Number(mealCarbs) || 0,

        fat: Number(mealFat) || 0,

        consumedAt: new Date(

          `${selectedDate}T12:00:00`

        ).toISOString(),

      });

      setMeals((current) => [

        ...current,

        normalizeMeal(savedMeal),

      ]);

      setMealName('');

      setMealCalories('');

      setMealProtein('');

      setMealCarbs('');

      setMealFat('');

      setShowMealForm(false);

      setNotice('Meal saved to MongoDB successfully.');

    } catch (error) {

      if (error.response?.status === 401) {

        handleLogout();

      } else {

        setApiError(

          error.response?.data?.message ||

            'Could not save the meal. Check your backend connection.'

        );

      }

    } finally {

      setSavingMeal(false);

    }

  }
// Delete meal
  async function handleDeleteMeal(meal) {

    if (!meal._id || deletingMealId !== null) {

      return;

    }

    setDeletingMealId(meal._id);

    setApiError('');

    setNotice('');

    try {

      await removeMeal(meal._id);

      setMeals((current) =>

        current.filter((item) => item._id !== meal._id)

      );

      setNotice('Meal deleted from MongoDB successfully.');

    } catch (error) {

      if (error.response?.status === 401) {

        handleLogout();

      } else {

        setApiError(

          error.response?.data?.message ||

            'Could not delete the meal. Please try again.'

        );

      }

    } finally {

      setDeletingMealId(null);

    }

  }

  const navItems = [

    { label: 'Overview', icon: Home },

    { label: 'Nutrition', icon: Apple },

    { label: 'Activity', icon: Activity },

    { label: 'My Progress', icon: TrendingUp },

    { label: 'Goals', icon: Target },

    { label: 'My Profile', icon: UserRound },

  ];
// Show authentication screen if user is not logged in
  if (!currentUser) {

    return <Auth onAuthenticated={handleAuthenticated} />;

  }

  return (

    <div className="app-shell">

      {mobileMenu && (

        <button

          className="mobile-overlay"

          aria-label="Close menu"

          onClick={() => setMobileMenu(false)}

        />

      )}

      <aside

        className={`sidebar ${

          mobileMenu ? 'sidebar-open' : ''

        }`}

      >

        <a

          className="brand"

          href="#overview"

          onClick={() => handleNav('Overview')}

        >

          <span className="brand-mark">

            <Leaf size={23} />

          </span>

          <span>

            nutri<span className="brand-highlight">vibe</span>

            <small>HEALTH, MADE PERSONAL</small>

          </span>

        </a>

        <div className="nav-caption">WORKSPACE</div>

        <nav className="side-nav" aria-label="Main navigation">

          {navItems.map(({ label, icon: Icon }) => (

            <button

              key={label}

              className={`nav-item ${

                activeNav === label ? 'active' : ''

              }`}

              onClick={() => handleNav(label)}

            >

              <Icon size={19} />

              <span>{label}</span>

              {label === 'Goals' && (

                <span className="nav-dot" />

              )}

            </button>

          ))}

        </nav>

        <div className="nav-caption tools-caption">

          PREFERENCES

        </div>

        <nav className="side-nav" aria-label="Preferences">

          <button

            className="nav-item"

            onClick={() => handleNav('Settings')}

          >

            <Settings size={19} />

            <span>Settings</span>

          </button>

        </nav>

        <div className="sidebar-tip">

          <div className="tip-icon">

            <Sparkles size={19} />

          </div>

          <h3>Small steps, big changes.</h3>

          <p>

            Consistency matters more than perfection.

            Keep showing up for yourself.

          </p>

          <div className="tip-decoration">✳</div>

        </div>

        <div className="profile">

          <div className="avatar">

            {currentUser?.name?.charAt(0).toUpperCase() || 'U'}

          </div>

          <div className="profile-copy">

            <strong>{currentUser?.name || 'User'}</strong>

            <span>

              {currentUser?.email || 'Health enthusiast'}

            </span>

          </div>

          <button

            className="icon-button profile-menu"

            aria-label="Log out"

            title="Log out"

            onClick={handleLogout}

          >

            <LogOut size={17} />

          </button>

        </div>

      </aside>

      <main className="main-area" id="overview">

        <header className="topbar">

          <div className="topbar-left">

            <button

              className="icon-button mobile-menu-button"

              aria-label="Open navigation"

              onClick={() => setMobileMenu(true)}

            >

              <Menu size={21} />

            </button>

            <div>

              <span className="breadcrumb">Workspace /</span>{' '}

              <strong>{activeNav}</strong>

            </div>

          </div>

          <div className="topbar-actions">

            <span className="date-label">

              <CalendarDays size={16} />

              {new Date(

                `${selectedDate}T12:00:00`

              ).toLocaleDateString('en-US', {

                month: 'short',

                day: 'numeric',

                year: 'numeric',

              })}

            </span>

            <button

              className="icon-button notification-button"

              aria-label="Notifications"

              onClick={() => setNotice('You are all caught up!')}

            >

              <Bell size={19} />

              <span />

            </button>

            <button

              className="user-chip"

              onClick={() =>

                setNotice(

                  'Profile settings will be available in a future phase.'

                )

              }

            >

              <span className="avatar avatar-small">

                {currentUser?.name?.charAt(0).toUpperCase() || 'U'}

              </span>

              <span>

                {currentUser?.name?.split(' ')[0] || 'User'}

              </span>

              <ChevronDown size={15} />

            </button>

          </div>

        </header>

        <div className="dashboard-content">

          {apiError && (

            <div className="notice" role="alert">

              <span>{apiError}</span>

              <button

                aria-label="Dismiss error"

                onClick={() => setApiError('')}

              >

                <X size={16} />

              </button>

            </div>

          )}

          {notice && (

            <div className="notice" role="status">

              <span>{notice}</span>

              <button

                aria-label="Dismiss message"

                onClick={() => setNotice('')}

              >

                <X size={16} />

              </button>

            </div>

          )}

          {activeNav === 'My Profile' ? (

            <Profile />

          ) : (

          <>

          <section className="welcome-row">

            <div>

              <div className="eyebrow">

                <span className="eyebrow-dot" />

                YOUR PERSONAL HEALTH SPACE

              </div>

              <h1>

                A healthier you,{' '}

                <span>one day at a time.</span>

              </h1>

              <p>

                Every little choice counts. Here's how your day is shaping up.

              </p>

            </div>

            <div className="welcome-decoration">

              <Heart size={28} />

              <span>Take care of you</span>

            </div>

          </section>

          <section

            className="stats-grid"

            aria-label="Nutrition summary"

          >

            <StatCard

              icon={Flame}

              label="Calories consumed"

              value={totals.calories.toLocaleString()}

              unit="kcal"

              goal={calorieGoal ? `Goal: ${calorieGoal.toLocaleString()} kcal` : 'Complete profile for target'}

              percent={caloriePercent}

              color="orange"

              trend={

                selectedDate === getLocalDateString()

                  ? 'Today'

                  : 'Selected day'

              }

            />

            <StatCard

              icon={Apple}

              label="Protein intake"

              value={totals.protein}

              unit="g"

              goal={macroGoals ? `Goal: ${macroGoals.protein} g` : 'Target unavailable'}

              percent={macroGoals ? Math.round((totals.protein / Math.max(macroGoals.protein, 1)) * 100) : 0}

              color="green"

              trend="Daily"

            />

            <StatCard

              icon={Droplets}

              label="Water intake"

              value={water * 250}

              unit="ml"

              goal={`Goal: ${waterGoal * 250} ml`}

              percent={Math.round(

                (water / waterGoal) * 100

              )}

              color="blue"

              trend={

                selectedDate === getLocalDateString()

                  ? 'Today'

                  : 'Selected day'

              }

            />

            <StatCard

              icon={Weight}

              label="Carbohydrates"

              value={totals.carbs}

              unit="g"

              goal={macroGoals ? `Goal: ${macroGoals.carbs} g` : 'Target unavailable'}

              percent={Math.round(

                (totals.carbs / Math.max(macroGoals?.carbs || 1, 1)) * 100

              )}

              color="purple"

              trend="Daily"

            />

          </section>

          <section className="dashboard-grid">

            <article className="panel calorie-panel">

              <div className="panel-heading">

                <div>

                  <span className="panel-kicker">

                    YOUR DAILY TARGET

                  </span>

                  <h2>Calorie overview</h2>

                </div>

                <span className="pill">

                  <span />

                  {selectedDate === getLocalDateString()

                    ? 'Today'

                    : 'Selected day'}

                </span>

              </div>

              <div className="calorie-main">

                <div

                  className="calorie-ring"

                  style={{

                    '--ring-percent': `${Math.min(

                      caloriePercent,

                      100

                    )}%`,

                  }}

                >

                  <div className="ring-inner">

                    <Flame size={23} />

                    <strong>
                      {calorieGoal
                        ? Math.max(0, calorieGoal - totals.calories).toLocaleString()
                        : '—'}
                    </strong>

                    <span>kcal left</span>

                  </div>

                </div>

                <div className="calorie-details">

                  <div>

                    <span className="legend-dot consumed-dot" />

                    <span>Consumed</span>

                    <strong>

                      {totals.calories.toLocaleString()} kcal

                    </strong>

                  </div>

                  <div>

                    <span className="legend-dot goal-dot" />

                    <span>Daily goal</span>

                    <strong>

                      {calorieGoal ? `${calorieGoal.toLocaleString()} kcal` : 'Complete your profile'}

                    </strong>

                  </div>

                  <div>

                    <span className="legend-dot remaining-dot" />

                    <span>Remaining</span>

                    <strong>
                      {calorieGoal
                        ? `${Math.max(0, calorieGoal - totals.calories).toLocaleString()} kcal`
                        : 'Complete your profile'}
                    </strong>

                  </div>

                </div>

              </div>

              <div className="panel-divider" />

              <div className="macro-heading">

                <h3>Macronutrients</h3>

                <span>Daily breakdown</span>

              </div>

              {[

                {

                  name: 'Protein',

                  amount: totals.protein,

                  goal: macroGoals?.protein || 0,

                  color: 'green',

                },

                {

                  name: 'Carbs',

                  amount: totals.carbs,

                  goal: macroGoals?.carbs || 0,

                  color: 'orange',

                },

                {

                  name: 'Fat',

                  amount: totals.fat,

                  goal: macroGoals?.fat || 0,

                  color: 'purple',

                },

              ].map((macro) => (

                <div className="macro-row" key={macro.name}>

                  <div className="macro-label">

                    <span>{macro.name}</span>

                    <strong>

                      {macro.amount}{' '}

                      <small>/ {macro.goal} g</small>

                    </strong>

                  </div>

                  <div className="progress-track">

                    <div

                      className={`progress-fill ${macro.color}`}

                      style={{

                        width: `${Math.min(

                          100,

                          (macro.goal > 0 ? (macro.amount / macro.goal) * 100 : 0)

                        )}%`,

                      }}

                    />

                  </div>

                </div>

              ))}

            </article>

            <article className="panel weekly-panel">

              <div className="panel-heading">

                <div>

                  <span className="panel-kicker">

                    YOUR CONSISTENCY

                  </span>

                  <h2>Weekly activity</h2>

                </div>

                <button

                  className="select-button"

                  onClick={() =>

                    setNotice(

                      'The weekly chart still uses sample data. Historical API integration is planned.'

                    )

                  }

                >

                  This week <ChevronDown size={15} />

                </button>

              </div>

              <div className="weekly-summary">

                <strong>

                  1,779 <span>kcal</span>

                </strong>

                <span className="weekly-change">

                  <ArrowDownRight size={15} /> Sample average

                </span>

              </div>

              <div className="chart-wrap">

                <ResponsiveContainer width="100%" height="100%">

                  <AreaChart

                    data={weeklyData}

                    margin={{

                      top: 12,

                      right: 4,

                      left: -20,

                      bottom: 0,

                    }}

                  >

                    <defs>

                      <linearGradient

                        id="calorieGradient"

                        x1="0"

                        y1="0"

                        x2="0"

                        y2="1"

                      >

                        <stop

                          offset="0%"

                          stopColor="#69a985"

                          stopOpacity={0.25}

                        />

                        <stop

                          offset="100%"

                          stopColor="#69a985"

                          stopOpacity={0.015}

                        />

                      </linearGradient>

                    </defs>

                    <CartesianGrid

                      stroke="#edf0eb"

                      strokeDasharray="4 5"

                      vertical={false}

                    />

                    <XAxis

                      dataKey="day"

                      tickLine={false}

                      axisLine={false}

                      tick={{

                        fill: '#91998f',

                        fontSize: 11,

                      }}

                      dy={9}

                    />

                    <YAxis

                      tickLine={false}

                      axisLine={false}

                      tick={{

                        fill: '#91998f',

                        fontSize: 10,

                      }}

                    />

                    <Tooltip

                      contentStyle={{

                        borderRadius: 12,

                        border: '1px solid #e5ebe4',

                        fontSize: 12,

                      }}

                    />

                    <Area

                      type="monotone"

                      dataKey="calories"

                      stroke="#5e9d77"

                      strokeWidth={2.5}

                      fill="url(#calorieGradient)"

                      activeDot={{

                        r: 5,

                        fill: '#5e9d77',

                      }}

                    />

                  </AreaChart>

                </ResponsiveContainer>

              </div>

              <div className="chart-legend">

                <span>

                  <i /> Calories consumed

                </span>

                <span className="chart-goal-label">

                  <i /> Sample goal: 2,000 kcal

                </span>

              </div>

            </article>

          </section>

          <section className="bottom-grid">

            <article className="panel meals-panel">

              <div className="panel-heading">

                <div>

                  <span className="panel-kicker">

                    FUEL YOUR BODY

                  </span>

                  <h2>

                    {selectedDate === getLocalDateString()

                      ? "Today's meals"

                      : 'Meals for selected date'}

                  </h2>

                </div>

                <div className="meal-heading-actions">

                  <input

                    className="meal-date-input"

                    type="date"

                    value={selectedDate}

                    max={getLocalDateString()}

                    onChange={(event) =>

                      setSelectedDate(event.target.value)

                    }

                    aria-label="Select meal date"

                  />

                  <button

                    className="primary-button compact"

                    onClick={() =>

                      setShowMealForm((current) => !current)

                    }

                    disabled={savingMeal}

                  >

                    {showMealForm ? (

                      <X size={16} />

                    ) : (

                      <Plus size={16} />

                    )}

                    {showMealForm ? 'Cancel' : 'Add meal'}

                  </button>

                </div>

              </div>

              {showMealForm && (

                <form className="meal-form" onSubmit={addMeal}>

                  <label>

                    Meal name

                    <input

                      value={mealName}

                      onChange={(event) =>

                        setMealName(event.target.value)

                      }

                      placeholder="e.g. Paneer sandwich"

                      maxLength={100}

                      required

                    />

                  </label>

                  <div className="form-two-col">

                    <label>

                      Calories (kcal)

                      <input

                        type="number"

                        min="0"

                        step="any"

                        value={mealCalories}

                        onChange={(event) =>

                          setMealCalories(event.target.value)

                        }

                        placeholder="350"

                        required

                      />

                    </label>

                    <label>

                      Protein (g)

                      <input

                        type="number"

                        min="0"

                        step="any"

                        value={mealProtein}

                        onChange={(event) =>

                          setMealProtein(event.target.value)

                        }

                        placeholder="20"

                      />

                    </label>

                    <label>

                      Carbs (g)

                      <input

                        type="number"

                        min="0"

                        step="any"

                        value={mealCarbs}

                        onChange={(event) =>

                          setMealCarbs(event.target.value)

                        }

                        placeholder="35"

                      />

                    </label>

                    <label>

                      Fat (g)

                      <input

                        type="number"

                        min="0"

                        step="any"

                        value={mealFat}

                        onChange={(event) =>

                          setMealFat(event.target.value)

                        }

                        placeholder="10"

                      />

                    </label>

                  </div>

                  <button

                    className="primary-button"

                    type="submit"

                    disabled={savingMeal}

                  >

                    <Plus size={16} />

                    {savingMeal ? 'Saving...' : 'Save meal'}

                  </button>

                </form>

              )}

              <div className="meal-list">

                {loadingMeals && (

                  <p className="empty-meals">

                    Loading meals from MongoDB...

                  </p>

                )}

                {!loadingMeals &&

                  !apiError &&

                  meals.length === 0 && (

                    <p className="empty-meals">

                      No meals found. Add your first meal to get started.

                    </p>

                  )}

                {meals.map((meal) => (

                  <div className="meal-item" key={meal._id}>

                    <div className={`meal-emoji ${meal.color}`}>

                      {meal.icon}

                    </div>

                    <div className="meal-info">

                      <strong>{meal.name}</strong>

                      <span>

                        {meal.time} · {meal.category}

                      </span>

                    </div>

                    <div className="meal-calories">

                      <strong>{meal.calories}</strong>

                      <span>kcal</span>

                    </div>

                    <button

                      className="remove-meal"

                      aria-label={`Remove ${meal.name}`}

                      disabled={

                        deletingMealId !== null || savingMeal

                      }

                      onClick={() => handleDeleteMeal(meal)}

                    >

                      {deletingMealId === meal._id ? (

                        <span>...</span>

                      ) : (

                        <X size={15} />

                      )}

                    </button>

                  </div>

                ))}

              </div>

              <p className="sample-disclaimer">

                Meals and daily nutrition totals are loaded from MongoDB

                for the selected date. Water intake and weekly chart data

                are still demonstration data.

              </p>

            </article>

            <article className="panel water-panel">

              <div className="panel-heading">

                <div>

                  <span className="panel-kicker">

                    STAY HYDRATED

                  </span>

                  <h2>Water tracker</h2>

                </div>

                <div className="water-icon">

                  <Droplets size={20} />

                </div>

              </div>

              <div className="water-count">

                <strong>{water * 250}</strong>

                <span> / {waterGoal * 250} ml</span>

              </div>

              <p className="water-subtitle">

                One glass at a time.

              </p>

              <div className="water-glasses">

                {Array.from(

                  { length: waterGoal },

                  (_, index) => (

                    <button

                      key={index}

                      className={`water-glass ${

                        index < water ? 'filled' : ''

                      }`}

                      aria-label={`Set water intake to ${

                        index + 1

                      } glasses`}

                      onClick={() => setWater(index + 1)}

                    >

                      <Droplets size={21} />

                    </button>

                  )

                )}

              </div>

              <div className="water-actions">

                <button

                  className="water-add"

                  onClick={() =>

                    setWater((current) =>

                      Math.min(waterGoal, current + 1)

                    )

                  }

                  disabled={water >= waterGoal}

                >

                  <Plus size={16} /> Add a glass

                </button>

                <button

                  className="water-reset"

                  onClick={() => setWater(0)}

                >

                  Reset

                </button>

              </div>

              <div className="hydration-note">

                <Sparkles size={16} />

                <span>

                  You're building a healthy habit. Keep going!

                </span>

              </div>

            </article>

          </section>

          </>

          )}

          <footer className="dashboard-footer">

            <span>© {new Date().getFullYear()} NutriVibe</span>

            <span>

              <Heart size={13} /> Built for healthier everyday choices

            </span>

            <span className="demo-label">

              DEMO DATA · NOT MEDICAL ADVICE

            </span>

          </footer>

        </div>

      </main>

    </div>

  );

}

export default App;
