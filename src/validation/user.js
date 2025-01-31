import Joi from "joi"
import { genderList } from "../constants/user.js"

export const userInfo = Joi.object({
    email: Joi.string(),
    password: Joi.string().min(8).max(64),
    oldPassword: Joi.string().min(6).max(64),
    gender: Joi.string().valid(...genderList),
    name: Joi.string().max(32)
})

// email	поле повинно містити валідний емейл
// password	поле повинно містити мінімум 8 символів, максимум 64
// oldPassword	поле повинно містити мінімум 8 символів, максимум 64
// gender	поле повинно містити одне із двох значень: male, female
// name	поле повинно містити максимум 32 символи