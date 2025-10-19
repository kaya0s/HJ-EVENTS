import {Schema,model} from 'mongoose'

const activityLogSchema = new Schema({
    actor:{
        type: Schema.Types.ObjectId,
        ref:'user',
        required:false
    },
    actorName:{
        type:String,
        default:''
    },
    action:{
        type:String,
        required:true
    },
    details:{
        type:String,
        default:''
    }
},{timestamps:true})

const ActivityLog = model('ActivityLog',activityLogSchema)
export default ActivityLog