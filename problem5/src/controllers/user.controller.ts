import type { Request, Response } from "express";
import { userService } from "../services/user.service.js";

export class UserController {
  async create(req: Request, res: Response) {
    try {
      const { name, type } = req.body;

      if (!name || typeof name !== "string") {
        res.status(400).json({ error: "Name is required and must be a string" });
        return;
      }

      const user = await userService.create({ name, type });
      res.status(201).json(user);
    } catch (error) {
      console.error("Error creating user:", error);
      res.status(500).json({ error: "Failed to create user" });
    }
  }

  async findAll(req: Request, res: Response) {
    try {
      const { name, type, limit, offset } = req.query;

      const users = await userService.findAll({
        name: name ? String(name) : undefined,
        type: type ? String(type) : undefined,
        limit: limit ? parseInt(String(limit), 10) : undefined,
        offset: offset ? parseInt(String(offset), 10) : undefined,
      });

      res.json(users);
    } catch (error) {
      console.error("Error listing users:", error);
      res.status(500).json({ error: "Failed to list users" });
    }
  }

  async findById(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id, 10);
      const user = await userService.findById(id);

      if (!user) {
        res.status(404).json({ error: "User not found" });
        return;
      }

      res.json(user);
    } catch (error) {
      console.error("Error getting user:", error);
      res.status(500).json({ error: "Failed to get user" });
    }
  }

  async update(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id, 10);
      const { name, type } = req.body;

      const existingUser = await userService.findById(id);
      if (!existingUser) {
        res.status(404).json({ error: "User not found" });
        return;
      }

      const user = await userService.update(id, { name, type });
      res.json(user);
    } catch (error) {
      console.error("Error updating user:", error);
      res.status(500).json({ error: "Failed to update user" });
    }
  }

  async delete(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id, 10);

      const existingUser = await userService.findById(id);
      if (!existingUser) {
        res.status(404).json({ error: "User not found" });
        return;
      }

      await userService.delete(id);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting user:", error);
      res.status(500).json({ error: "Failed to delete user" });
    }
  }
}

export const userController = new UserController();

