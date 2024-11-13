import { StableBTreeMap } from "azle";
import cors from "cors";
import express, { Request, Response } from "express";
import { validate } from "uuid";

type User = {
  id: string;
  points: number;
};

type PointsPayload = {
  points: number;
};

const userPoints = StableBTreeMap<string, User>(0);

const app = express();
app.use(express.json());
app.use(cors());

app.post("/users", (req: Request, res: Response) => {
  if (!req.body.userId) {
    res.status(400).json({
      message: `Wavv userId is required.`,
    });
    return;
  }

  if (!validate(req.body.userId)) {
    res.status(400).json({
      message: `Wavv userId should a valid uuid.`,
    });
    return;
  }

  const userId = req.body.userId;
  const user = userPoints.get(userId);

  if (user) {
    res.status(429).json({
      message: "User already exist.",
    });
  }


  const newUser = {
    id: userId,
    points: 0,
  };

  userPoints.insert(userId, newUser);
  res.status(201).json(newUser);
});

app.get("/users/:userId", (req: Request, res: Response) => {
  const userId = req.params.userId;
  const user = userPoints.get(userId);

  if (!user) {
    res.status(404).json({
      message: `User not found`,
    });
  }

  res.status(200).json(user);
});

app.post("/users/:userId/increase", (req: Request, res: Response) => {
  const { userId } = req.params;
  const payload = req.body as PointsPayload;
  const user = userPoints.get(userId);

  if (!user) {
    res.status(404).json({
      message: `User not found`,
    });
    return;
  }

  if (typeof payload.points !== "number" || payload.points <= 0) {
    res.status(400).json({
      message: "Points must be a positive number",
    });
    return;
  }

  const updatedUser = {
    ...user,
    points: user.points + payload.points,
  };

  userPoints.insert(userId, updatedUser);
  res.status(200).json(updatedUser);
});

app.post("/users/:userId/decrease", (req: Request, res: Response) => {
  const { userId } = req.params;
  const payload = req.body as PointsPayload;
  const user = userPoints.get(userId);

  if (!user) {
    res.status(404).json({
      message: `User not found`,
    });
    return;
  }

  if (typeof payload.points !== "number" || payload.points <= 0) {
    res.status(400).json({
      message: "Points must be a positive number",
    });
    return;
  }

  const updatedUser = {
    ...user,
    points: user.points - payload.points,
  };

  userPoints.insert(userId, updatedUser);
  res.status(200).json(updatedUser);
});

app.listen();
