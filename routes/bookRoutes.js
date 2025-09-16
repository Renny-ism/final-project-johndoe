import { Router } from "express";
const router = Router();

router.get("/getbook", (req, res) => res.send("GET from external file"));
router.post("/uploadbook", (req, res) => res.send("Post from external file"));

export default router;