# 🏗️ small_project — Step by Step Build Guide
### Har step chhota hai, har step ka reason bata gaya hai

---

## 🧭 Pehle Ye Samjho — Build Order Kyu Yahi Hai?

```
SETUP → BACKEND → FRONTEND
           ↓
    Config → Models → Middleware → Controllers → Routes → server.js
```

**Rule:** Jo cheez doosri cheez "USE" karti hai, woh BAAD mein banao.
- Controller, Model use karta hai → Model PEHLE
- Route, Controller use karta hai → Controller PEHLE
- server.js, Route use karta hai → Route PEHLE

---

# ✅ PART A — PROJECT SETUP

---

## STEP 1 — Folder Structure Banao

Naya folder banao `C:\Users\admin\Desktop\project\small_project\`

Andar ye structure banao:
```
small_project/
├── backend/
└── frontend/
```

**VS Code mein karo:** File → Open Folder → `small_project` select karo

---

## STEP 2 — Backend Initialize Karo

**Terminal mein (backend folder mein):**
```bash
cd C:\Users\admin\Desktop\project\small_project\backend
npm init -y
```

`npm init -y` kya karta hai?
→ `package.json` file banta hai jisme project ki info hoti hai.
`-y` matlab sab defaults accept karo, kuch puchho mat.

---

## STEP 3 — Backend Packages Install Karo

```bash
npm install express mongoose bcryptjs jsonwebtoken cors dotenv multer axios
npm install -D nodemon
```

**Kya install kiya aur kyu:**
| Package | Kaam |
|---------|------|
| `express` | Web server banana ke liye |
| `mongoose` | MongoDB se baat karne ke liye |
| `bcryptjs` | Password encrypt karne ke liye |
| `jsonwebtoken` | Login token (JWT) banana ke liye |
| `cors` | Frontend ko backend se baat karne dene ke liye |
| `dotenv` | `.env` file se variables padhne ke liye |
| `multer` | File/image upload ke liye |
| `axios` | External APIs call karne ke liye |
| `nodemon` | Code change hone par server auto-restart ke liye |

---

## STEP 4 — `package.json` Update Karo

`backend/package.json` file kholo aur type add karo:

```json
{
  "name": "small-project-backend",
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "nodemon server.js",
    "start": "node server.js"
  }
}
```

**`"type": "module"` kyu?**
→ Taaki `import/export` syntax use kar sako (modern JavaScript).
Without this, aapko `require()` use karna padta (old style).

---

## STEP 5 — `.env` File Banao

**File:** `backend/.env`

```env
PORT=5001
MONGO_URI=mongodb+srv://mananjha643_db_user:rFiAwYYfOYXYxouL@cluster0.jlsdmut.mongodb.net/SmallProject?appName=Cluster0
JWT_SECRET=myjwtsecretkey123456
GEMINI_API_KEY=AIzaSyDEJaGe5K6qRzuQ7cK7_Lot2wTNrhHTVIs
```

> ⚠️ `.env` file kabhi GitHub pe push mat karo!

---

# ✅ PART B — BACKEND CONFIG

---

## STEP 6 — `config/db.js` Banao

**File:** `backend/config/db.js`

```javascript
import mongoose from "mongoose";

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error("MongoDB connection failed:", error.message);
    process.exit(1); // DB nahi mila toh app band karo
  }
};

export default connectDB;
```

---

# ✅ PART C — MODELS (Database Blueprints)

---

## STEP 7 — `models/User.js` Banao

**File:** `backend/models/User.js`

**Kyu pehle:** User sabse zaroori hai. Baaki sab models User ko reference karte hain.

```javascript
import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const UserSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    phone: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
      select: false, // password automatically query mein nahi aayega (security)
    },

    // 3 Roles hamare project mein
    role: {
      type: String,
      enum: ["USER", "ADMIN", "SUPER ADMIN"],
      default: "USER",
    },

    // ── Credit Point Tracking ──
    credits: { type: Number, default: 0 }, // total remaining credits
    totalCreditsUsed: { type: Number, default: 0 },
    currentActivePlan: { type: String, default: "FREE" },
    boughtPlans: { type: [String], default: [] },
    numberOfPlansBought: { type: Number, default: 0 },

    // ── Mandatory Audit Fields ──
    isActive: { type: Number, default: 0 }, // 0 = Active, 1 = Soft-deleted
    disabledOn: { type: Date, default: null },
    disabledBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    createdOn: { type: Date, default: Date.now },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    modifiedOn: { type: Date, default: null },
    modifiedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    createdByName: { type: String, default: "" },
    modifiedByName: { type: String, default: "" },
    disabledByName: { type: String, default: "" },
  },
  {
    timestamps: true, // createdAt aur updatedAt auto add hoga
  }
);

