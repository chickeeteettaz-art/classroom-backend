import express from "express";

import {classes} from "../schema";
import {db} from "../index.js";

const router = express.Router();
router.post("/", async (req, res) => {
    try {
        console.log(req.body)


        const [createdClass] = await db
            .insert(classes)
            .values({
            ...req.body,
            inviteCode:Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 9),
            schedules:[]})
            .returning({id:classes.id})

        if(!createdClass) throw Error("Failed to create class")

        res.status(201).json({data:createdClass});

    }catch (error) {
        console.error("POST /classes error:", error);
        res.status(500).json({ error: "Failed to create class" });
    }
})
export default router;