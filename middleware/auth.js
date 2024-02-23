const JWT = require('jsonwebtoken');

exports.verifyLogin = (req, res, next) => {
    const token = req.headers['authorization'];
    if(!token) return res.status(401).json({ msg: "please login" });
  try{
    const decoded = JWT.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.id;
    next();
  }catch(err){
    return res.status(401).json({ msg: "Invalid token" });
  }
    
};