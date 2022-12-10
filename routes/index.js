var express = require('express');
var router = express.Router();
let  {usersModel,friendsModel,postsModel,mongoose } =require('../config/dbSchema');
let {dbName,dbUrl,mongodb}=require('../config/dbConfig')
let {hashPassword,hashCompare}=require('../config/auth')
mongoose.connect(dbUrl);

//add user(register)
router.post('/register',async(req,res)=>{
    try{
        let users=await usersModel.findOne({email:req.body.email})
        if(users){
            res.send({
                statusCode:400,
                message:"Email ID exists"
            })
        }else{
        let hashedPassword =await hashPassword(req.body.password)
        req.body.password=hashedPassword
        let users=await usersModel.create(req.body)
        res.send({
            statusCode:200,
            message:"User Registered Successfully"
        })
        }
      }catch(err){
        res.send({
            statusCode:500,
            message:"Internal Server Error"
        })
    }
})
//login
router.post('/login',async(req,res)=>{
    try{
      let users=await usersModel.findOne({email:req.body.email})
      if(users){ 
       const compare= hashCompare(req.body.password,users.password)   
       if(compare){
      res.send({
       statusCode:200,
       message:"User Login successful"
       })
      }else{
      res.send({
       statusCode:400,
       message:"Password didn't match"
       })
      }
      }else{
       res.send({
       statusCode:400,
       message:"User doesn't exist"
       })
      }
      
      
    } catch (err) {
      res.send({
        statusCode: 500,
        message: "Internal Server Error"
      })
    }
})
//forgot password
router.put('/forgot-pass/:email',async(req,res)=>{
    try{
      let users=await usersModel.findOne({email:req.params.email})
      if(users){
        if(req.body.password==req.body.userConfirmPassword){
          let hashedPassword =await hashPassword(req.body.password)
          let password=await usersModel.updateOne({email:req.params.email},{$set:{password:hashedPassword}})
          res.send({
            statusCode:200,
            message:"password Updated successfully"
          })
        }else{
          res.send({
            statusCode:400,
            message:"Password mismatch"
          })
        }
      }else{
        res.send({
          statusCode:400,
          message:"User not exist"
        })
      }
  
    }catch(err){
      res.send({
        statusCode:500,
        message:"Internal Server Error"
      })
    }
  })
//get users
router.get('/get-users',async(req,res)=>{
    try{
        let users=await usersModel.find()
        res.send({
            statusCode:200,
            message:"Users Fetched Successfully",
            users
        })
        }catch(err){
        res.send({
            statusCode:500,
            message:"Internal Server Error"
        })
    }
})
//get users names array
router.get('/get-user-names/:email',async(req,res)=>{
    try{
        let users=await usersModel.find({email: {$ne : req.params.email}})
        let userNames=[]
       if(users){
     
        users.map((e)=>{
            userNames.push(e.firstname)
        })
        res.send({
            statusCode:200,
            message:"Users Name Fetched Successfully",
            userNames,
            users
        })
    
       }
        }catch(err){
        res.send({
            statusCode:500,
            message:"Internal Server Error"
        })
    }
})
//get user by id
router.get('/get-user-by-id/:id',async(req,res)=>{
    try{
        let users=await usersModel.findOne({email:req.params.id})
        if(users){
            res.send({
                statusCode:200,
                message:"User details fetched successfully",
                users
            }) 
        }else{
            res.send({
                statusCode:400,
                message:"Provided Email not found"
            })
        }
      }catch(err){
        res.send({
            statusCode:500,
            message:"Internal Server Error"
        })
    }
})
//edit user by id
router.put('/edit-user-by-id/:id',async(req,res)=>{
    try{
        let users=await usersModel.findOne({email:req.params.id})
        if(users){
        let user=await usersModel.updateOne({email:req.params.id},{
            $set:{
                firstname:req.body.firstname,
                lastname:req.body.lastname,
                email:req.body.email,
                mobile:req.body.mobile,
                password:req.body.password,
                dob:req.body.dob,
                country:req.body.country,
                state:req.body.state,
                aboutMe:req.body.aboutMe
            }
            
        })
            res.send({
                statusCode:200,
                message:"User details updated successfully",
            }) 
        }else{
            res.send({
                statusCode:400,
                message:"Provided Id not found"
            })
        }
      }catch(err){
        res.send({
            statusCode:500,
            message:"Internal Server Error"
        })
    }
})

