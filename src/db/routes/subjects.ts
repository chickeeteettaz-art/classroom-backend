import express from 'express';
import {and, count, desc, eq, getTableColumns, ilike, or, sql} from "drizzle-orm";
import {departments, subjects} from "../schema/index.js";
import {db} from '../../db/index.js'

const router = express.Router();

router.get("/", async (req, res) => {
    try {
        const { search, department, page = 1, limit = 10 } = req.query;

        const currentPage = Math.max(1, parseInt(String(page), 10) || 1);
        const limitPerPage = Math.max(1, Math.min(100, parseInt(String(limit), 10) || 10));
        const offset = (currentPage - 1) * limitPerPage;

        const filterConditions = [];

        if (search) {
            filterConditions.push(
                or(
                    ilike(subjects.name, `%${search}%`),
                    ilike(subjects.code, `%${search}%`)
                )
            );
        }

        if (department) {
            filterConditions.push(ilike(departments.name, `%${department}%`));
        }

        const whereClause =
            filterConditions.length > 0 ? and(...filterConditions) : undefined;

        // Count query MUST include the join

        const countResult = await db
            .select({ count: count() })
            .from(subjects)
            .leftJoin(departments, eq(subjects.departmentId, departments.id))
            .where(whereClause);

        const totalCount = countResult[0]?.count ?? 0;

        // Data query
        const subjectsList = await db
            .select({
                ...getTableColumns(subjects),
                department: {
                    ...getTableColumns(departments),
                },
            })
            .from(subjects)
            .leftJoin(departments, eq(subjects.departmentId, departments.id))
            .where(whereClause)
            .orderBy(desc(subjects.createdAt))
            .limit(limitPerPage)
            .offset(offset);

        res.status(200).json({
            data: subjectsList,
            pagination: {
                page: currentPage,
                limit: limitPerPage,
                total: totalCount,
                totalPages: Math.ceil(totalCount / limitPerPage),
            },
        });
    } catch (error) {
        console.error("GET /subjects error:", error);
        res.status(500).json({ error: "Failed to fetch subjects" });
    }
});

router.get("/:id", async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        if (isNaN(id)) return res.status(400).json({ error: "Invalid ID" });

        const [foundSubject] = await db
            .select({
                ...getTableColumns(subjects),
                department: { ...getTableColumns(departments) }
            })
            .from(subjects)
            .leftJoin(departments, eq(subjects.departmentId, departments.id))
            .where(eq(subjects.id, id));

        if (!foundSubject) return res.status(404).json({ error: "Subject not found" });
        res.status(200).json({ data: foundSubject });
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch subject" });
    }
});

router.post("/", async (req, res) => {
    try {
        const [newSubject] = await db.insert(subjects).values(req.body).returning();
        res.status(201).json({ data: newSubject });
    } catch (error) {
        res.status(500).json({ error: "Failed to create subject" });
    }
});

router.put("/:id", async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        if (isNaN(id)) return res.status(400).json({ error: "Invalid ID" });

        const [updatedSubject] = await db
            .update(subjects)
            .set(req.body)
            .where(eq(subjects.id, id))
            .returning();
        if (!updatedSubject) return res.status(404).json({ error: "Subject not found" });
        res.status(200).json({ data: updatedSubject });
    } catch (error) {
        res.status(500).json({ error: "Failed to update subject" });
    }
});

router.delete("/:id", async (req, res) => {
    try {
        const id = parseInt(req.params.id);
        if (isNaN(id)) return res.status(400).json({ error: "Invalid ID" });

        const [deletedSubject] = await db
            .delete(subjects)
            .where(eq(subjects.id, id))
            .returning();
        if (!deletedSubject) return res.status(404).json({ error: "Subject not found" });
        res.status(200).json({ data: deletedSubject });
    } catch (error) {
        res.status(500).json({ error: "Failed to delete subject" });
    }
});
export default router;