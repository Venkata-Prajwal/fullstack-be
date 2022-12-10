const mongoose = require('mongoose')
const validator = require('validator')

var usersSchema = new mongoose.Schema({
  firstname: { type: 'string', required: true },
  lastname: { type: 'string', required: true },
  email: {
    type: 'string',
    required: true,
    lowercase: true,
    validate: (value) => {
      return validator.isEmail(value)
    }
  },
  mobile: { type: 'string', default: "000-000-0000" },
  password: { type: 'string', required: true },
  dob: { type: 'string' },
  country: { type: 'string' },
  state: { type: 'string' },
  aboutMe: { type: 'string' },
 })

var friendsSchema = new mongoose.Schema({
   userEmail:{type:'string',required:true},
   firstname:{type:'string'},
   friendName:{type:'string'},
   requestSent:{type:'boolean',default:false},
   requestRecieved:{type:'boolean',default:false},
   requestAccepted:{type:'boolean',default:false},
   blockStatus:{type:'boolean',default:false},
   
})

var postsSchema=new mongoose.Schema({
  postedUser:{type:'string',required:true},
  postContent:{type:'string'},
  postImage:{type:'string'},
  // postedAt:{ $type: "timestamp" }
})

let usersModel = mongoose.model('users', usersSchema)
let friendsModel = mongoose.model('friends', friendsSchema)
let postsModel=mongoose.model('posts',postsSchema)
module.exports = { usersModel,friendsModel,postsModel, mongoose }
