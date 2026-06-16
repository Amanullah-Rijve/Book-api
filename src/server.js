import express from 'express';
import dotenv from 'dotenv';
import bookRoutes from './routes/book.routes.js';

dotenv.config();

const app = express(); // app defined

// midlleware
app.use(express.json({limit:'10kb'}));  // seted the limitation of the middleware

// routers
app.use('/api/books',bookRoutes); // calling the book routes

// 404 hhandle
app.use((req,res)=>{
    res.status(404).json({
        success: false,
        message: 'route error' // if user/url error finds this method will catch it
    });
});

// Error handeler
app.use((err,req,res,next)=>{
    const statusCode = res.statusCode != 200 ? res.statusCode :500;
    res.status(statusCode).json({
        success:false,
        message:err.message,
        stack: process.env.NODE_ENV === 'production'? null :err.stack //useing env fill too catch err dynamic err
    });
});

// runnig the server
const PORT = process.env.PORT || 3000;
app.listen(PORT,()=>{
    console.log(` Server: http://localhost:${PORT}`);
    
});