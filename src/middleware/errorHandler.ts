// import { Response } from "express";
// import { BAD_REQUEST, INTERNAL_SERVER_ERROR } from "../constants/http";
// import { z } from "zod";
 
// const handleZodError = (res: Response, err: z.ZodError) => {
//     const errors = err.issues.map((error) => ({
//         path: error.path.join("."),
//         message: error.message
//     }));
    
//     return res.status(BAD_REQUEST).json({
//         message: err.message, errors
//     });
// };


// const errorHandler: any = (err: any, req: any, res: any) => {
//     console.log(`PATH: ${req.path}`, err);

//     if (err instanceof z.ZodError) {
//         return handleZodError(res, err);
//     }

//     return res.status(INTERNAL_SERVER_ERROR).send("Internal Server Error");
// }

// export default errorHandler;
