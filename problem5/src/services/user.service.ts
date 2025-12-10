import prisma from "../lib/prisma.js";
import type { CreateUserDto, UpdateUserDto, UserFilters } from "../models/user.model.js";

export class UserService {
  async create(data: CreateUserDto) {
    return prisma.user.create({
      data: {
        name: data.name,
        type: data.type ?? null,
      },
    });
  }

  async findAll(filters: UserFilters) {
    return prisma.user.findMany({
      where: {
        ...(filters.name && { name: { contains: filters.name } }),
        ...(filters.type && { type: filters.type }),
      },
      ...(filters.limit !== undefined && { take: filters.limit }),
      ...(filters.offset !== undefined && { skip: filters.offset }),
      orderBy: { createdAt: "desc" },
    });
  }

  async findById(id: number) {
    return prisma.user.findUnique({
      where: { id },
    });
  }

  async update(id: number, data: UpdateUserDto) {
    return prisma.user.update({
      where: { id },
      data: {
        ...(data.name !== undefined && { name: data.name }),
        ...(data.type !== undefined && { type: data.type }),
      },
    });
  }

  async delete(id: number) {
    return prisma.user.delete({
      where: { id },
    });
  }
}

export const userService = new UserService();

