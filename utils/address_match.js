const City = require("../models/all _cities");
const State = require("../models/all_states");

async function matchAddress(givenCity,givenState){
    const state = await State.findOne({where:{
        state: givenState
    }})
    if (state===null) {
        throw new Error("Invalid State")
    }
    const city = await City.findOne({where:{
        city: givenCity
    }})
    if (city===null) {
        throw new Error("Invalid City")
    }
    if (city.stateId !== state.id) {
        throw new Error("City and State Mismatch")
    }
    return {state:state.id, city:city.id}
}
module.exports = matchAddress