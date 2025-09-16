/*
import { Router } from "express";

const router = Router();
const app = express();

app.use(express.json());
app.use("/books", bookRoutes);
*/
import express from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";


dotenv.config();
const app = express();
app.use(express.json());
/*
function checkStudentName(req, res, next){
    const {studentName} = req.body;
    if (!studentName) {
        return resn 
        .status(400)
        .json({error: "Please enter your name to check in"});
    }
    next();
}

app.post("/checkin", checkStudentName, (req, res) => {
    const { studentName } = req.body;
    res.json({message: `Welcome ${studentName}! Your attendance is marked`});
});
*/
const students = [];
const subjects = [];
let baseid = 1;
const JWT_SECRET = process.env.JWT_SECRET;


app.post("/register", async (req, res) => {
    const { username, password, fname, lname, age } = req.body;

    if (students.find((u) => u.username === username)) {
        return res.status(400).json({ error: "Username already taken!" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    students.push({ id: baseid++, username, password: hashedPassword, fname, lname, age });

    res.status(201).json({ message: "User successfully created!" });
});

app.post("/login", async (req, res) => {
    const { username, password } = req.body;
    const student = students.find((u) => u.username === username);
    if (!student) return res.status(401).json({ error: "User not found" });

    const valid = await bcrypt.compare(password, student.password);
    if (!valid) return res.status(401).json({ error: "Wrong password" });

    const token = jwt.sign({ username: student.username }, process.env.JWT_SECRET, {
        expiresIn: "1h",
    });

    res.json({
        message: `Login successfully. Welcome ${student.fname} ${student.lname}!, your ID is: ${student.id}`,
        token: token
    });
});

const authenticateJWT = (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
        return res.status(401).json({ message: "Authorization header missing" });
    }

    const token = authHeader.split(" ")[1];
    if (!token) {
        return res.status(401).json({ message: "Token missing" });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded; // keep it as req.user (not req.student)
        next();
    } catch (error) {
        return res.status(403).json({ message: "Invalid or expired token" });
    }
};

app.post("/addsub", authenticateJWT, (req, res) => {
    const { sub1, sub2, sub3 } = req.body;

    const student = students.find((u) => u.username === req.user.username);
    if (!student) {
        return res.status(404).json({ error: "User not found" });
    }

    subjects.push({ id: student.id, sub1, sub2, sub3 });

    res.json({
        message: `Subjects added for ${student.fname} ${student.lname}`,
    });
});

app.post("/findsub", (req, res) => {
    const { id } = req.body;
    const studentSubs = subjects.find((u) => u.id === id);

    if (!studentSubs) {
        return res.status(404).json({ error: "Invalid ID" });
    }

    res.json({ subjects: studentSubs });
});

app.listen(3000, () => {
    console.log("Server running at localhost 3000");
});

