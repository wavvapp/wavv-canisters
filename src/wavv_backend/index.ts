import { StableBTreeMap } from "azle";
import cors from "cors";
import express, { Request, Response } from "express";
import UserPointsStore from "./services/user.points.store.service";

type User = {
  points: number;
  id?: string;
};

const userPoints = StableBTreeMap<string, User>(0);

const app = express();
app.use(express.json());
app.use(cors());

// Version three
app.post("/v3/users", (req: Request, res: Response) => {
  if (!req.body.id) {
    res.status(400).json({
      message: "Email is required.",
    });
    return;
  }

  const id = req.body.id;
  const user = userPoints.get(id);

  if (!user) {
    const newUser = {
      points: 0,
    };

    userPoints.insert(id, newUser);
    res.status(201).json(newUser);
  }

  res.status(200).json(user);
});

app.get("/v3/users/:id", (req: Request, res: Response) => {
  const { id } = req.params;
  const user = userPoints.get(id);

  if (!user) {
    res.status(404).json({
      message: `User not found`,
    });
  }

  res.status(200).json(user);
});

app.post("/v3/users/:id/increase", (req: Request, res: Response) => {
  const { id } = req.params;
  const payload = req.body as User;
  const user = userPoints.get(id);

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

  userPoints.insert(id, updatedUser);
  res.status(200).json(updatedUser);
});

app.post("/v3/users/:id/decrease", (req: Request, res: Response) => {
  const { id } = req.params;
  const payload = req.body as User;
  const user = userPoints.get(id);

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

  userPoints.insert(id, updatedUser);
  res.status(200).json(updatedUser);
});

app.delete("/v3/users/:id", (req: Request, res: Response) => {
  const { id } = req.params;
  const payload = req.body as User;
  const user = userPoints.get(id);

  if (!user) {
    res.status(404).json({
      message: `User not found`,
    });
    return;
  }

  userPoints.remove(id);
  res.status(200).json({
    message: `User ${id} deleted`,
  });
});





const userPointsStore = new UserPointsStore();

app.post("/v4/users", (req: Request, res: Response) => {
  if (!req.body.id) {
    res.status(400).json({
      message: "Email is required.",
    });
    return;
  }

  const id = req.body.id;
  const { user, statusCode } = userPointsStore.createOrGetUser(id);

  res.status(statusCode).json(user);
});

app.get("/v4/users/:id", (req: Request, res: Response) => {
  const { id } = req.params;
  const { user, statusCode, message } = userPointsStore.getUserById(id);

  if (!user) {
    res.status(statusCode).json({ message });
    return;
  }

  res.status(statusCode).json(user);
});

app.post("/v4/users/:id/increase", (req: Request, res: Response) => {
  const { id } = req.params;
  const pointsToAdd = req.body.points;
  const { user, statusCode, message } = userPointsStore.increaseUserPoints(
    id,
    pointsToAdd
  );

  if (!user) {
    res.status(statusCode).json({ message });
    return;
  }

  res.status(statusCode).json(user);
});

app.post("/v4/users/:id/decrease", (req: Request, res: Response) => {
  const { id } = req.params;
  const pointsToSubtract = req.body.points;
  const { user, statusCode, message } = userPointsStore.decreaseUserPoints(
    id,
    pointsToSubtract
  );

  if (!user) {
    res.status(statusCode).json({ message });
    return;
  }

  res.status(statusCode).json(user);
});


app.delete("/v4/users/:id", (req: Request, res: Response) => {
  const { id } = req.params;
  const { user, statusCode, message } = userPointsStore.deleteUser(id);

  if (!user) {
    res.status(statusCode).json({ message });
    return;
  }

  res.status(statusCode).json(user);
});

app.listen();
