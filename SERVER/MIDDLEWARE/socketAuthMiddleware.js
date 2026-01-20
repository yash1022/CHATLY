import jwt from 'jsonwebtoken';


const JWT_SECRET = process.env.JWT_SECRET;


const socketAuthMiddleware = (socket, next)=>{
    const token = socket.handshake.auth.token;

    if(!token)
    {
        const err = new Error("AUTHORIZATION FAILED : no access token found");
        return next(err);
    }

    let decoded;
    try {
        decoded = jwt.verify(token,JWT_SECRET);
    } catch (err) {
        return next(err);
    }

    if(!decoded)
    {const err = new Error("AUTHORIZATION FAILED : invalid accesss token");
        return next(err);
    }

    socket.userId = decoded.sub;
    next();


}

export default socketAuthMiddleware;