// Password save karne se pehle hash karo (encrypt karo)
UserSchema.pre("save", async function () {
  if (!this.isModified("password")) return; // sirf tabhi hash karo jab password badla ho
  this.password = await bcrypt.hash(this.password, 12);
});

// Login ke waqt password compare karne ka method
UserSchema.methods.comparePassword = function (enteredPassword) {
  return bcrypt.compare(enteredPassword, this.password);
};

export default mongoose.model("User", UserSchema);
```

**Naye concepts:**
- `select: false` → Sensitive data hide karna
- `pre("save")` → Save hone se PEHLE kuch karo (hook)
- `methods.comparePassword` → Model pe custom function add karna

---

## STEP 8 — `models/SubscriptionPlan.js` Banao

**File:** `backend/models/SubscriptionPlan.js`

**Kyu:** Ye "plan catalog" hai — Basic, Pro, Enterprise plans ka master data.

```javascript
import mongoose from "mongoose";

const SubscriptionPlanSchema = new mongoose.Schema(
  {
    planName: {
      type: String,
      required: true,
      // Example: "Basic", "Pro", "Enterprise"
    },
    price: {
      type: Number,
      required: true,
      default: 0,
    },
    credits: {
      type: Number,
      required: true,
      default: 100, // is plan mein kitne credits milenge
    },
    durationDays: {
      type: Number,
      required: true,
      default: 30, // plan kitne din ka hai
    },
    features: [
      {
        type: String, // ["Canvas Editor", "Depth Editor", "Jewellery"] etc.
      },
    ],
    // ── Mandatory Audit Fields ──
    isActive: { type: Number, default: 0 }, // 0 = Active, 1 = Soft-deleted
    disabledOn: { type: Date, default: null },
    disabledBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    createdOn: { type: Date, default: Date.now },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    modifiedOn: { type: Date, default: null },
    modifiedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    createdByName: { type: String, default: "" },
    modifiedByName: { type: String, default: "" },
    disabledByName: { type: String, default: "" },
  },
  { timestamps: true }
);

export default mongoose.model("SubscriptionPlan", SubscriptionPlanSchema);
```

---

## STEP 9 — `models/UserSubscription.js` Banao

**File:** `backend/models/UserSubscription.js`

**Kyu:** Ye record hai ki kaun sa USER kaun sa PLAN le raha hai.
(SubscriptionPlan aur User ko link karta hai)

```javascript
import mongoose from "mongoose";

const UserSubscriptionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",       // User model se link
      required: true,
    },
    userName: { type: String, default: "" },
    userEmail: { type: String, default: "" },

    planId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "SubscriptionPlan", // SubscriptionPlan model se link
      default: null,
    },
    planName: { type: String, required: true },
    pricePaid: { type: String, required: true },

    // Credits
    baseCreditsAllocated: { type: Number, default: 0 },
    baseCreditsUsed: { type: Number, default: 0 },

    purchaseDate: { type: Date, default: Date.now },
    expiresAt: { type: Date, default: null },

    // ── Mandatory Audit Fields ──
    isActive: { type: Number, default: 0 }, // 0 = Active, 1 = Soft-deleted
    disabledOn: { type: Date, default: null },
    disabledBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    createdOn: { type: Date, default: Date.now },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    modifiedOn: { type: Date, default: null },
    modifiedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    createdByName: { type: String, default: "" },
    modifiedByName: { type: String, default: "" },
    disabledByName: { type: String, default: "" },
  },
  { timestamps: true }
);

