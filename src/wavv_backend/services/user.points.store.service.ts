import { StableBTreeMap } from "azle";

type User = {
  points: number;
  id?: string;
};

const USER_POINTS = StableBTreeMap<string, User>(0);

export default class UserPointsStore {
  userPoints: typeof USER_POINTS;

  constructor() {
    this.userPoints = USER_POINTS;
  }

  /**
   * Creates a new user or retrieves an existing user
   * @param id User identifier
   * @returns The user object and status code
   */
  createOrGetUser(id: string): { user: User | null; statusCode: number } {
    if (!id) {
      return { user: null, statusCode: 400 };
    }

    const user = this.userPoints.get(id);

    if (!user) {
      const newUser: User = {
        points: 0,
        id
      };
      
      this.userPoints.insert(id, newUser);
      return { user: newUser, statusCode: 201 };
    }

    return { user, statusCode: 200 };
  }

  /**
   * Retrieves a user by their ID
   * @param id User identifier
   * @returns The user object and status code
   */
  getUserById(id: string): { user: User | null; statusCode: number; message?: string } {
    const user = this.userPoints.get(id);

    if (!user) {
      return { 
        user: null, 
        statusCode: 404, 
        message: "User not found" 
      };
    }

    return { user, statusCode: 200 };
  }

  /**
   * Validates points input
   * @param points Points to validate
   * @returns Whether points are valid and error message if not
   */
  validatePoints(points: any): { valid: boolean; message?: string } {
    if (typeof points !== "number" || points <= 0) {
      return {
        valid: false,
        message: "Points must be a positive number"
      };
    }
    return { valid: true };
  }

  /**
   * Increases a user's points
   * @param id User identifier
   * @param pointsToAdd Points to add
   * @returns Updated user object and status code
   */
  increaseUserPoints(id: string, pointsToAdd: any): 
    { user: User | null; statusCode: number; message?: string } {
    
    const { user, statusCode, message } = this.getUserById(id);
    
    if (!user) {
      return { user: null, statusCode, message };
    }

    const validation = this.validatePoints(pointsToAdd);
    if (!validation.valid) {
      return { 
        user: null, 
        statusCode: 400, 
        message: validation.message 
      };
    }

    const updatedUser: User = {
      ...user,
      points: user.points + pointsToAdd,
    };

    this.userPoints.insert(id, updatedUser);
    return { user: updatedUser, statusCode: 200 };
  }

  /**
   * Decreases a user's points
   * @param id User identifier
   * @param pointsToSubtract Points to subtract
   * @returns Updated user object and status code
   */
  decreaseUserPoints(id: string, pointsToSubtract: any): 
    { user: User | null; statusCode: number; message?: string } {
    
    const { user, statusCode, message } = this.getUserById(id);
    
    if (!user) {
      return { user: null, statusCode, message };
    }

    const validation = this.validatePoints(pointsToSubtract);
    if (!validation.valid) {
      return { 
        user: null, 
        statusCode: 400, 
        message: validation.message 
      };
    }

    const updatedUser: User = {
      ...user,
      points: user.points - pointsToSubtract,
    };

    this.userPoints.insert(id, updatedUser);
    return { user: updatedUser, statusCode: 200 };
  }
}
