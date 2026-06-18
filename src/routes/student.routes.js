import { Router } from "express";
import pool from "../config/db.js";

const router = Router();

// Middleware
const findStu = async (req,res,next)=>{
try {
    const [rows]= await pool.query(
        'SELECT * FROM student_practice where id=?'
        [req.params.id]
    )
    // row validation
    if(rows.length ===0){
        return res.status(404).json({
            success: false,
            message: "Student Not Found"
        });
    }
    req.student = rows[0];
    next();
} catch (error) {
    next(error);
};
};
// Routers

// Get Route
router.get('/',async(req,res,next)=>{
    try {
        const rows = await pool.query(
            'SELECT * FROM students ORDER BY created_at DESC',
        )
        // success
        return res.status(200).json({
            success: true,
            count: rows.length,
            data: rows
        })
    } catch (error) {
        next(error);
    }
});
// Get by id
router.get('/:id',findStu,(req,res)=>{
    return res.status(200).json({
        success: true,
        data: req.student
    });
});
// post data
router.post('/',async(req,res,next)=>{
    try {
        const {name,email,department,cgpa}= req.body
    // validation
    if(!name||!email||!department||cgpa){
        return res.status(400).json({
            success: false,
            message: "missing data"
        });
    };
    //  cgpa validation
    if(cgpa <0|| cgpa>=4){
        return res.status(400).json({
            success: false,
            message: "cgpa problem"
        });
    };
    // db query
    const [result] = await pool.query(
        "INSERT INTO students (name,email,department,cgpa) VALUES (?,?,?,?) ",
        [name,email,department,cgpa]
    )
    return res.status(201).json({
        success: true,
        message: 'new student data added',
        data:{
            id: result.insertId,
            name,email,department,cgpa
        }
    });

    } catch (error) {
        next(error);
    }
});
// update all
router.put('/:id',findStu,async(req,res,next)=>{
    try {
        const {name,email,department,cgpa}=req.body
        // validation
        if(!name||!email||!department||!cgpa){
            return res.status(400).json({
                success: false,
                message: 'data error'
            });
        };
        // dp qurry
        await pool.query(
            'UPDATE students SET name = ?,email=?,department =?,cgpa=? WHERE id=?',
            [name,email,department,cgpa ,req.body.id]
        )
        // success
        return res.status(200).json({
            success: true,
            message: ' updated successfull',
            data : {id: req.body.id,name,email,department,cgpa}
        });
    } catch (error) {
        next(error);
    }
});
// update cgpa
router.patch('/:id',findStu,async(req,res,next)=>{
    try {
        const {cgpa}= req.body;
        // validation
        if(!cgpa){
            return res.status(400).json({
                success: false,
                message: "data not found"
            });
        };
        // cgpa point validation
        if(cgpa>0 || cgpa<4){
            return res.status(400).json({
                success: false,
                message: 'cgpa invalid'
            });
        };
        // db query
        await pool.query(
            'UPDATE student SET cgpa =? WHERE id=?',
            [cgpa,req.id.params]
        )
        // success
        res.status(200).json({
            success: true,
            message: "cgpa updated",
            data: {...req.student,cgpa}
        });
    } catch (error) {
        next(error);
    }
});
//  delete data
router.delete('/:id',findStu,async(req,res,next)=>{
    try {
        await pool.query(
            'DELETE * FROM students WHERE id=?'
            [req.body.id]
        )
        res.status(200).json({
        success: true,
        message: 'student deleted'
    });
    } catch (error) {
        next(error);
    }
});

export default router;