export default mongoose.model("UserSubscription", UserSubscriptionSchema);
```

**Naya concept:** `ref: "User"` → MongoDB mein JOIN jaise kaam karta hai.
Baad mein `.populate("userId")` se poora User object aa sakta hai.

---

## STEP 10 — `models/CreditHistory.js` Banao

**File:** `backend/models/CreditHistory.js`

**Kyu:** Har user ka credit summary track karne ke liye.

```javascript
import mongoose from "mongoose";

const CreditHistorySchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true, // Ek user ka sirf EK summary record hoga
    },
    userName: { type: String, default: "" },
    userEmail: { type: String, default: "" },

    totalCreditsUsed: { type: Number, default: 0 },

    // Kaun kaun se plans kharide
    boughtPlans: { type: [String], default: [] },
    numberOfPlans: { type: Number, default: 0 },
    currentActivePlan: { type: String, default: "FREE" },
    totalAvailableCredits: { type: Number, default: 0 },

    // Feature wise count
    imageCount: { type: Number, default: 0 },
    videoCount: { type: Number, default: 0 },
    themeCount: { type: Number, default: 0 },

    // ── Mandatory Audit Fields ──
    isActive: { type: Number, default: 0 }, // 0 = Active, 1 = Soft-deleted
    disabledOn: { type: Date, default: null },
    disabledBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    createdOn: { type: Date, default: Date.now },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    modifiedOn: { type: Date, default: null },
    modifiedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    createdByName: { type: String, default: "" },
    modifiedByName: { type: String, default: "" },
    disabledByName: { type: String, default: "" },
  },
  { timestamps: true }
);

export default mongoose.model("CreditHistory", CreditHistorySchema);
```

---

## STEP 11 — `models/RoleAccess.js` Banao

**File:** `backend/models/RoleAccess.js`

**Kyu:** Role-wise permissions control karne ke liye.
(Admin ko kaun sa module access hai, User ko kaun sa)

```javascript
import mongoose from "mongoose";

const RoleAccessSchema = new mongoose.Schema(
  {
    role: {
      type: String,
      enum: ["USER", "ADMIN", "SUPER ADMIN"],
      required: true,
    },
    module: {
      type: String,
      required: true,
      // Example: "canvas-editor", "depth-editor", "jewellery-configurator"
    },
    canView: { type: Boolean, default: false },
    canCreate: { type: Boolean, default: false },
    canEdit: { type: Boolean, default: false },
    canDelete: { type: Boolean, default: false },

    // ── Mandatory Audit Fields ──
    isActive: { type: Number, default: 0 }, // 0 = Active, 1 = Soft-deleted
    disabledOn: { type: Date, default: null },
    disabledBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    createdOn: { type: Date, default: Date.now },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    modifiedOn: { type: Date, default: null },
    modifiedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    createdByName: { type: String, default: "" },
    modifiedByName: { type: String, default: "" },
    disabledByName: { type: String, default: "" },
  },
  { timestamps: true }
);

export default mongoose.model("RoleAccess", RoleAccessSchema);
```

---

## STEP 12 — `models/Module.js` Banao

**File:** `backend/models/Module.js`

**Kyu:** Sabhi modules (features) ka list store karne ke liye.

```javascript
import mongoose from "mongoose";

const ModuleSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      // Example: "Canvas Editor", "Depth Editor", "Jewellery Configurator"
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      // Example: "canvas-editor", "depth-editor"
    },
    icon: { type: String, default: "" },
    path: { type: String, default: "" }, // URL path
    
    // ── Mandatory Audit Fields ──
    isActive: { type: Number, default: 0 }, // 0 = Active, 1 = Soft-deleted
    disabledOn: { type: Date, default: null },
    disabledBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    createdOn: { type: Date, default: Date.now },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    modifiedOn: { type: Date, default: null },
    modifiedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    createdByName: { type: String, default: "" },
    modifiedByName: { type: String, default: "" },
    disabledByName: { type: String, default: "" },
  },
  { timestamps: true }
);

