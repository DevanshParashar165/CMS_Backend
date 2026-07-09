import { Clinic } from "../models/clinic.model.js";

export const registerClinic = async(req,res) => {
    try {
        const {
            name,
            registration_number,
            gst_number,
            address1,
            address2,
            city,
            state,
            country,
            pin_code,
            owner,
            ownership_type,
            country_code,
            contact_number,
        } = req.body;
        if(!name || !registration_number || !gst_number || !address1 || !city || !state || !country || !pin_code || !owner || !ownership_type || !country_code || !contact_number){
            return res.status(404)
                      .json({message : 'All fields are required'});
        }
        const clinic = await Clinic.create({
            name,
            registration_number,
            gst_number,
            address1,
            address2,
            city,
            state,
            country,
            pin_code,
            owner,
            ownership_type,
            country_code,
            contact_number
        })
        if(!clinic){
            return res.status(400)
                      .json({message : 'Error while registering clinic'});
        }
        return res.status(201)
                  .json({message : 'Clinic registered successfully',clinic});
    } catch (error) {
        console.log('Error : ',error);
        return res.status(400)
                  .json({message : error.message})
    }
}
