'use strict';
const Joi = require('joi');
module.exports = function(Validator) {

    const teacherHomeList = Joi.object().keys({
    user_id: Joi.string().required(),
    // password: Joi.string().regex(/^[a-zA-Z0-9]{3,30}$/),
    // access_token: [Joi.string(), Joi.number()],
    // birthyear: Joi.number().integer().min(1900).max(2013),
    // email: Joi.string().email({ minDomainAtoms: 2 })
});

Validator.validaterequest = function(jsonobj,validfor)
{
    Joi.validate({user_id:""}, validfor, function (err, value) {

        console.log(err);
        //console.log(value);
     });
}

};
