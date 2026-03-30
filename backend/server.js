import express from "express";
import cors from "cors";
import { Sequelize, DataTypes } from "sequelize";
import dotenv from "dotenv";
import * as jose from "jose";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Verification
const ASGARDEO_ORG = process.env.ASGARDEO_ORG || "brandonmis372t";
const JWKS_URI = `https://api.asgardeo.io/t/${ASGARDEO_ORG}/oauth2/jwks`;
const ASGARDEO_CLIENT_ID = process.env.ASGARDEO_CLIENT_ID || "ZtwJ3yfdjIts2JtBx4NzAhCX_Pwa"; 

async function authMiddleware(req, res, next) {
  const authHeader = (req.headers.authorization || "").trim();

  if (!authHeader.startsWith("Bearer ")) {
    return res.status(401).json({
      error: "Missing Authorization header",
      detail: "Send Authorization: Bearer <access_token>",
    });
  }

  const token = authHeader.slice(7).trim();
  const looksLikeJwt = token.split(".").length === 3;

  if (!looksLikeJwt) {
    return res.status(401).json({
      error: "Token is not a JWT",
      detail: "Enable JWT access tokens in Asgardeo (Protocol tab)",
    });
  }

  try {
    const JWKS = jose.createRemoteJWKSet(new URL(JWKS_URI));

    const { payload } = await jose.jwtVerify(token, JWKS, {
      issuer: `https://api.asgardeo.io/t/${ASGARDEO_ORG}/oauth2/token`,
      audience: ASGARDEO_CLIENT_ID,
    });

    req.userId = payload.sub;
    return next();
  } catch (err) {
    console.error("JWT verification failed:", err.message);
    return res.status(401).json({
      error: "Invalid or expired token",
      detail: err.message,
    });
  }
}

// Database
const PORT = process.env.PORT || 5001;
const DB_SCHEMA = process.env.DB_SCHEMA || "app";
const useSsl = process.env.PGSSLMODE === "require";

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT) || 5432,
    dialect: "postgres",
    dialectOptions: useSsl
      ? {
          ssl: {
            require: true,
            rejectUnauthorized: false,
          },
        }
      : undefined,
    define: {
      schema: DB_SCHEMA,
    },
  }
);

// Puppies model
const Puppies = sequelize.define(
  "puppies",
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    name: { type: DataTypes.TEXT, allowNull: false },
    breed: { type: DataTypes.TEXT, allowNull: false },
    age: { type: DataTypes.INTEGER, allowNull: false },
    user_id: { type: DataTypes.TEXT, allowNull: false },
  },
  {
    tableName: "puppies",
    timestamps: false,
  }
);


app.use("/puppies", authMiddleware);

// GET all puppies for user
app.get("/puppies", async (req, res) => {
  try {
    const rows = await Puppies.findAll({
      where: { user_id: req.userId },
      order: [["id", "ASC"]],
    });
    res.json(rows);
  } catch (err) {
    console.error("Error fetching puppies:", err);
    res.status(500).json({ error: "Failed to fetch puppies" });
  }
});

// GET single puppy
app.get("/puppies/:id", async (req, res) => {
  try {
    const puppy = await Puppies.findByPk(req.params.id);

    if (!puppy || puppy.user_id !== req.userId) {
      return res.status(404).json({ error: "Puppy not found" });
    }

    res.json(puppy);
  } catch (err) {
    console.error("Error fetching puppy:", err);
    res.status(500).json({ error: "Failed to fetch puppy" });
  }
});


// POST a puppy
app.post("/puppies", async (req, res) => {
  const { name, breed, age } = req.body;

  if (!name || !breed || age === undefined) {
    return res.status(400).json({ error: "Name, breed, and age required" });
  }

  try {
    const puppy = await Puppies.create({
      name,
      breed,
      age,
      user_id: req.userId,
    });

    res.status(201).json(puppy);
  } catch (err) {
    console.error("Error creating puppy:", err);
    res.status(500).json({ error: "Failed to create puppy" });
  }
});

// PUT a puppy
app.put("/puppies/:id", async (req, res) => {
  try {
    const puppy = await Puppies.findByPk(req.params.id);

    if (!puppy || puppy.user_id !== req.userId) {
      return res.status(404).json({ error: "Puppy not found or not yours" });
    }

    await puppy.update(req.body);
    res.json(puppy);
  } catch (err) {
    console.error("Error updating puppy:", err);
    res.status(500).json({ error: "Failed to update puppy" });
  }
});

// DELETE puppy
app.delete("/puppies/:id", async (req, res) => {
  try {
    const puppy = await Puppies.findByPk(req.params.id);

    if (!puppy || puppy.user_id !== req.userId) {
      return res.status(404).json({ error: "Puppy not found or not yours" });
    }

    await puppy.destroy();
    res.json({ message: "Puppy deleted", id: puppy.id });
  } catch (err) {
    console.error("Error deleting puppy:", err);
    res.status(500).json({ error: "Failed to delete puppy" });
  }
});

// Start server
const startServer = async () => {
  try {
    await sequelize.authenticate();
    console.log("Database connected...");

    await Puppies.sync({ alter: true });
    console.log(`Puppies model synced in schema "${DB_SCHEMA}".`);

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (err) {
    console.error("Startup error:", err);
    process.exit(1);
  }
};

startServer();