export default mongoose.model("Module", ModuleSchema);
```

---

# ✅ PART D — MIDDLEWARE

---

## STEP 13 — `middleware/authMiddleware.js` Banao

**File:** `backend/middleware/authMiddleware.js`

**Kyu:** Har protected route pe JWT token verify karna.

```javascript
import jwt from "jsonwebtoken";
import User from "../models/User.js";

// ── Koi bhi logged-in user access kar sakta hai ──
export const authMiddleware = async (req, res, next) => {
  try {
    // Header se token nikalo
    const token = req.headers.authorization?.split(" ")[1];
    // Authorization: "Bearer eyJhbGci..."
    //                          ↑ index 1

    if (!token) {
      return res.status(401).json({ message: "Access denied. No token." });
    }

    // Token verify karo
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // User DB se fetch karo (latest data ke liye)
    const user = await User.findById(decoded.id).select("-password");
    if (!user) {
      return res.status(401).json({ message: "User not found." });
    }

    req.user = user; // Agle middleware/controller ke liye user attach karo
    next(); // Aage badhne do
  } catch (err) {
    return res.status(401).json({ message: "Invalid or expired token." });
  }
};

// ── Sirf ADMIN aur SUPER ADMIN ──
export const adminMiddleware = (req, res, next) => {
  if (!["ADMIN", "SUPER ADMIN"].includes(req.user?.role)) {
    return res.status(403).json({ message: "Admin access required." });
  }
  next();
};

// ── Sirf SUPER ADMIN ──
export const superAdminMiddleware = (req, res, next) => {
  if (req.user?.role !== "SUPER ADMIN") {
    return res.status(403).json({ message: "Super Admin access required." });
  }
  next();
};
```

---

# ✅ PART E — CONTROLLERS

---

## STEP 14 — `controllers/authController.js` Banao

**File:** `backend/controllers/authController.js`

**Kyu pehle:** Login/Register ke bina kuch bhi test nahi ho sakta.

```javascript
import User from "../models/User.js";
import jwt from "jsonwebtoken";

// Token generate karne ka helper function
const generateToken = (userId) => {
  return jwt.sign(
    { id: userId },           // token mein kya store karein
    process.env.JWT_SECRET,   // secret key
    { expiresIn: "7d" }       // 7 din mein expire hoga
  );
};

