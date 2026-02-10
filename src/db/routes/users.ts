import express from 'express';
import {and, count, desc, eq, getTableColumns, ilike, or, sql} from "drizzle-orm";
import {user} from "../schema/index.js";
import {db} from '../../db/index.js'

const router = express.Router();

router.get("/", async (req, res) => {
    try {
        const { search, role, page = 1, limit = 10 } = req.query;

        const currentPage = Math.max(1, parseInt(String(page), 10) || 1);
        const limitPerPage = Math.max(1, Math.min(100, parseInt(String(limit), 10) || 10));
        const offset = (currentPage - 1) * limitPerPage;

        const filterConditions = [];

        if (search) {
            filterConditions.push(
                or(
                    ilike(user.name, `%${search}%`),
                    ilike(user.email, `%${search}%`)
                )
            );
        }

        if (role) {
            filterConditions.push(eq(user.role, role as any));
        }

        const whereClause =
            filterConditions.length > 0 ? and(...filterConditions) : undefined;

        // Count query
        const countResult = await db
            .select({ count: count() })
            .from(user)
            .where(whereClause);

        const totalCount = countResult[0]?.count ?? 0;

        // Data query
        const usersList = await db
            .select({
                ...getTableColumns(user),
            })
            .from(user)
            .where(whereClause)
            .orderBy(desc(user.createdAt))
            .limit(limitPerPage)
            .offset(offset);

        res.status(200).json({
            data: usersList,
            pagination: {
                page: currentPage,
                limit: limitPerPage,
                total: totalCount,
                totalPages: Math.ceil(totalCount / limitPerPage),
            },
        });
    } catch (error) {
        console.error("GET /users error:", error);
        res.status(500).json({ error: "Failed to fetch users" });
    }
});

router.get("/:id", async (req, res) => {
    try {
        const [foundUser] = await db.select().from(user).where(eq(user.id, req.params.id));
        if (!foundUser) return res.status(404).json({ error: "User not found" });
        res.status(200).json({ data: foundUser });
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch user" });
    }
});

router.put("/:id", async (req, res) => {
    try {
        const [updatedUser] = await db
            .update(user)
            .set(req.body)
            .where(eq(user.id, req.params.id))
            .returning();
        if (!updatedUser) return res.status(404).json({ error: "User not found" });
        res.status(200).json({ data: updatedUser });
    } catch (error) {
        res.status(500).json({ error: "Failed to update user" });
    }
});

router.delete("/:id", async (req, res) => {
    try {
        const [deletedUser] = await db
            .delete(user)
            .where(eq(user.id, req.params.id))
            .returning();
        if (!deletedUser) return res.status(404).json({ error: "User not found" });
        res.status(200).json({ data: deletedUser });
    } catch (error) {
        res.status(500).json({ error: "Failed to delete user" });
    }
});

export default router;
