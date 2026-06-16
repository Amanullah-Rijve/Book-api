import { Router } from "express";
import pool from "../config/db.js";

const router = Router();

// Resuable middleware
const findbook = async (req,res,next)=>{
    try {
        const [rows]=await pool.query(
            'SELECT * FROM books WHERE id=?', // reading all data form the db book table
            [req.params.id] // dynamic id
        );

        if(rows.length ===0){
            return res.status(404).json({
            success: false,
            message: "Book not found"
            });
        };

        req.book = rows[0]
        next();

    } catch (error) {
        next(error);
    };
};

//  routers

//  Get all books
router.get('/',async(req,res,next)=>{
    try {
        const [rows]= await pool.query(
            'SELECT * FROM books ORDER BY created_at DESC'
        );

        res.status(200).json({
            success: true,
            count: rows.length,
            data: rows
        });

    } catch (error) {
        next(error);
    }
});

// Get book individually
router.get('/:id',findbook,(req,res)=>{
    res.status(200).json({
        success:true,
        data: req.book
    });
});

//  add book
router.post('/',async(req,res,next)=>{
    try {
        const {title,author,quantity} = req.body;

        // validation
        if(!title ||!author ||!quantity){
            return res.status(400).json({
                success: false,
                message: "title author quantity must be added"
            });
        };
        // quantity validation
        if(quantity<1){
            res.status(400).json({
                success: false,
                message: 'quantitiy minimum 1 needed'
            });
        };
        //  adding into database
        const [result] = await pool.query(
            'INSERT INTO book (title,author,quantity) VALUES (?,?,?)',
            [title,author,quantity]
        );

        //  successfull added 
        res.status(201).json({
            success: true,
            message: 'new book added',
            data:{
                id: result.insertId,
                title,author,quantity
            }
        });

    } catch (error) {
        next(error);
    }
});

//  update book
router.put('/:id',findbook, async(req,res,next)=>{
    try {
        const {title,author,quantity} = req.body
        // validation
        if(!title||!author||quantity){
            return res.status(400).json({
                success: false,
                message: "title,author quantity needed"
            });
        };
        // db query
        await pool.query(
            'UPDATE books SET title = ?,author =?,quantity = ? WHERE id=?',
            [title,author,quantity,req.body.id]
        );

        // success message
        res.status(200).json({
            success: true,
            message: "Book updated successfully",
            data:{id: req.book.id,title,author,quantity}
        });

    } catch (error) {
        next(error);
    }
});

// update quantity
router.patch('/:id',findbook,async(req,res,next)=>{
    try {
        const [quantitiy]= req.body
        // validation
        if(!quantitiy){
            return res.status(400).json({
                success: false,
                message: 'give quantity'
            });
        };
        // must be 1 quantity validation
        if(quantitiy<1){
            return res.status(400).json({
                success: false,
                message: 'quantitiy must be aleast 1'
            });
        };
        // calling db querry
        await pool.query(
            'UPDATE books SET quantity =? WHERE id= ?'
            [quantitiy,req.book.id]
        );
        // success message
        res.status(200).json({
            success: true,
            message: "Quantity updated",
            data: {...req.book,quantitiy}
        });
    } catch (error) {
        next(error);
    }
});

// Delete data
router.data('/:id',findbook,async(req,res,next)=>{
    try {
        await pool.query(
            'DELETE FROM books WHERE id=?',
            [req.body.id]
        )

        res.status(200).json({
        success: true,
        message: 'Book deleted'
    });
    } catch (error) {
        next(error);
    }
});

export default router;