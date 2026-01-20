import User from "../MODEL/Users.js";
import Message from "../MODEL/Message.js";


export const getAllUsers = async(req, res)=>{

    try{

       // FIND ALL USERS EXCEPT THE CURRENT USER AND INCLUDE ONLY _ID , NAME , USERNAME , BIO , PPURL

         const users = await User.find(
            { _id: { $ne: req.user._id } },
            { _id: 1, name: 1, username: 1, bio: 1, ppUrl: 1, publicKey: 1 }
        );
            res.json(users);
           

    }
    catch(err)
    {
        res.status(500).json({message:'Server error'});
    }

}

export const getMessagesBetweenUsers = async(req,res)=>{
    try{
        const recieverId = req.query.recieverId;
        const senderId = req.user._id;

        // VALIDATE RECIEVER ID
        if(!recieverId)
        {
            return res.status(400).json({message:'Reciever ID is required'});
        }

        // FETCH MESSAGES WHERE (SENDER IS CURRENT USER AND RECIEVER IS THE OTHER USER) OR (SENDER IS THE OTHER USER AND RECIEVER IS CURRENT USER)
        const messages = await Message.find({
            $or: [
                { sender: senderId, reciever: recieverId },
                { sender: recieverId, reciever: senderId }
            ]
        }).sort({ createdAt: 1 }); // SORT BY CREATED AT ASCENDING

        res.json(messages);

    }
    catch(err)
    {
        res.status(500).json({message:'Server error'});
    }
}

export const getSearchedUser = async(req,res)=>{
    try{

        const {mode,query} = req.query;

        console.log("MODE:",mode,"QUERY:",query);

        if(!mode || !query)
        {
            return res.status(400).json({message:"MODE AND QUERY ARE REQUIRED"});
        }

        if(mode == 'email')
        {
            const user = await User.findOne({email:query},{
                _id:1,
                name:1,
                email:1,
                username:1,
                bio:1,
                ppurl:1,
                publicKey:1


            })

            return res.json(user);
        }

         if(mode == 'username')
        {
           
            const user = await User.findOne({username:query},{
                 _id:1,
                name:1,
                email:1,
                username:1,
                bio:1,
                ppurl:1,
                publicKey:1

            })

            console.log("USER FOUND BY USERNAME:",user.name);

            
            return res.json(user);
        }
}
    catch(err)
    {
        res.status(500).json({message:'SERVER ERROR'});
    }
}