//add friend to login userid
router.post('/add-friend/:email',async(req,res)=>{
    try{
    let user=await usersModel.findOne({email:req.params.email})
    if(user){
     let friend=await friendsModel.create({
        userEmail:req.params.email,
        firstname:req.body.firstname,
        friendName:req.body.friendName,
        requestSent:true
     });
     res.send({
        statusCode:200,
        message:"Friend request sent successfully",
        friend
     })
    }else{
        res.send({
            statusCode:400,
            message:"Provided user not found"
        })
    }
    }catch(error){
        res.send({
            statusCode:500,
            message:"Internal Server Error"
        })
    }
})
//get friends who sent friend request
router.post('/get-friends/:email',async(req,res)=>{
    try{
 let user=await usersModel.findOne({email:req.params.email})
 if(user){
 let friends=await friendsModel.find({$and:[{friendName:req.params.email},{requestAccepted:false},{requestSent:true},{blockStatus:false}]})
 res.send({
    statusCode:200,
    message:"Friends request fetched successfully",
    friends
 })
 }else{
    res.send({
        statusCode:400,
        message:"Provided user not found"
    })
 }
    }catch(error){
        res.send({
            statusCode:500,
            message:"Internal Server Error"
        })
    }
})
//accept friend request
router.post('/accept-friend/:email',async(req,res)=>{
    try{
    let users=await usersModel.findOne({email:req.params.email})
    if(users){
    let friends=await friendsModel.updateOne({$and:[{friendName:req.params.email},{requestAccepted:false},{requestSent:true},{blockStatus:false}]},{
        $set:{
            requestAccepted:true,
            
        }
    })
     res.send({
        statusCode:200,
        message:"Friend request accepted",
        friends
     })
    }else{
        res.send({
            statusCode:400,
            message:"Provided user doesn't exist"
        })
    }
    }catch(error){
        res.send({
            statusCode:500,
            message:"Internal Server Error"
        })
    }
})
//get accepted friends list
router.post('/get-accepted-friends/:email',async(req,res)=>{
    try{
 let user=await usersModel.findOne({email:req.params.email})
 if(user){
 let friends=await friendsModel.find({$and:[{friendName:req.params.email},{requestAccepted:true},{requestSent:true},{blockStatus:false}]})
 res.send({
    statusCode:200,
    message:" Accepted Friends fetched successfully",
    friends
 })
 }else{
    res.send({
        statusCode:400,
        message:"Provided user not found"
    })
 }
    }catch(error){
        res.send({
            statusCode:500,
            message:"Internal Server Error"
        })
    }
})
//unfriend user
router.post('/unfriend/:email',async(req,res)=>{
    try{
 let user=await usersModel.findOne({email:req.params.email})
 if(user){
 let friends=await friendsModel.updateOne({$and:[{friendName:req.params.email},{requestAccepted:true}]},{
    $set:{
        requestAccepted:false,
        requestSent:false
    }
 })
 res.send({
    statusCode:200,
    message:" Unfriend successfully",
    
 })
 }else{
    res.send({
        statusCode:400,
        message:"Provided user not found"
    })
 }
    }catch(error){
        res.send({
            statusCode:500,
            message:"Internal Server Error"
        })
    }
})
//block friend
router.post('/block/:email',async(req,res)=>{
    try{
 let user=await usersModel.findOne({email:req.params.email})
 if(user){
 let friends=await friendsModel.updateOne({$and:[{friendName:req.params.email},{requestAccepted:true},{blockStatus:false}]},{
    $set:{
       blockStatus:true
    }
 })
 res.send({
    statusCode:200,
    message:" Unfriend successfully",
    
 })
 }else{
    res.send({
        statusCode:400,
        message:"Provided user not found"
    })
 }
    }catch(error){
        res.send({
            statusCode:500,
            message:"Internal Server Error"
        })
    }
})



//post something by login user
router.post('/post/:email',async(req,res)=>{
    try{
let users=await usersModel.findOne({email:req.params.email})
if(users){
let posts=await postsModel.create({
    postedUser:req.params.email,
    postContent:req.body.postContent,
    postImage:req.body.postImage
})
res.send({
    statusCode:200,
    message:"user posted successfully"
})
}else{
    res.send({
        statusCode:400,
        message:"Provided user not found"
    })
}
    }catch(err){
        res.send({
            statusCode:500,
            message:"Internal Server Error"
        })
    }
})
//get login user posts
router.post('/get-my-posts/:email',async(req,res)=>{
    try{
   let users=await usersModel.findOne({email:req.params.email})
   if(users){
   let posts=await postsModel.find({postedUser:req.params.email})
   if(posts){
    res.send({
        statusCode:200,
        message:"my posts fetched successfully",
        posts
    })
   }
   }else{
    res.send({
        statusCode:400,
        message:"Provided user not found"
    })
   }
    }catch(err){
        res.send({
            statusCode:500,
            message:"Internal Server Error"
        })
    }
})
//get friend details by email id
router.post('/get-friend-detail/:email',async(req,res)=>{
    try{
let friend=await usersModel.find({email:req.params.email})
let posts=await postsModel.find({postedUser:req.params.email})
if(friend){
    res.send({
        statusCode:200,
        message:"Details fetched Successfully",
        friend,
        posts
    })
}
    }catch(err){
        res.send({
            statusCode:500,
            message:"Internal Server Error"
        })
    }
})

module.exports = router;