// ── REGISTER ──────────────────────────────────
export const register = async (req, res) => {
  try {
    const { name, email, phone, password } = req.body;

    // Email already hai?
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email already registered." });
    }

    // Naya user banao
    const user = await User.create({ name, email, phone, password });

    // Token generate karo
    const token = generateToken(user._id);

    res.status(201).json({
      message: "Registered successfully!",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        credits: user.credits,
      },
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ── LOGIN ─────────────────────────────────────
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // User dhundho (password bhi include karo — select: false tha)
    const user = await User.findOne({ email }).select("+password");
    if (!user) {
      return res.status(400).json({ message: "Invalid email or password." });
    }

    // Password match karo
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid email or password." });
    }

    const token = generateToken(user._id);

    res.json({
      message: "Login successful!",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        credits: user.credits,
      },
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ── GET CURRENT USER (/api/auth/me) ───────────
export const getMe = async (req, res) => {
  // authMiddleware ne req.user set kiya hoga
  res.json(req.user);
};
```

---

## STEP 15 — `controllers/subscriptionController.js` Banao

**File:** `backend/controllers/subscriptionController.js`

```javascript
import UserSubscription from "../models/UserSubscription.js";
import SubscriptionPlan from "../models/SubscriptionPlan.js";
import User from "../models/User.js";
import CreditHistory from "../models/CreditHistory.js";

// ── Plan kharido ───────────────────────────────
export const purchasePlan = async (req, res) => {
  try {
    const { planId } = req.body;
    const userId = req.user._id;

    // Plan dhundho
    const plan = await SubscriptionPlan.findById(planId);
    if (!plan) return res.status(404).json({ message: "Plan not found" });

    // Subscription create karo
    const expiry = new Date();
    expiry.setDate(expiry.getDate() + plan.durationDays);

    const subscription = await UserSubscription.create({
      userId,
      userName: req.user.name,
      userEmail: req.user.email,
      planId: plan._id,
      planName: plan.planName,
      pricePaid: plan.price.toString(),
      baseCreditsAllocated: plan.credits,
      expiresAt: expiry,
    });

    // User ke credits update karo
    await User.findByIdAndUpdate(userId, {
      $inc: { credits: plan.credits },
    });

    // CreditHistory update karo
    await CreditHistory.findOneAndUpdate(
      { user: userId },
      {
        $set: { currentActivePlan: plan.planName },
        $inc: {
          numberOfPlans: 1,
          totalAvailableCredits: plan.credits,
        },
        $push: { boughtPlans: plan.planName },
        $setOnInsert: { userName: req.user.name, userEmail: req.user.email },
      },
      { upsert: true, new: true }
    );

    res.json({ success: true, subscription });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ── Meri subscriptions dekho ──────────────────
export const getMySubscriptions = async (req, res) => {
  try {
    const subs = await UserSubscription.find({
      userId: req.user._id,
      isActive: 0,
    }).sort({ createdAt: -1 });

    res.json(subs);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
```

---

## STEP 16 — `controllers/creditController.js` Banao

**File:** `backend/controllers/creditController.js`

```javascript
import User from "../models/User.js";
import UserSubscription from "../models/UserSubscription.js";
import CreditHistory from "../models/CreditHistory.js";

// ── Credits use karo (deduct) ─────────────────
export const deductCredits = async (req, res) => {
  try {
    const { amount, feature } = req.body;
    // feature: "image", "video", "theme"

    const user = await User.findById(req.user._id);

    if (user.credits < amount) {
      return res.status(400).json({ message: "Insufficient credits" });
    }

    // User ke credits ghataao
    user.credits -= amount;
    await user.save();

    // Active subscription mein bhi ghataao
    const activeSub = await UserSubscription.findOne({
      userId: req.user._id,
      isActive: 0,
    });
    if (activeSub) {
      activeSub.baseCreditsUsed += amount;
      await activeSub.save();
    }

    // CreditHistory update karo
    const historyUpdate = { $inc: { totalCreditsUsed: amount } };
    if (feature === "image") historyUpdate.$inc.imageCount = 1;
    if (feature === "video") historyUpdate.$inc.videoCount = 1;
    if (feature === "theme") historyUpdate.$inc.themeCount = 1;

    await CreditHistory.findOneAndUpdate({ user: req.user._id }, historyUpdate);

    res.json({ success: true, newBalance: user.credits });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ── Credit history dekho ──────────────────────
export const getCreditHistory = async (req, res) => {
  try {
    const history = await CreditHistory.findOne({ user: req.user._id });
    res.json(history || {});
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
```

---

## STEP 17 — `controllers/planController.js` Banao

**File:** `backend/controllers/planController.js`

```javascript
import SubscriptionPlan from "../models/SubscriptionPlan.js";

// ── Sabhi plans dekho (public) ────────────────
export const getAllPlans = async (req, res) => {
  try {
    const plans = await SubscriptionPlan.find({ isActive: 0 });
    res.json(plans);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ── Naya plan banao (Admin only) ──────────────
export const createPlan = async (req, res) => {
  try {
    const { planName, price, credits, durationDays, features } = req.body;
    const plan = await SubscriptionPlan.create({
      planName, price, credits, durationDays, features,
    });
    res.status(201).json(plan);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ── Plan delete karo (Admin only) ─────────────
export const deletePlan = async (req, res) => {
  try {
    await SubscriptionPlan.findByIdAndUpdate(req.params.id, { isActive: 1 });
    res.json({ message: "Plan deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
```

---

## STEP 18 — `controllers/roleAccessController.js` Banao

**File:** `backend/controllers/roleAccessController.js`

```javascript
import RoleAccess from "../models/RoleAccess.js";

// ── Ek role ka access dekho ───────────────────
export const getRoleAccess = async (req, res) => {
  try {
    const { role } = req.params;
    const access = await RoleAccess.find({ role });
    res.json(access);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ── Role access update/create karo (Super Admin) ──
export const upsertRoleAccess = async (req, res) => {
  try {
    const { role, module, canView, canCreate, canEdit, canDelete } = req.body;

    const access = await RoleAccess.findOneAndUpdate(
      { role, module },
      { canView, canCreate, canEdit, canDelete },
      { upsert: true, new: true } // nahi mila toh banao, mila toh update karo
    );

    res.json(access);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
```

---

# ✅ PART F — ROUTES

---

## STEP 19 — `routes/authRoutes.js` Banao

**File:** `backend/routes/authRoutes.js`

```javascript
import express from "express";
import { register, login, getMe } from "../controllers/authController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";

const router = express.Router();

// POST /api/auth/register
router.post("/register", register);

// POST /api/auth/login
router.post("/login", login);

// GET /api/auth/me  ← authMiddleware protected (login zaroori)
router.get("/me", authMiddleware, getMe);

export default router;
```

---

## STEP 20 — `routes/planRoutes.js` Banao

**File:** `backend/routes/planRoutes.js`

```javascript
import express from "express";
import { getAllPlans, createPlan, deletePlan } from "../controllers/planController.js";
import { authMiddleware, adminMiddleware } from "../middleware/authMiddleware.js";

const router = express.Router();

// GET /api/plans  ← koi bhi dekh sakta hai
router.get("/", getAllPlans);

// POST /api/plans  ← sirf Admin
router.post("/", authMiddleware, adminMiddleware, createPlan);

// DELETE /api/plans/:id  ← sirf Admin
router.delete("/:id", authMiddleware, adminMiddleware, deletePlan);

export default router;
```

---

## STEP 21 — `routes/subscriptionRoutes.js` Banao

**File:** `backend/routes/subscriptionRoutes.js`

```javascript
import express from "express";
import { purchasePlan, getMySubscriptions } from "../controllers/subscriptionController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";

const router = express.Router();

// POST /api/subscriptions/purchase  ← login zaroori
router.post("/purchase", authMiddleware, purchasePlan);

// GET /api/subscriptions/mine  ← login zaroori
router.get("/mine", authMiddleware, getMySubscriptions);

export default router;
```

---

## STEP 22 — `routes/creditRoutes.js` Banao

**File:** `backend/routes/creditRoutes.js`

```javascript
import express from "express";
import { deductCredits, getCreditHistory } from "../controllers/creditController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";

const router = express.Router();

// POST /api/credits/deduct
router.post("/deduct", authMiddleware, deductCredits);

// GET /api/credits/history
router.get("/history", authMiddleware, getCreditHistory);

export default router;
```

---

## STEP 23 — `routes/roleAccessRoutes.js` Banao

**File:** `backend/routes/roleAccessRoutes.js`

```javascript
import express from "express";
import { getRoleAccess, upsertRoleAccess } from "../controllers/roleAccessController.js";
import { authMiddleware, superAdminMiddleware } from "../middleware/authMiddleware.js";

const router = express.Router();

// GET /api/role-access/:role  ← Admin ko dikhao
router.get("/:role", authMiddleware, getRoleAccess);

// POST /api/role-access  ← sirf Super Admin
router.post("/", authMiddleware, superAdminMiddleware, upsertRoleAccess);

export default router;
```

---

# ✅ PART G — SERVER.JS (Sab kuch jodhna)

---

## STEP 24 — `server.js` Banao

**File:** `backend/server.js`

```javascript
import "dotenv/config";         // .env load karo sabse pehle
import express from "express";
import cors from "cors";
import connectDB from "./config/db.js";

// ── Routes Import ───────────────────────────────
import authRoutes from "./routes/authRoutes.js";
import planRoutes from "./routes/planRoutes.js";
import subscriptionRoutes from "./routes/subscriptionRoutes.js";
import creditRoutes from "./routes/creditRoutes.js";
import roleAccessRoutes from "./routes/roleAccessRoutes.js";

// ── App Setup ───────────────────────────────────
const app = express();
app.use(cors());                              // Frontend se requests allow karo
app.use(express.json({ limit: "100mb" }));    // JSON body parse karo
app.use(express.urlencoded({ extended: true }));

// ── Database Connect ────────────────────────────
connectDB();

// ── Routes Register ─────────────────────────────
app.use("/api/auth", authRoutes);             // /api/auth/login, /api/auth/register
app.use("/api/plans", planRoutes);            // /api/plans
app.use("/api/subscriptions", subscriptionRoutes); // /api/subscriptions/purchase
app.use("/api/credits", creditRoutes);        // /api/credits/deduct
app.use("/api/role-access", roleAccessRoutes); // /api/role-access/:role

// ── Test Route ──────────────────────────────────
app.get("/", (req, res) => {
  res.send("Small Project Backend Running! ✅");
});

// ── Start Server ────────────────────────────────
const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
```

---

## STEP 25 — Backend Test Karo

**Terminal mein:**
```bash
cd C:\Users\admin\Desktop\project\small_project\backend
npm run dev
```

**Check karo:**
```
Server running on port 5001  ✅
MongoDB Connected: ...        ✅
```

**Browser mein:** `http://localhost:5001/` → `"Small Project Backend Running! ✅"` dikhna chahiye

---

# ✅ PART H — BACKEND COMPLETE! Ab Anchal Features Add Karo

---

## STEP 26 — trendyRoutes + trendyController Copy Karo

```
anchal/backend/controllers/trendyController.js
  → small_project/backend/controllers/trendyController.js

anchal/backend/routes/trendyRoutes.js
  → small_project/backend/routes/trendyRoutes.js
```

**Fir server.js mein add karo:**
```javascript
import trendyRoutes from "./routes/trendyRoutes.js";
app.use("/api/trendy", trendyRoutes);
```

---

## STEP 27 — jewelleryController + jewelleryRoutes Copy Karo

```
anchal/backend/controllers/jewelleryController.js
  → small_project/backend/controllers/jewelleryController.js

anchal/backend/routes/jewelleryRoutes.js
  → small_project/backend/routes/jewelleryRoutes.js
```

**Fir server.js mein add karo:**
```javascript
import jewelleryRoutes from "./routes/jewelleryRoutes.js";
app.use("/api/jewellery", jewelleryRoutes);
```

---

# ✅ PART I — FRONTEND SETUP

---

## STEP 28 — Frontend Initialize Karo

**Terminal mein (small_project folder mein):**
```bash
cd C:\Users\admin\Desktop\project\small_project
npm create vite@latest frontend -- --template react
cd frontend
npm install
npm install axios react-router-dom @mui/material @emotion/react @emotion/styled
```

---

## STEP 29 — Frontend `.env` Banao

**File:** `small_project/frontend/.env`
```env
VITE_API_URL=http://localhost:5001/api
```

---

## STEP 30 — Files Copy Karo (current_project se)

```
current_project/n_frontend/src/pages/auth/
  ├── AuthContext.jsx    → small_project/frontend/src/pages/auth/
  ├── Login.jsx          → small_project/frontend/src/pages/auth/
  ├── Register.jsx       → small_project/frontend/src/pages/auth/
  └── AdminRoute.jsx     → small_project/frontend/src/pages/auth/
```

**Pages copy karo:**
```
current_project/n_frontend/src/pages/
  ├── UserDashboard.jsx  → frontend/src/pages/
  ├── PricingPage.jsx    → frontend/src/pages/
  ├── RoleAccess.jsx     → frontend/src/pages/
  ├── AdminPricingPage.jsx → frontend/src/pages/
  └── UserCreation.jsx   → frontend/src/pages/
```

**anchal se copy karo:**
```
anchal/frontend/src/pages/
  ├── DepthEditorPage.jsx  → frontend/src/pages/
  └── ProductConfigurator.jsx → frontend/src/pages/
```

---

## STEP 31 — `SuperAdminRoute.jsx` Banao

**File:** `frontend/src/pages/auth/SuperAdminRoute.jsx`

```jsx
import { Navigate } from "react-router-dom";
import { useAuth } from "./AuthContext";

function SuperAdminRoute({ children }) {
  const { user } = useAuth();

  if (!user) return <Navigate to="/login" replace />;
  if (user.role !== "SUPER ADMIN") return <Navigate to="/" replace />;

  return children;
}

export default SuperAdminRoute;
```

---

## STEP 32 — `App.jsx` Routes Banao

**File:** `frontend/src/App.jsx`

```jsx
import { Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import AdminRoute from "./pages/auth/AdminRoute";
import SuperAdminRoute from "./pages/auth/SuperAdminRoute";
import UserDashboard from "./pages/UserDashboard";
import PricingPage from "./pages/PricingPage";
import RoleAccess from "./pages/RoleAccess";
import DepthEditorPage from "./pages/DepthEditorPage";
import ProductConfigurator from "./pages/ProductConfigurator";
import AdminPricingPage from "./pages/AdminPricingPage";
import UserCreation from "./pages/UserCreation";

function App() {
  return (
    <Routes>
      {/* ── Public ─────────────────────── */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/pricing" element={<PricingPage />} />

      {/* ── Logged In User ─────────────── */}
      <Route path="/dashboard" element={
        <AdminRoute><UserDashboard /></AdminRoute>
      } />
      <Route path="/depth-editor" element={
        <AdminRoute><DepthEditorPage /></AdminRoute>
      } />
      <Route path="/jewellery-configurator" element={
        <AdminRoute><ProductConfigurator isAdminView={false} /></AdminRoute>
      } />

      {/* ── Admin ──────────────────────── */}
      <Route path="/admin/pricing" element={
        <AdminRoute><AdminPricingPage /></AdminRoute>
      } />
      <Route path="/admin/users" element={
        <AdminRoute><UserCreation /></AdminRoute>
      } />
      <Route path="/admin/jewellery-configurator" element={
        <AdminRoute><ProductConfigurator isAdminView={true} /></AdminRoute>
      } />

      {/* ── Super Admin ────────────────── */}
      <Route path="/roleaccess" element={
        <SuperAdminRoute><RoleAccess /></SuperAdminRoute>
      } />

      {/* ── Default ────────────────────── */}
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}

export default App;
```

---

## STEP 33 — Frontend Start Karo

```bash
cd C:\Users\admin\Desktop\project\small_project\frontend
npm run dev
```

Browser: `http://localhost:5173`

---

# 📋 Final Build Order Summary

```
STEP  1  → Folder structure banao
STEP  2  → npm init (backend)
STEP  3  → Packages install karo
STEP  4  → package.json: type:module add karo
STEP  5  → .env file banao
STEP  6  → config/db.js banao
──── MODELS ────────────────────────────────────────
STEP  7  → models/User.js           ← PEHLE (sabka base)
STEP  8  → models/SubscriptionPlan.js
STEP  9  → models/UserSubscription.js ← User + Plan use karta hai
STEP 10  → models/CreditHistory.js
STEP 11  → models/RoleAccess.js
STEP 12  → models/Module.js
──── MIDDLEWARE ─────────────────────────────────────
STEP 13  → middleware/authMiddleware.js ← User model use karta hai
──── CONTROLLERS ────────────────────────────────────
STEP 14  → controllers/authController.js     ← PEHLE
STEP 15  → controllers/subscriptionController.js
STEP 16  → controllers/creditController.js
STEP 17  → controllers/planController.js
STEP 18  → controllers/roleAccessController.js
──── ROUTES ─────────────────────────────────────────
STEP 19  → routes/authRoutes.js
STEP 20  → routes/planRoutes.js
STEP 21  → routes/subscriptionRoutes.js
STEP 22  → routes/creditRoutes.js
STEP 23  → routes/roleAccessRoutes.js
──── SERVER ─────────────────────────────────────────
STEP 24  → server.js banao + sab register karo ← AAKHIR MEIN
STEP 25  → Backend test karo (npm run dev)
──── ANCHAL FEATURES ────────────────────────────────
STEP 26  → trendyController + trendyRoutes copy karo
STEP 27  → jewelleryController + jewelleryRoutes copy karo
──── FRONTEND ───────────────────────────────────────
STEP 28  → Vite project init
STEP 29  → .env banao
STEP 30  → Pages copy karo
STEP 31  → SuperAdminRoute.jsx banao
STEP 32  → App.jsx routes banao
STEP 33  → Frontend start karo
```
