import User from "../model/Users.js";
import Message from "../model/Message.js";
import ConversationKey from "../model/ConversationKey.js";


export const getAllUsers = async(req, res)=>{

    try{

       // FIND ALL USERS IN CURRENT USER'S CONTACTS ARRAY INCLUDE ONLY _ID , NAME , USERNAME , BIO , PPURL

         const users = await User.find({_id:{$in:req.user.contacts}},{_id:1,name:1,username:1,bio:1,ppurl:1,publicKey:1});
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

export const addToContacts = async(req,res)=>{
    try{
        const {contactId} =  req.body;
        const senderId = req.user._id;

        console.log("ADDING TO CONTACTS:",contactId);
        console.log("SENDER ID:",senderId);



        if(!contactId)
        {
            return res.status(400).json({message:"CONTACT ID IS REQUIRERD"});
        }

        // ADD CONTACT ID TO CURRENT USER'S CONTACTS ARRAY IF NOT ALREADY PRESENT

        await User.findByIdAndUpdate(senderId,{
            $addToSet:{contacts:contactId}

        })

        await User.findByIdAndUpdate(contactId,{
            $addToSet:{contacts:senderId}
        })

        // SET CONVERSTATION KEY ISUSED TO TRUE IF EXISTS

        await ConversationKey.findOneAndUpdate({
            senderId: senderId,
            recieverId: contactId
        },{
            isUsed: true    
        })

        await ConversationKey.findOneAndUpdate({
            senderId: contactId,
            recieverId: senderId
        },{
            isUsed: true    
        })

        console.log("CONTACT ADDED TO CONTACTS LIST");

        res.json({message:"CONTACT ADDED SUCCESSFULLY"});



    }
    catch(err)
    {
        res.status(500).json({message:"SERVER ERROR"});
    }
}


